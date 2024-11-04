import { JWT_SECRET } from './../../src/auth/constants';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'; // Import DynamoDB
import * as path from 'path';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a Cognito User Pool
    const userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'MyUserPool',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
    });

    // Create a DynamoDB table for events
    const eventTable = new dynamodb.Table(this, 'EventTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      tableName: 'Events', // You can customize the table name
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Use appropriate removal policy
    });

    // Lambda function for NestJS application
    const nestJsLambda = new lambda.Function(this, 'NestJsFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'main.handler',
      code: lambda.Code.fromAsset('./dist'),
      environment: {
        JWT_SECRET: JWT_SECRET,
        USER_POOL_ID: userPool.userPoolId,
      },
    });

    // IAM policy for accessing Cognito
    const policy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'cognito-idp:ListUsers',
        'cognito-idp:GetUser',
        'cognito-idp:AdminGetUser',
        'cognito-idp:AdminCreateUser',
        'cognito-idp:AdminDeleteUser',
      ],
      resources: [userPool.userPoolArn],
    });

    nestJsLambda.addToRolePolicy(policy);

    // Lambda function for event handling
    const eventHandlerLambda = new lambda.Function(this, 'EventHandlerFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'event.handler', // Update with your event handling entry point
      code: lambda.Code.fromAsset('./dist'),
      environment: {
        USER_POOL_ID: userPool.userPoolId,
        EVENT_TABLE_NAME: eventTable.tableName, // Add table name to environment
      },
    });

    // IAM policy for the event handler to access Cognito if needed
    const eventPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'cognito-idp:GetUser', // Add more actions as needed for your event handling
      ],
      resources: [userPool.userPoolArn],
    });

    eventHandlerLambda.addToRolePolicy(eventPolicy);

    // IAM policy for accessing DynamoDB
    const dbPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'dynamodb:PutItem',
        'dynamodb:GetItem',
        'dynamodb:Scan',
        'dynamodb:UpdateItem',
        'dynamodb:DeleteItem',
      ],
      resources: [eventTable.tableArn],
    });

    eventHandlerLambda.addToRolePolicy(dbPolicy);

    // API Gateway setup
    const api = new apigateway.LambdaRestApi(this, 'NestJsApi', {
      handler: nestJsLambda,
      proxy: false,
    });

    // Auth resource
    const authResource = api.root.addResource('auth');
    authResource.addMethod('POST', new apigateway.LambdaIntegration(nestJsLambda));

    // Lambda resource
    const lambdaResource = api.root.addResource('lambda');
    lambdaResource.addMethod('GET', new apigateway.LambdaIntegration(nestJsLambda));

    // Event resource
    const eventResource = api.root.addResource('events');
    eventResource.addMethod('POST', new apigateway.LambdaIntegration(eventHandlerLambda)); // To create a new event
    eventResource.addMethod('GET', new apigateway.LambdaIntegration(eventHandlerLambda)); // To list events

    // Outputs
    new cdk.CfnOutput(this, 'API URL', {
      value: api.url,
      description: 'The URL of the NestJS API',
    });

    new cdk.CfnOutput(this, 'Event Table Name', {
      value: eventTable.tableName,
      description: 'The name of the DynamoDB Event table',
    });
  }
}

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const dockerContextPath = path.join(__dirname, '../../test-task');
    console.log('Using Docker context path:', dockerContextPath);

   
    const s3Bucket = new s3.Bucket(this, 'MyBucket', {
      bucketName: 'access-user',
      removalPolicy: cdk.RemovalPolicy.DESTROY, 
      autoDeleteObjects: true, 
    })

    const eventTable = new dynamodb.Table(this, 'EventTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      tableName: 'Events',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'MyUserPool',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
    });


    const nestJsLambda = new lambda.DockerImageFunction(this, 'NestJSLambda', {
      code: lambda.DockerImageCode.fromImageAsset(dockerContextPath),
      functionName: 'NestCustomLambdaFunctionName',
      memorySize: 256,
      timeout: cdk.Duration.seconds(90),
      environment: {
        S3_BUCKET_NAME: s3Bucket.bucketName,
        DYNAMODB_TABLE_NAME: eventTable.tableName,
        USER_POOL_ID: userPool.userPoolId,
      },
    });


    s3Bucket.grantReadWrite(nestJsLambda);


    eventTable.grantFullAccess(nestJsLambda);


    nestJsLambda.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'cognito-idp:ListUsers',
          'cognito-idp:GetUser',
          'cognito-idp:AdminCreateUser',
          'cognito-idp:AdminDeleteUser',
        ],
        resources: [userPool.userPoolArn],
      })
    );

//proxy
    const api = new apigateway.LambdaRestApi(this, 'NestApi', {
      handler: nestJsLambda,
      proxy: true,
    });

    // Outputs
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
      description: 'The URL of the NestJS API',
    });

    new cdk.CfnOutput(this, 'S3BucketName', {
      value: s3Bucket.bucketName,
      description: 'The name of the S3 bucket',
    });

    new cdk.CfnOutput(this, 'DynamoDBTableName', {
      value: eventTable.tableName,
      description: 'The name of the DynamoDB table',
    });

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
      description: 'The ID of the Cognito User Pool',
    });
  }
}

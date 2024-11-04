"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CdkStack = void 0;
const constants_1 = require("./../../src/auth/constants");
const cdk = require("aws-cdk-lib");
const lambda = require("aws-cdk-lib/aws-lambda");
const apigateway = require("aws-cdk-lib/aws-apigateway");
const cognito = require("aws-cdk-lib/aws-cognito");
const iam = require("aws-cdk-lib/aws-iam");
class CdkStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const userPool = new cognito.UserPool(this, 'UserPool', {
            userPoolName: 'MyUserPool',
            selfSignUpEnabled: true,
            signInAliases: {
                email: true,
            },
        });
        const nestJsLambda = new lambda.Function(this, 'NestJsFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'main.handler',
            code: lambda.Code.fromAsset('./dist'),
            environment: {
                JWT_SECRET: constants_1.JWT_SECRET,
                USER_POOL_ID: userPool.userPoolId,
            },
        });
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
        const api = new apigateway.LambdaRestApi(this, 'NestJsApi', {
            handler: nestJsLambda,
            proxy: false,
        });
        const authResource = api.root.addResource('auth');
        authResource.addMethod('POST', new apigateway.LambdaIntegration(nestJsLambda));
        const lambdaResource = api.root.addResource('lambda');
        lambdaResource.addMethod('GET', new apigateway.LambdaIntegration(nestJsLambda));
        new cdk.CfnOutput(this, 'API URL', {
            value: api.url,
            description: 'The URL of the NestJS API',
        });
    }
}
exports.CdkStack = CdkStack;
//# sourceMappingURL=cdk-stack.js.map
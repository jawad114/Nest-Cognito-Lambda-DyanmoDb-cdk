"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
const constants_1 = require("./constants");
let AuthService = class AuthService {
    constructor() {
        this.client = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({ region: constants_1.COGNITO_REGION });
    }
    calculateSecretHash(username) {
        return crypto
            .createHmac('sha256', constants_1.COGNITO_APP_CLIENT_SECRET)
            .update(username + constants_1.COGNITO_APP_CLIENT_ID)
            .digest('base64');
    }
    async signup(signupDto) {
        const secretHash = this.calculateSecretHash(signupDto.email);
        const command = new client_cognito_identity_provider_1.SignUpCommand({
            ClientId: constants_1.COGNITO_APP_CLIENT_ID,
            Username: signupDto.email,
            Password: signupDto.password,
            SecretHash: secretHash,
        });
        await this.client.send(command);
    }
    async login(loginDto) {
        const secretHash = this.calculateSecretHash(loginDto.email);
        const command = new client_cognito_identity_provider_1.AdminInitiateAuthCommand({
            UserPoolId: constants_1.COGNITO_USER_POOL_ID,
            ClientId: constants_1.COGNITO_APP_CLIENT_ID,
            AuthFlow: 'ADMIN_NO_SRP_AUTH',
            AuthParameters: {
                USERNAME: loginDto.email,
                PASSWORD: loginDto.password,
                SECRET_HASH: secretHash,
            },
        });
        const response = await this.client.send(command);
        return response.AuthenticationResult;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)()
], AuthService);
//# sourceMappingURL=auth.service.js.map
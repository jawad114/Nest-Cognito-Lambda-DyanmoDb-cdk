import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { CognitoIdentityProviderClient, SignUpCommand, AdminInitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import { COGNITO_USER_POOL_ID, COGNITO_APP_CLIENT_ID, COGNITO_REGION, COGNITO_APP_CLIENT_SECRET } from './constants';

@Injectable()
export class AuthService {
  private client = new CognitoIdentityProviderClient({ region: COGNITO_REGION });

  private calculateSecretHash(username: string): string {
    return crypto
      .createHmac('sha256', COGNITO_APP_CLIENT_SECRET)
      .update(username + COGNITO_APP_CLIENT_ID)
      .digest('base64');
  }

  async signup(signupDto: SignupDto) {
    const secretHash = this.calculateSecretHash(signupDto.email);

    const command = new SignUpCommand({
      ClientId: COGNITO_APP_CLIENT_ID,
      Username: signupDto.email,
      Password: signupDto.password,
      SecretHash: secretHash,
    });

    await this.client.send(command);
  }

  async login(loginDto: LoginDto) {
    const secretHash = this.calculateSecretHash(loginDto.email);

    const command = new AdminInitiateAuthCommand({
      UserPoolId: COGNITO_USER_POOL_ID,
      ClientId: COGNITO_APP_CLIENT_ID,
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
}

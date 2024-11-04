import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private client;
    private calculateSecretHash;
    signup(signupDto: SignupDto): Promise<void>;
    login(loginDto: LoginDto): Promise<import("@aws-sdk/client-cognito-identity-provider").AuthenticationResultType>;
}

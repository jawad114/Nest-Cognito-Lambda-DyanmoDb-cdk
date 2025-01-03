import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import * as jwksRsa from 'jwks-rsa';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    private jwksClient: jwksRsa.JwksClient;

    constructor(private jwtService: JwtService) {
        this.jwksClient = jwksRsa({
            jwksUri: `https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_qWpkHc1xe/.well-known/jwks.json`
        });
    }


    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            throw new ForbiddenException('No token provided');
        }

        try {
         
            const decodedToken = jwt.decode(token, { complete: true });
            if (!decodedToken || !decodedToken.header.kid) {
                throw new ForbiddenException('Invalid token');
            }

       
            const key = await this.jwksClient.getSigningKey(decodedToken.header.kid);
            const signingKey = key.getPublicKey();

  
            const user = jwt.verify(token, signingKey, {
                algorithms: ['RS256'], 
                issuer: `https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_qWpkHc1xe` 
            });

            req.user = user; 
            return true;
        } catch (err) {
            throw new ForbiddenException('Token verification failed: ' + err.message);
        }
    }
}

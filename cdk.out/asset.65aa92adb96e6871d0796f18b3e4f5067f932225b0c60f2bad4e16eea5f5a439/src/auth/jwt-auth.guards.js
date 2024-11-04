"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const jwt = require("jsonwebtoken");
const jwksRsa = require("jwks-rsa");
let JwtAuthGuard = class JwtAuthGuard {
    constructor(jwtService) {
        this.jwtService = jwtService;
        this.jwksClient = jwksRsa({
            jwksUri: `https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_rpd2q7bWO/.well-known/jwks.json`
        });
    }
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new common_1.ForbiddenException('No token provided');
        }
        try {
            const decodedToken = jwt.decode(token, { complete: true });
            if (!decodedToken || !decodedToken.header.kid) {
                throw new common_1.ForbiddenException('Invalid token');
            }
            const key = await this.jwksClient.getSigningKey(decodedToken.header.kid);
            const signingKey = key.getPublicKey();
            const user = jwt.verify(token, signingKey, {
                algorithms: ['RS256'],
                issuer: `https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_rpd2q7bWO`
            });
            req.user = user;
            return true;
        }
        catch (err) {
            throw new common_1.ForbiddenException('Token verification failed: ' + err.message);
        }
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guards.js.map
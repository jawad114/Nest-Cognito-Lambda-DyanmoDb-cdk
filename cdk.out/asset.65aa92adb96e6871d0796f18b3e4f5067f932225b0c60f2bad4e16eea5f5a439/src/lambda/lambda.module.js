"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LambdaModule = void 0;
const common_1 = require("@nestjs/common");
const lambda_service_1 = require("./lambda.service");
const lambda_controller_1 = require("./lambda.controller");
const constants_1 = require("../auth/constants");
const jwt_1 = require("@nestjs/jwt");
const jwt_auth_guards_1 = require("./../auth/jwt-auth.guards");
let LambdaModule = class LambdaModule {
};
exports.LambdaModule = LambdaModule;
exports.LambdaModule = LambdaModule = __decorate([
    (0, common_1.Module)({
        imports: [
            jwt_1.JwtModule.register({
                secret: constants_1.JWT_SECRET,
                signOptions: { expiresIn: '1hr' },
            }),
        ],
        controllers: [lambda_controller_1.LambdaController],
        providers: [lambda_service_1.LambdaService, jwt_auth_guards_1.JwtAuthGuard],
        exports: [lambda_service_1.LambdaService, jwt_1.JwtModule, jwt_auth_guards_1.JwtAuthGuard],
    })
], LambdaModule);
//# sourceMappingURL=lambda.module.js.map
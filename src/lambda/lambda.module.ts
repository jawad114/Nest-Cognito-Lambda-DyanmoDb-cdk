import { Module } from '@nestjs/common';
import { LambdaService } from './lambda.service';
import { LambdaController } from './lambda.controller';
import { JWT_SECRET } from 'src/auth/constants';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './../auth/jwt-auth.guards';
@Module({
  imports: [
    JwtModule.register({
        secret: JWT_SECRET,
        signOptions: { expiresIn: '1hr' }, 
    }),
],
  controllers: [LambdaController],
  providers: [LambdaService, JwtAuthGuard],
  exports: [LambdaService, JwtModule, JwtAuthGuard],
})
export class LambdaModule {}

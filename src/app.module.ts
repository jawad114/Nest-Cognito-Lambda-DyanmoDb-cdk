import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { LambdaModule } from './lambda/lambda.module';
import { EventModule } from './event/event.module';

@Module({
  imports: [AuthModule, LambdaModule,EventModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

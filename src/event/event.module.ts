import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { JwtModule } from '@nestjs/jwt';
import { JWT_SECRET } from 'src/auth/constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guards';
@Module({
  imports: [  JwtModule.register({
    secret: JWT_SECRET,
    signOptions: { expiresIn: '1hr' }, 
}),],
  controllers: [EventController],
  providers: [EventService,JwtAuthGuard],
  exports: [EventService,JwtModule,JwtAuthGuard]
})
export class EventModule {}

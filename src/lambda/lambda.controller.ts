import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guards';
import { LambdaService } from './lambda.service';

@Controller('lambda')
export class LambdaController {
  constructor(private readonly lambdaService: LambdaService) {}

  @UseGuards(JwtAuthGuard)
  @Get('invoke')
  async invoke() {
    return this.lambdaService.invokeProtectedFunction();
  }
}

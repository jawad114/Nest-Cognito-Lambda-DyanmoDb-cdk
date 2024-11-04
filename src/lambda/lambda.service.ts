import { Injectable } from '@nestjs/common';

@Injectable()
export class LambdaService {
  invokeProtectedFunction() {
   
    return { message: 'This is a protected Lambda function' };
  }
}

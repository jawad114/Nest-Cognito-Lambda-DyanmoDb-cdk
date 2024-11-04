import { LambdaService } from './lambda.service';
export declare class LambdaController {
    private readonly lambdaService;
    constructor(lambdaService: LambdaService);
    invoke(): Promise<{
        message: string;
    }>;
}

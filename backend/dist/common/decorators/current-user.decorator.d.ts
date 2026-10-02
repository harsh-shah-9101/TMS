import { RoleName } from '../enums';
export interface UserPayload {
    userId: string;
    email: string;
    organizationId: string;
    role: RoleName;
}
export declare const CurrentUser: (...dataOrPipes: (keyof UserPayload | import("@nestjs/common").ParameterDecoratorOptions | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>> | undefined)[]) => ParameterDecorator;

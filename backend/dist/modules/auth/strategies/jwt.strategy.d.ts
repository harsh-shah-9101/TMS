import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { RoleName } from '../../roles/models/role.model';
import { User } from '../../users/models/user.model';
export interface JwtPayload {
    sub: string;
    organizationId: string;
    role: string | RoleName;
    email: string;
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private userModel;
    constructor(configService: ConfigService, userModel: typeof User);
    validate(payload: JwtPayload): Promise<{
        userId: string;
        email: string;
        organizationId: string;
        role: RoleName;
    }>;
}
export {};

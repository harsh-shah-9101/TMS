import { RoleName } from '../../../common/enums';
export declare class UserResponseDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    organizationId: string;
    role: RoleName;
}
export declare class AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    user: UserResponseDto;
}

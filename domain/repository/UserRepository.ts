import { User } from '../model/User';
import { AuthorizationRequest } from '../model/AuthorizationRequest';

export interface UserRepository {
    getAuthRequest(
        request: AuthorizationRequest
    ): Promise<AuthorizationRequest>;
    validateAuthRequest(request: AuthorizationRequest): Promise<boolean>;
    getUserByEmail(email: string, storeId:string): Promise<User>;
}

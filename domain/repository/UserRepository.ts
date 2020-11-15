import { User } from '../model/User';
import { AuthorizationRequest } from '../model/AuthorizationRequest';

export interface UserRepository {
    getAuthRequest(
        request: AuthorizationRequest
    ): Promise<AuthorizationRequest>;
    validateAuthRequest(request: AuthorizationRequest): Promise<boolean>;
}

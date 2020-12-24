import UserDataRepository from '@data/db/UserDataRepository';

import { UserRepository } from '@domain/repository/UserRepository';

describe.skip('ProductDataRepository', () => {
    let userRepository: UserRepository;
    const storeId: string = 'f2cf6dde-f6aa-44c5-837d-892c7438ed3d';
    const email = 'john@example.com';
    let code;

    beforeAll(async () => {
        /*const res: any = await runQuery(
            "INSERT INTO store (name) VALUES ('test') RETURNING id;"
        );
        storeId = res.rows[0].id;*/
        userRepository = new UserDataRepository();
    });

    it.skip('Should create confirmation code', async () => {
        const params: any = {
            email,
            type: 'admin',
            storeId,
        };

        const request = await userRepository.getAuthRequest(params);
        expect(request.id).not.toBeUndefined();
        expect(request.email).toEqual(params.email);
        expect(request.storeId).toEqual(storeId);
        expect(request.code).not.toBeUndefined();
        code = request.code;
        expect(request.expireAt).not.toBeUndefined();
        expect(request.type).toEqual(params.type);
    });

    it.skip('should confirm auth with code', async () => {
        const params: any = {
            email,
            type: 'admin',
            storeId,
            code,
        };

        const confirm = await userRepository.validateAuthRequest(params);
        expect(confirm).toEqual(true);
    });
});

import { getClient } from '@data/db/db';

describe.skip('db', () => {
    it('Should get db client', async () => {
        const db = getClient();
        expect(db).not.toBe(undefined);
    });
});

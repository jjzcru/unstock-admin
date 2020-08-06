import { getConnection, closeConnection } from '../../../../data/db/db';

describe('db', () => {
    it('Should get db connection', async () => {
        const db = getConnection();
        expect(db).not.toBe(undefined);
    });
    it('Should close the connection with the db', async () => {
        await closeConnection();
    });
});

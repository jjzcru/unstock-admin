import {
	getConnection
} from '../../../../data/db/db';

describe('db', () => {
    it('Should get db connection', async () => {
        const db = getConnection();
        expect(db).not.toBe(undefined);
    });
});
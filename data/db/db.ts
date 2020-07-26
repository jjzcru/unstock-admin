import { Pool } from 'pg';

let pool: Pool;

export function getConnection(): Pool {
	if (!pool) {
		pool = new Pool({
			user: process.env.DB_USER || 'unstock',
			host: process.env.DB_HOST || 'localhost',
			database: process.env.DB_NAME || 'unstock',
			password: process.env.DB_PASSWORD || 'unstock',
			port: 5432,
		});
	}

	return pool;
}

export async function closeConnection() {
	if (!!pool) {
		pool.end();
	}
}

export async function runQuery(query: string, values?: any[]) {
	return new Promise(async (resolve, reject) => {
		try {
			const client = await getConnection().connect();
			const res = await client.query(query, values);
			resolve(res);
		} catch (e) {
			reject(e);
		}
	});
}

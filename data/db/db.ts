import ServerlessClient from 'serverless-postgres';

let client: any;
const config = {
    user: process.env.DB_USER || 'unstock',
    host: process.env.DB_HOST,
    database: process.env.DB_NAME || 'unstock',
    password: process.env.DB_PASSWORD,
    port: 5432,
    debug: false,
    delayMs: 3000,
};
export function getClient() {
    console.log(`CONFIG`);
    console.log(config);
    if (client) {
        return client;
    }

    client = new ServerlessClient(config);
    return client;
}

export async function runQuery(query: string, values?: any[]) {
    console.log(`CONFIG`);
    console.log(config);
    const c = getClient();
    await c.connect();
    const res = await c.query(query, values);
    await c.clean();
    return res;
}

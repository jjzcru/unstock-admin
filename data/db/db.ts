import ServerlessClient from 'serverless-postgres';
import superagent from 'superagent';
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
    if (client) {
        return client;
    }
    client = new ServerlessClient(config);
    return client;
}
export async function runQuery(query: string, values?: any[]) {
    /*if (process.env.APP_ENV === 'production') {
        const sql = compileQuery(query, values);
        return runProxy(sql);
    }*/
    const c = getClient();
    await c.connect();
    const res = await c.query(query, values);
    await c.clean();
    return res;
}
export function compileQuery(query: string, values?: any[]): string {
    if (!values || !values.length) {
        return query;
    }
    let matches = query.match(/[$]\d+/gm);
    if (matches.length !== values.length) {
        throw new Error('Parametrized values do not match query params');
    }
    matches = matches.sort();
    for (let i = 0; i < values.length; i++) {
        const match = matches[i];
        const value = values[i];
        if (typeof value === 'number') {
            query = query.replace(match, `${value}`);
        } else if (value === null || value === undefined) {
            query = query.replace(match, 'NULL');
        } else if (Array.isArray(value)) {
            query = query.replace(match, `'{${value.join(',')}}'`);
        } else if (value instanceof Date) {
            query = query.replace(match, `'${value.toISOString()}'`);
        } else if (typeof value === 'object') {
            query = query.replace(match, `'${JSON.stringify(value)}'`);
        } else {
            query = query.replace(match, `'${value}'`);
        }
    }
    return query;
}
export function runProxy(sql: string): Promise<{ rows: any[] }> {
    return new Promise((resolve, reject) => {
        superagent
            .post(process.env.DB_PROXY_HOST)
            .send({ sql })
            .set('x-unstock-access-code', process.env.DB_PROXY_ACCESS_CODE)
            .set('content-type', 'application/json')
            .end((err: any, res: any) => {
                const { body, statusCode } = res;
                if (err) {
                    if (statusCode > 200 && body.message) {
                        reject(new Error(body.message));
                    } else {
                        reject(err);
                    }
                    return;
                }
                if (statusCode === 200) {
                    resolve(body);
                } else {
                    console.error(`ERROR`);
                    console.log(body);
                    reject(new Error(body.message));
                }
            });
    });
}

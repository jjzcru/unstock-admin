const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

loadEnvVariables();

function loadEnvVariables() {
    const envPath = path.join(__dirname, '.env');
    if (!!envPath) {
        if (fs.existsSync(envPath)) {
            const envConfig = dotenv.parse(fs.readFileSync(envPath, 'utf-8'));
            for (const k in envConfig) {
                process.env[k] = envConfig[k];
            }
        }
    }
}

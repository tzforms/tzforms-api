import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(__dirname, '../.env');

const { error, parsed } = dotenv.config({ path: envPath });
if (error || !parsed) throw new Error('Failed to parse .env file');

export type Config = {
    ARCHETYPE_PATH: string;
}

const config: Config = {
    ARCHETYPE_PATH: parsed['ARCHETYPE_PATH'] as string
}

export default config;

export type Config = {
    ARCHETYPE_PATH: string;
}

const config: Config = {
    ARCHETYPE_PATH: process.env.ARCHETYPE_PATH as string
}

export default config;
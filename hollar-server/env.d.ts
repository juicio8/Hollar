declare global {
    namespace NodeJS {
        interface ProcessEnv {
            // NODE_ENV: 'development' | 'production';
            PORT: number,
            SECRETKEY: string,
            SENDGRID: string,
            SALT: number,
            OMDB_KEY: string,
            OMD_KEY: string,
            SES_SECRETKEY: string,
            SES_ACCESSKEY: string,
            SES_REGION: string,
            MONGO_URL: string

            // PWD: string;
        }
    }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export { }

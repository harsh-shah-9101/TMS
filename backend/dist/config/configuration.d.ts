declare const _default: () => {
    port: number;
    nodeEnv: string;
    databaseUrl: string | undefined;
    jwt: {
        secret: string;
        expiresIn: string;
        refreshSecret: string;
        refreshExpiresIn: string;
    };
    corsOrigin: string;
};
export default _default;

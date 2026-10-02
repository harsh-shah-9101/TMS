import { Sequelize } from 'sequelize-typescript';
export declare class HealthController {
    private readonly sequelize;
    constructor(sequelize: Sequelize);
    checkHealth(): Promise<{
        status: string;
        database: string;
        timestamp: string;
    }>;
}

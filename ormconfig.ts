import path from 'path';

export default {
  type: 'sqlite',
  synchronize: true,
  database: process.env.TYPEORM_DATABASE ?? 'development.db',
  logging: process.env.TYPEORM_LOGGING ?? true,
  entities: [path.join(__dirname, './src/entities/**/*.entity.ts')],
  migrations: [path.join(__dirname, './src/migrations/*.ts')],
  cli: {
    migrationsDir: './src/migrations',
  },
};

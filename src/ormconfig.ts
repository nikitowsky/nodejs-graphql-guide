import path from 'path';
import { ConnectionOptions } from 'typeorm';

const config: ConnectionOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'developer',
  password: 'password',
  database: 'example_db',
  synchronize: false,
  logging: true,
  migrationsRun: false,
  entities: [path.join(__dirname, './entities/**/*.entity.{ts,js}')],
  migrations: [path.join(__dirname, './migrations/*.{ts,js}')],
  cli: {
    migrationsDir: 'src/migrations',
  },
};

export = config;

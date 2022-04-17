import * as dotenv from "dotenv";
dotenv.config();

const dbConnection = {
   name: "default",
   type: "postgres",
   host: process.env.TYPEORM_HOST || "localhost",
   port: process.env.TYPEORM_PORT || 5432,
   username: process.env.TYPEORM_USERNAME || "postgres",
   password: process.env.TYPEORM_PASSWORD || 123456,
   database: process.env.TYPEORM_DATABASE,
   synchronize: false,
   logging: !!process.env.TYPEORM_LOGGING,
   cache: !!process.env.TYPEORM_CACHE,
   entities: ["src/entities/*.ts"],
   migrations: ["src/migrations/*.ts"],
   migrationsTableName: 'migrations',
   cli: {
      entitiesDir: "src/entities",
      migrationsDir: "src/migrations"
   }
};

export = dbConnection;

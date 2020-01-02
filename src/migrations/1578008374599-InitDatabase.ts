import {MigrationInterface, QueryRunner} from "typeorm";

export class InitDatabase1578008374599 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "username" character varying NOT NULL, "bio" text, "image" character varying, "description" character varying, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "article" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "slug" character varying NOT NULL, "content" text, "authorId" integer NOT NULL, CONSTRAINT "UQ_0ab85f4be07b22d79906671d72f" UNIQUE ("slug"), CONSTRAINT "PK_40808690eb7b915046558c0f81b" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "article" ADD CONSTRAINT "FK_a9c5f4ec6cceb1604b4a3c84c87" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "article" DROP CONSTRAINT "FK_a9c5f4ec6cceb1604b4a3c84c87"`, undefined);
        await queryRunner.query(`DROP TABLE "article"`, undefined);
        await queryRunner.query(`DROP TABLE "user"`, undefined);
    }

}

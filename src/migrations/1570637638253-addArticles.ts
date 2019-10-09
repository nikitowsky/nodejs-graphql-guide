import {MigrationInterface, QueryRunner} from "typeorm";

export class addArticles1570637638253 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "article" DROP CONSTRAINT "FK_a9c5f4ec6cceb1604b4a3c84c87"`, undefined);
        await queryRunner.query(`ALTER TABLE "article" ALTER COLUMN "authorId" SET NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "article" ADD CONSTRAINT "FK_a9c5f4ec6cceb1604b4a3c84c87" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "article" DROP CONSTRAINT "FK_a9c5f4ec6cceb1604b4a3c84c87"`, undefined);
        await queryRunner.query(`ALTER TABLE "article" ALTER COLUMN "authorId" DROP NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "article" ADD CONSTRAINT "FK_a9c5f4ec6cceb1604b4a3c84c87" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

}

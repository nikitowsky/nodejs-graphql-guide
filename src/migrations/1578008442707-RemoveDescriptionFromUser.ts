import {MigrationInterface, QueryRunner} from "typeorm";

export class RemoveDescriptionFromUser1578008442707 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "description"`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "user" ADD "description" character varying`, undefined);
    }

}

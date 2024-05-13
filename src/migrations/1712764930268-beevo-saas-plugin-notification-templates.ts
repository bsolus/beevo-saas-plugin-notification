import { MigrationInterface, QueryRunner } from 'typeorm'

export class beevoSaasPluginNotificationTemplates1712764930268
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            `CREATE TABLE "if_then_pay" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "id" SERIAL NOT NULL, CONSTRAINT "PK_55de0551296d9a7797f47083dde" PRIMARY KEY ("id"))`,
            undefined,
        )
        await queryRunner.query(
            `ALTER TABLE "email_template_translation" DROP COLUMN "title"`,
            undefined,
        )
        await queryRunner.query(
            `ALTER TABLE "email_template" ADD "title" character varying NOT NULL`,
            undefined,
        )
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            `ALTER TABLE "email_template" DROP COLUMN "title"`,
            undefined,
        )
        await queryRunner.query(
            `ALTER TABLE "email_template_translation" ADD "title" character varying NOT NULL`,
            undefined,
        )
        await queryRunner.query(`DROP TABLE "if_then_pay"`, undefined)
    }
}

import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableIndex
} from "typeorm";

export class createWebhook1650462375071 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await this._createWebhookTable(queryRunner);
        await this._createWebhookLogTable(queryRunner);
        await this._createWebhookProgressTable(queryRunner);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex('webhooks', 'IDX_contract_name_type');
        await queryRunner.dropIndex('webhook_progress', 'IDX_is_processed_try_num');

        await queryRunner.dropTable('webhooks');
        await queryRunner.dropTable('webhook_logs');
        await queryRunner.dropTable('webhook_progress');
    }

    private async _createWebhookTable (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'webhooks',
                columns: [
                  {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                  },
                  {
                    name: 'contract_name',
                    type: 'varchar',
                    isNullable: false,
                  },
                  {
                    name: 'type',
                    type: 'varchar',
                    isNullable: false,
                  },
                  {
                    name: 'url',
                    type: 'varchar',
                    isNullable: false,
                  },
                  {
                    name: 'created_at',
                    type: 'timestamptz',
                    default: 'now()',
                  }
                ]
              }),
            true
        );

        await queryRunner.createIndex(
            'webhooks',
            new TableIndex({
                name: 'IDX_contract_name_type',
                columnNames: ['contract_name', 'type'],
            })
        );
    }

    private async _createWebhookLogTable (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'webhook_logs',
                columns: [
                  {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                  },
                  {
                    name: 'webhook_progress_id',
                    type: 'bigint',
                    isNullable: false,
                  },
                  {
                    name: 'url',
                    type: 'varchar',
                    isNullable: false,
                  },
                  {
                    name: 'params',
                    type: 'varchar',
                    isNullable: false,
                  },
                  {
                    name: 'status',
                    type: 'int',
                    isNullable: false,
                  },
                  {
                    name: 'msg',
                    type: 'varchar',
                    isNullable: false,
                  },
                  {
                    name: 'created_at',
                    type: 'bigint',
                    isNullable: false
                  }
                ]
              }),
            true
        );
    }

    private async _createWebhookProgressTable (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'webhook_progress',
                columns: [
                  {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                  },
                  {
                    name: 'webhook_id',
                    type: 'bigint',
                    isNullable: false,
                  },
                  {
                    name: 'ref_id',
                    type: 'bigint',
                    isNullable: false,
                  },
                  {
                    name: 'is_processed',
                    type: 'boolean',
                    default: false
                  },
                  {
                    name: 'try_num',
                    type: 'bigint',
                    default: 0
                  },
                  {
                    name: 'retry_at',
                    type: 'bigint',
                    isNullable: true,
                  },
                  {
                    name: 'created_at',
                    type: 'bigint',
                    isNullable: false,
                  },
                  {
                    name: 'updated_at',
                    type: 'bigint',
                    isNullable: false,
                  }
                ]
              }),
            true
        );

        await queryRunner.createIndex(
            'webhook_progress',
            new TableIndex({
                name: 'IDX_is_processed_try_num',
                columnNames: ['is_processed', 'try_num'],
            })
        );
    }
}

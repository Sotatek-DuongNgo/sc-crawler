import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableIndex
} from "typeorm";

export class createContractEvents1650166964822 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'contract_events',
                columns: [
                  {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                  },
                  {
                    name: 'address',
                    type: 'varchar',
                    isNullable: false,
                  },
                  {
                    name: 'block_hash',
                    type: 'varchar',
                    isNullable: false,
                  },
                  {
                    name: 'block_number',
                    type: 'bigint',
                    isNullable: false,
                  },
                  {
                    name: 'block_time',
                    type: 'bigint',
                    isNullable: false,
                  },
                  {
                    name: 'tx_hash',
                    type: 'varchar',
                    isNullable: false,
                  },
                  {
                    name: 'tx_index',
                    type: 'int',
                    isNullable: false,
                  },
                  {
                    name: 'event_id',
                    type: 'varchar',
                    isNullable: false,
                  },
                  {
                    name: 'event',
                    type: 'varchar',
                    isNullable: false,
                  },
                  {
                    name: 'return_values',
                    type: 'text',
                    isNullable: false,
                  },
                  {
                    name: 'created_at',
                    type: 'timestamptz',
                    default: 'now()',
                  },
                  {
                    name: 'updated_at',
                    type: 'timestamptz',
                    default: 'now()',
                  }
                ]
              }),
            true
        );

        await queryRunner.createIndex(
            "contract_events",
            new TableIndex({
                name: "IDX_address",
                columnNames: ["address"],
            })
        );

        await queryRunner.createIndex(
            "contract_events",
            new TableIndex({
                name: "IDX_event",
                columnNames: ["event"],
            })
        );

        await queryRunner.createIndex(
            "contract_events",
            new TableIndex({
                name: "IDX_address_event",
                columnNames: ["address", "event"],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('contract_events');
        await queryRunner.dropIndex("contract_events", "IDX_address");
        await queryRunner.dropIndex("contract_events", "IDX_event");
        await queryRunner.dropIndex("contract_events", "IDX_address_event");
    }

}

import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableIndex
} from "typeorm";

export class createCrawlStatus1650166602186 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'crawl_status',
                columns: [
                  {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                  },
                  {
                    name: 'name',
                    type: 'varchar',
                    isNullable: false,
                    isUnique: true,
                  },
                  {
                    name: 'contract_address',
                    type: 'varchar',
                    isNullable: false,
                  },
                  {
                    name: 'block_number',
                    type: 'bigint',
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
            "crawl_status",
            new TableIndex({
                name: "IDX_CONTRACT_NAME",
                columnNames: ["name"],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('crawl_status');
        await queryRunner.dropIndex("crawl_status", "IDX_CONTRACT_NAME");
    }

}

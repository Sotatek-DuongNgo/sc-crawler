import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    Index,
    UpdateDateColumn,
    CreateDateColumn
} from 'typeorm';

@Entity('crawl_status')
export class CrawlStatus {
    @PrimaryGeneratedColumn()
    public id: number;

    @Index()
    @Column({ nullable: false, unique: true })
    public name: string;

    @Column({ name: 'contract_address', nullable: false })
    public contractAddress: string;

    @Column({ name: 'block_number', type: 'bigint', nullable: false })
    public blockNumber: number;

    @CreateDateColumn({name: 'created_at'})
    public createdAt: Date;

    @UpdateDateColumn({name: 'updated_at'})
    public updatedAt: Date;
}

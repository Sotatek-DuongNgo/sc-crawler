import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    CreateDateColumn
} from 'typeorm';

@Entity('contract_events')
export class ContractEvent {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ name: 'address', nullable: false })
    public address: string;

    @Column({ name: 'block_hash', nullable: false })
    public blockHash: string;

    @Column({ name: 'block_number', type: 'bigint', nullable: false })
    public blockNumber: number;

    @Column({ name: 'block_time', type: 'bigint', nullable: false })
    public blockTime: number;

    @Column({ name: 'tx_hash', nullable: false })
    public txHash: string;

    @Column({ name: 'tx_index', type: 'int', nullable: false })
    public txIndex: number;

    @Column({ name: 'event_id', nullable: false })
    public eventId: string;

    @Column({ name: 'event', nullable: false })
    public event: string;

    @Column({ name: 'return_values', nullable: false, type: 'text' })
    public returnValues: string;

    @CreateDateColumn({name: 'created_at'})
    public createdAt: number;

    @UpdateDateColumn({name: 'updated_at'})
    public updatedAt: number;
}

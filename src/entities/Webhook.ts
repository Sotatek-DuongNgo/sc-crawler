import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('webhooks')
export class Webhook {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ name: 'contract_name', nullable: false })
  public contractName: string;

  @Column({ name: 'type', nullable: false })
  public type: string;

  @Column({ name: 'url', nullable: false })
  public url: string;

  @CreateDateColumn({name: 'created_at'})
  public createdAt: Date;
}

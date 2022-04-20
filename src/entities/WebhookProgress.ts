import { Entity, PrimaryGeneratedColumn, BeforeInsert, BeforeUpdate, Column } from 'typeorm';
import { nowInMillis } from '../Utils';

@Entity('webhook_progress')
export class WebhookProgress {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ name: 'webhook_id', nullable: false })
  public webhookId: number;

  @Column({ name: 'ref_id', nullable: false })
  public refId: number;

  @Column({ name: 'is_processed', default: false })
  public isProcessed: boolean;

  @Column({ name: 'try_num', nullable: false, default: 0 })
  public tryNum: number;

  @Column({ name: 'retry_at', type: 'bigint' })
  public retryAt: number;

  @Column({ name: 'created_at', type: 'bigint' })
  public createdAt: number;

  @Column({ name: 'updated_at', type: 'bigint' })
  public updatedAt: number;

  @BeforeInsert()
  public updateCreateDates() {
    this.createdAt = nowInMillis();
    this.updatedAt = nowInMillis();
  }

  @BeforeUpdate()
  public updateUpdateDates() {
    this.updatedAt = nowInMillis();
  }
}

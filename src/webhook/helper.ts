import { EntityManager } from 'typeorm';
import { WebhookLog, Webhook, WebhookProgress } from '../entities';
import { nowInMillis } from '../Utils';

export async function insertWebhookLog(
  manager: EntityManager,
  progressId: number,
  url: string,
  params: string,
  status: number,
  msg: string
): Promise<void> {
  await manager
    .getRepository(WebhookLog)
    .insert({ progressId, url, params, status, msg, createdAt: nowInMillis() });
  return;
}

/**
 * Anytime an event happens and need to notify to client, one or some webhook progresses are created
 * There will be a webhook processor, which picks the pending progress records and dispatch them to target urls later
 *
 * @param {EntityManager} manager
 * @param {number} refId - the ID of contract_logs
 * @param {string} type - contract event type
 */
export async function insertWebhookProgress(
  manager: EntityManager,
  refId: number,
  contractName: string,
  type: string
): Promise<void> {
  // Find out all user webhooks first
  const webhooks = await manager.getRepository(Webhook).find({ contractName, type });

  // Construct the records
  const progressRecords = webhooks.map(webhook => {
    const record = new WebhookProgress();
    record.webhookId = webhook.id;
    record.refId = refId;
    record.createdAt = nowInMillis();
    record.updatedAt = nowInMillis();
    return record;
  });

  if (progressRecords.length === 0) {
    console.debug(
      `Webhook is ignored because user does not have webhook registered: contractName=${contractName}, type=${type}`
    );
    return;
  }

  // And persist them to database
  await manager.getRepository(WebhookProgress).save(progressRecords);

  console.debug(`Created webhook progress: contractName=${contractName}, type=${type}, refId=${refId}`);
  return;
}

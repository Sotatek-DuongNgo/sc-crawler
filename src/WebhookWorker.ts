import { prepareEnvironment } from './Utils';
import { WebhookProcessor } from './webhook/Processor';

prepareEnvironment()
  .then(start)
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

function start(): void {
  const worker = new WebhookProcessor();
  worker.start();
}

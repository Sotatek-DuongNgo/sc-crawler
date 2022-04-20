import { getWeb3ProviderLink } from '../Utils';
import { IEventLogCrawlerOptions } from '../interfaces';

// Store inogress block
let LATEST_PROCESSED_BLOCK = NaN;

export abstract class BaseIntervalWorker {
  // Guarding flag to prevent the worker from starting multiple times
  protected _isStarted: boolean = false;

  // Interval time betwen each doProcess calls
  protected _nextTickTimer: number = 30000;

  // Maximum running time for one processing
  // If `doProcess` takes longer than this value (in millis),
  // It means something went wrong and the worker will be exited/restarted
  protected _processingTimeout: number = 60000;

  /**
   * The worker begins
   */
  public async start(): Promise<void> {
    if (this._isStarted) {
      console.log(`Trying to start processor twice: ${this.constructor.name}`);
      return;
    }
    this._isStarted = true;
    try {
        await this.prepare();
        console.log(`${this.constructor.name} finished preparing. Will start the first tick shortly...`);
        await this.onTick();
    } catch (error) {
        throw error;
    }
  }

  public getNextTickTimer(): number {
    return this._nextTickTimer;
  }

  public getProcessingTimeout(): number {
    return this._processingTimeout;
  }

  protected setNextTickTimer(timeout: number): void {
    this._nextTickTimer = timeout;
  }

  protected setProcessingTimeout(timeout: number): void {
    this._processingTimeout = timeout;
  }

  protected onTick(): void {
    const duration = this.getProcessingTimeout();
    const classname = this.constructor.name;
    const timer = setTimeout(async () => {
      console.log(`${classname}::onTick timeout (${duration} ms) is exceeded. Worker will be restarted shortly...`);
      process.exit(1);
    }, duration);

    this.doProcess()
      .then(() => {
        clearTimeout(timer);
        setTimeout(() => {
          this.onTick();
        }, this.getNextTickTimer());
      })
      .catch(err => {
        clearTimeout(timer);
        console.error(`======================================================================================`);
        console.error(err);
        console.error(`${classname} something went wrong. The worker will be restarted shortly...`);
        console.error(`======================================================================================`);
        setTimeout(() => {
          this.onTick();
        }, this.getNextTickTimer());
      });
  }

  protected getWorkerInfo(): string {
    return this.constructor.name;
  }

  // Should be overrided in derived classes
  // to setup connections, listeners, ... here
  protected abstract async prepare(): Promise<void>;

  // Should be overrided in derived classes
  // Main logic will come to here
  protected abstract async doProcess(): Promise<void>;
}

export default BaseIntervalWorker;

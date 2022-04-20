import { getWeb3ProviderLink } from '../Utils';
import { IEventLogCrawlerOptions } from '../interfaces';
import BaseIntervalWorker from './BaseIntervalWorker';

// Store in-progress block
let LATEST_PROCESSED_BLOCK = NaN;

abstract class BaseEventLogCrawler extends BaseIntervalWorker {

    protected readonly _options: IEventLogCrawlerOptions;

    private blockNumInOneGo: number = 0;

    constructor(options: IEventLogCrawlerOptions) {
        super();
        this._options = options;
    }

    public getOptions(): IEventLogCrawlerOptions {
        this._options.networkConfig.WEB3_API_URL = getWeb3ProviderLink();
        return this._options;
    }

    public getNetworkConfig(): any {
        return this._options.networkConfig;
    }

    public getContractConfig(): any {
        return this._options.contractConfig;
    }

    protected async prepare(): Promise<void> {
        this.blockNumInOneGo = this.getBlockNumInOneGo();
    }

    protected async doProcess(): Promise<void> {
        this.blockNumInOneGo = this.tryIncreasingBlockNumInOneGo();

        // Firstly try to get latest block number from network
        let latestNetworkBlock = await this.getBlockCount();

        // And looking for the latest processed block in local
        let latestProcessedBlock = LATEST_PROCESSED_BLOCK;

        // specify block range from local
        if (!!this.getNetworkConfig()?.blockRange) {
            const { fromBlock, toBlock } = this.getNetworkConfig().blockRange;
            latestProcessedBlock = parseInt(fromBlock, 10) - 1;
            latestNetworkBlock = toBlock;
        }

        // If there's no data in-process, then try to find it from environment variable
        if (!latestProcessedBlock && this.getNetworkConfig().FORCE_CRAWL_BLOCK) {
            latestProcessedBlock = parseInt(this.getNetworkConfig().FORCE_CRAWL_BLOCK, 10);
        }

        // If still no data, use the callback in options to get the initial value for this process
        if (!latestProcessedBlock || isNaN(latestProcessedBlock)) {
            latestProcessedBlock = await this.getOptions().getLatestCrawledBlockNumber();
        }
        if (!latestProcessedBlock && this.getNetworkConfig().FIRST_CRAWL_BLOCK) {
            latestProcessedBlock = parseInt(this.getNetworkConfig().FIRST_CRAWL_BLOCK, 10);
        }

        // If there's no data, just process from the newest block on the network
        if (isNaN(latestProcessedBlock)) {
            latestProcessedBlock = latestNetworkBlock - 1;
        }

        /**
         * Start with the next block of the latest processed one
         */
        const fromBlockNumber = latestProcessedBlock + 1;

        /**
         * If crawled the newest block already
         * Wait for a period that is equal to average block time
         * Then try crawl again (hopefully new block will be available then)
         */

        if (fromBlockNumber > latestNetworkBlock) {
            console.log(
                `Block <${fromBlockNumber}> is the newest block can be processed (on network: ${latestNetworkBlock}). Wait for the next tick...`
            );
            return;
        }

        /**
         * Try to process several blocks at once, up to the newest one on the network
         */
        let toBlockNumber = latestProcessedBlock + this.blockNumInOneGo;
        if (toBlockNumber > latestNetworkBlock) {
            toBlockNumber = latestNetworkBlock;
        }

        console.log(`crawler from block ${fromBlockNumber} -> ${toBlockNumber}`)
        /**
         * Actual crawl and process blocks
         * about 10 minutes timeout based on speed of gateway
         */
        await this.processBlocks(fromBlockNumber, toBlockNumber, latestNetworkBlock);
        /**
         * Cache the latest processed block number
         * Do the loop again in the next tick
         */
        LATEST_PROCESSED_BLOCK = toBlockNumber;

        if (toBlockNumber >= latestNetworkBlock) {
            // If the newest block is processed already, will check the next tick after 1 block time duration
            console.log(`Have processed newest block already. Will wait for a while until next check...`);
            this.setNextTickTimer(this.getAverageBlockTime());
        } else {
            // Otherwise try to continue processing immediately
            this.setNextTickTimer(this.getBreakTimeAfterOneGo());
        }

        return;
    }

    protected async onTick(): Promise<void> {
        const duration = this.getProcessingTimeout();
        const classname = this.constructor.name;
        const timer = setTimeout(async () => {
            console.log(`${classname}::onTick timeout (${duration} ms) is exceeded. Worker will be restarted shortly...`);
            process.exit(1);
        }, duration);

        // break internal
        if (!this._isStarted) {
            clearTimeout(timer);
            return;
        }

        try {
            await this.doProcess();
            clearTimeout(timer);
            setTimeout(async () => {
                await this.onTick();
            }, this.getNextTickTimer());
        } catch (error) {
            clearTimeout(timer);
            console.error(`======================================================================================`);
            console.error(error);
            console.error(`${classname} something went wrong. The worker will be restarted shortly...`);
            console.error(`======================================================================================`);
            setTimeout(async () => {
                await this.onTick();
            }, this.getNextTickTimer());
        }
    }

    public stop (): void {
        this._isStarted = false;
    }

    protected getBlockNumInOneGo(): number {
        const number = this.getNetworkConfig().BLOCK_NUM_IN_ONE_GO
            ? this.getNetworkConfig().BLOCK_NUM_IN_ONE_GO
            : this.getNetworkConfig().DEFAULT_BLOCK_NUM_IN_ONE_GO;
        return parseInt(number, 10);
    }

    public setBlockNumInOneGo(number: number): void {
        this.blockNumInOneGo = number
    }

    public tryIncreasingBlockNumInOneGo(): number {
      const maxBlockNumInOneGo = this.getBlockNumInOneGo();
      const newBlockNumInOneGo = this.getCurrentBlockNumInOneGo() * 2;
      return newBlockNumInOneGo > maxBlockNumInOneGo ? maxBlockNumInOneGo : newBlockNumInOneGo;
    }

    public getCurrentBlockNumInOneGo(): number {
        return this.blockNumInOneGo;
    }

    protected getAverageBlockTime(): number {
        return parseInt(this.getNetworkConfig().AVERAGE_BLOCK_TIME, 10);
    }

    protected getBreakTimeAfterOneGo(): number {
        const number = this.getNetworkConfig().BREAK_TIME_AFTER_ONE_GO
            ? this.getNetworkConfig().BREAK_TIME_AFTER_ONE_GO
            : this.getNetworkConfig().DEFAULT_BREAK_TIME_AFTER_ONE_GO;
        return parseInt(number, 10) || 1;
    }

    protected getRequiredConfirmation(): number {
        return parseInt(this.getNetworkConfig().REQUIRED_CONFIRMATION, 10);
    }

    protected abstract processBlocks(fromBlock: number, toBlock: number, latestBlock: number): Promise<void>;

    protected abstract getBlockCount(): Promise<number>;
}

export default BaseEventLogCrawler;

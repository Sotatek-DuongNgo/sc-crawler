import { getConnection } from "typeorm";
import { chain, concat, isEmpty } from 'lodash';
import { getWeb3ProviderLink } from '../Utils';
import { IEventLogCrawlerOptions } from '../interfaces';
import { CrawlStatus, ContractEvent } from '../entities';
import BaseIntervalWorker from './BaseIntervalWorker';
import pLimit from "p-limit";

const Web3 = require("web3");
const limit = pLimit(5);

export class EventCrawlerByWeb3 extends BaseIntervalWorker {

  constructor (options: IEventLogCrawlerOptions) {
    super(options);
  }

  protected async processBlocks (
    fromBlockNumber: number,
    toBlockNumber: number,
    latestNetworkBlock: number): Promise<void> {
    console.log(
      `processBlocks BEGIN_PROCESS_BLOCKS: ${fromBlockNumber} → ${toBlockNumber} / ${latestNetworkBlock}`
    );

    const web3: any = new Web3(getWeb3ProviderLink());
    const contract = new web3.eth.Contract(this.getContractConfig().abi, this.getContractConfig().address);

    const eventLogs = await contract.getPastEvents(
      "allEvents",
      { fromBlock: fromBlockNumber, toBlock: toBlockNumber },
      (err: any) => {
        !!err && console.error(err);
      }
    );

    const blockInfos = await this.getBlockTimeByBlockNumbers(eventLogs);
    const formatEventLogs = eventLogs.map((event: any) => {
      return { ...event, blockTime: blockInfos[event.blockNumber] };
    });

    console.log("eventLogs", formatEventLogs);

    await this.getOptions().onEventLogCrawled(this, formatEventLogs, toBlockNumber);

    console.log(
      `processBlocks FINISH_PROCESS_BLOCKS: ${fromBlockNumber} → ${toBlockNumber} logs:${formatEventLogs.length}`
    );

    await getConnection().transaction(async (manager) => {
        await this.saveEvents(manager, formatEventLogs, toBlockNumber);
        console.log(`Saved eventLogs !!!`);
    });
  }

  public async getBlockCount(): Promise<number> {
    const web3: any = new Web3(getWeb3ProviderLink());
    const latestBlockNumber = await web3.eth.getBlockNumber();
    return latestBlockNumber - this.getRequiredConfirmation();
  }

  private async getBlockTimeByBlockNumbers(eventLogs: []): Promise<object[]> {
    const blockNumbers = Array.from(
      new Set(eventLogs.map((log: any) => log.blockNumber))
    );
    const blockInfos = await Promise.all(
        blockNumbers.map(async (blockNumber: number) =>
        limit(() => this.getBlockInfo(blockNumber))
      )
    );
    return blockInfos.reduce((blockTimeByNumber: any, blockInfo: any) => {
        return {
          ...blockTimeByNumber,
          [blockInfo.number]: blockInfo.timestamp,
        };
      }, {});
    }

  private async getBlockInfo(blockNumber: number): Promise<object> {
    const web3 = new Web3(this.getOptions().networkConfig.WEB3_API_URL);
    return web3.eth.getBlock(blockNumber);
  }

  private async saveEvents (manager: any, eventLogs: any[], lastBlockNumber: number): Promise<void> {
    const events: ContractEvent[] = chain(eventLogs)
        .filter((logEvent: any) => !!logEvent.event)
        .map((logEvent: any) => {
            const event: ContractEvent = new ContractEvent();
            event.address = logEvent.address;
            event.blockHash = logEvent.blockHash;
            event.blockNumber = logEvent.blockNumber;
            event.blockTime = logEvent.blockTime;
            event.txHash = logEvent.transactionHash;
            event.txIndex = logEvent.transactionIndex;
            event.eventId = logEvent.id;
            event.event = logEvent.event;
            event.returnValues = JSON.stringify(logEvent.returnValues);
            return event;
        })
        .value();

    const contractEventRepo: any = manager.getRepository(ContractEvent);
    !isEmpty(events) && await contractEventRepo.save(events);

    const crawlStatusRepo: any = manager.getRepository(CrawlStatus);
    const lastCrawler = await crawlStatusRepo.findOne({ name: this.getContractConfig().name });
    lastCrawler.blockNumber = lastBlockNumber;
    await crawlStatusRepo.save(lastCrawler);
  }
}

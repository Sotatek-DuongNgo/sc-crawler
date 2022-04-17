import { getConnection, getRepository } from "typeorm";
import { CrawlStatus, ContractEvent } from "./entities";
import { IEventLogCrawlerOptions, IEventDataLog } from "./interfaces";
import { prepareEnvironment } from './Utils';
import { EventCrawlerByWeb3 } from "./fetchers/EventCrawlerByWeb3";
import config from "./configs/configs";
import { chain } from "lodash";

const getLatestCrawledBlockNumber = async (): Promise<number> => {
    const crawlStatusRepo: any = getRepository(CrawlStatus);
    const contract: any = config.CONTRACT.AIRDROP;
    let lastCrawler = await crawlStatusRepo.findOne({ name: contract.name });

    if (!lastCrawler) {
        lastCrawler = new CrawlStatus();
        lastCrawler.name = contract.name;
        lastCrawler.contractAddress = contract.address;
        lastCrawler.blockNumber = contract.firstBlock;

        await crawlStatusRepo.save(lastCrawler);
    }
    return +lastCrawler.blockNumber;
}

const start = async (): Promise<void> => {
    console.log(`Start crawling events of airdrop contract!!!`);

    const crawlerOpts: IEventLogCrawlerOptions = {
        onEventLogCrawled,
        getLatestCrawledBlockNumber,
        networkConfig: config,
        contractConfig: config.CONTRACT.AIRDROP
    };
    const crawler = new EventCrawlerByWeb3(crawlerOpts);
    crawler.start();
}

const onEventLogCrawled = async (
    crawler: EventCrawlerByWeb3,
    eventLogs: IEventDataLog[],
    lastBlockNumber: number
): Promise<void> => {
    await processEvents(eventLogs, lastBlockNumber);
}

const processEvents = async (eventLogs: IEventDataLog[], lastBlockNumber: number): Promise<void> => {
    console.log(`---Do something !!!`);
}

prepareEnvironment()
    .then(start)
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });

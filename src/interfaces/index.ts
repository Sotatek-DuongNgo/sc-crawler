import { EntityManager } from "typeorm";
import BaseIntervalWorker from '../fetchers/BaseIntervalWorker';

export interface IEventDataLog {
    [key: string]: any,
    returnValues: string[]
}

export interface IEventLogCrawlerOptions {
    readonly onEventLogCrawled: (
        crawler: BaseIntervalWorker,
        eventLogs: any,
        lastBlockNumber: number
    ) => Promise<void>;
    readonly getLatestCrawledBlockNumber: () => Promise<number>;
    readonly networkConfig: any;
    readonly contractConfig: any;
}

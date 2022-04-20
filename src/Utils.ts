import { createConnection } from 'typeorm';
import ormconfig from '../ormconfig'
import networkConfig from "./configs/configs";

export const prepareEnvironment = async (): Promise<void> => {
    console.log(`Application has been started.`);
    console.log(`Preparing DB connection...`);

    const dbConnection: any = { ...ormconfig, synchronize: false }
    const connection = await createConnection(dbConnection);
    // await connection.synchronize();

    console.log(`Environment has been setup successfully...`);
    return;
}

export const getWeb3ProviderLink = (): string => {
    const DELIMITER_CHAR: string = ',';
    const WEB3_API_URLS = networkConfig.WEB3_API_URL.split(DELIMITER_CHAR);
    const randomElement = WEB3_API_URLS[Math.floor(Math.random() * WEB3_API_URLS.length)];
    return randomElement;
}

export const truncateAddressHash = (s: string) => {
    return s.replace('000000000000000000000000', '');
};

export const currentSecond = () => {
    return Math.floor(Date.now() / 1000);
}

export const nowInMillis = () => {
    return (Date.now() / 1000) | 0;
}

export const sleeping = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function reflect(promise: any) {
  return promise
    .then((data: any) => {
      return { data, status: 'resolved' };
    })
    .catch((error: any) => {
      return { error, status: 'rejected' };
    });
}

/**
 * promise all and handle error message
 * @param values
 * @constructor
 */
export async function PromiseAll(values: any[]): Promise<any[]> {
  let results: any[];
  await (async () => {
    return await Promise.all(values.map(reflect));
  })().then(async res => {
    const errors: any[] = [];
    results = res.map(r => {
      if (r.status === 'rejected') {
        errors.push(r.error);
      }
      return r.data;
    });
    if (errors.length !== 0) {
      // have lots of error, throw first error
      throw errors[0];
    }
  });
  return results;
}

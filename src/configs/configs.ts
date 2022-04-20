import * as dotenv from "dotenv";
dotenv.config();

import * as AIRDROP_JSON from "./contracts/Airdrop.json";

export default {
    WEB3_API_URL: process.env.RPC_URL,
    AVERAGE_BLOCK_TIME: process.env.AVERAGE_BLOCK_TIME,
    REQUIRED_CONFIRMATION: process.env.REQUIRED_CONFIRMATION,
    DEFAULT_BLOCK_NUM_IN_ONE_GO: process.env.DEFAULT_BLOCK_NUM_IN_ONE_GO,
    DEFAULT_BREAK_TIME_AFTER_ONE_GO: process.env.DEFAULT_BREAK_TIME_AFTER_ONE_GO,
    CONTRACT: {
        AIRDROP: {
            name: process.env.SC_AIRDROP_NAME,
            address: process.env.SC_AIRDROP_ADDRESS,
            abi: AIRDROP_JSON.abi,
            firstBlock: process.env.SC_AIRDROP_FIRST_BLOCK,
            NEED_NOTIFY_BY_WEBHOOK: true
        }
    }
};

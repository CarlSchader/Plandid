import { millisecondMap } from "./constants";

export default {
    url: 'http://carlschader.com',
    appName: 'Plandid',
    tiers: {
        free: {
            forwardMillis: 31 * millisecondMap.day,
            storageMillis: 14 * millisecondMap.day
        },
        small: {
            forwardMillis: 31 * 6 * millisecondMap.day,
            storageMillis: 365 * 2 * millisecondMap.day
        },
        large: {
            forwardMillis: 365 * 5 * millisecondMap.day,
            storageMillis: 365 * 20 * millisecondMap.day
        }
    }
};

export const REWARD_CONDITIONS = [
    'ITEM', 'POINT', 'COUPON', 'CURRENCY'
] as const;

export type RewardCondition = (typeof REWARD_CONDITIONS)[number];

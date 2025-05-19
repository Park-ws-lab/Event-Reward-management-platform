export const EVENT_CONDITIONS = [
  'FIRST_LOGIN',
  'INVITE_THREE',
  'LOGIN_THREE',
  'LOGIN_SEVEN_RECENT',
  'DAILY_LOGIN',
] as const;

export type EventCondition = (typeof EVENT_CONDITIONS)[number];

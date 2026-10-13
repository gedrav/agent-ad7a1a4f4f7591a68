export type JackpotTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';

export const JACKPOT_TIERS: readonly JackpotTier[] = ['BRONZE', 'SILVER', 'GOLD', 'DIAMOND'] as const;
export const JACKPOT_WIN_DURATION: readonly number[] = [2000, 3000, 4000, 5000] as const;

export const JACKPOT_SKINS = ['bronze', 'silver', 'gold', 'diamond'] as const;
export const TEXT_UPDATE_INTERVAL = 5;

export interface IJackpotInfo {
  poolId: string;
  configVersion: number;
  demo: boolean;
  available: boolean;
  currency: string;
  rtp: number;
  minEligibleBet: number;
  eligibleBetTypes: ['BASE'];
  tiers: { tier: JackpotTier; value: number }[];
  v: number;
}

export interface IJackpotPick {
  position: number;
  tier: JackpotTier;
}

export interface IJackpotRound {
  status: 'PENDING' | 'COMPLETED';
  roundId: string;
  cards: 12;
  frozenMeters: number[];
  picks: IJackpotPick[];
  pick?: IJackpotPick;
  wonTier?: JackpotTier;
  amount?: number;
  totalWin?: number;
  remaining?: IJackpotPick[];
}

export interface IJackpotPickResponse {
  gameId: string;
  roundId: string;
  closed: boolean;
  playerInfo: { playerId: string; balance?: number; endTime?: number };
  jackpot: IJackpotRound;
}

export interface JackpotMetersMessage {
  poolId: string;
  version: number;
  currency: string;
  meters: number[];
  demo: boolean;
}

export interface JackpotWonMessage {
  poolId: string;
  tier: JackpotTier;
  amount: number;
  currency: string;
  player: string;
  gameName?: string;
  gameAlias?: string;
}

export interface JackpotPoolChangedMessage {
  poolId: string;
}

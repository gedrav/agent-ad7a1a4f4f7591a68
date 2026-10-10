export type JackpotTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';

export const JACKPOT_TIERS: readonly JackpotTier[] = ['BRONZE', 'SILVER', 'GOLD', 'DIAMOND'] as const;

export const JACKPOT_SKINS = ['bronze', 'silver', 'gold', 'diamond'] as const;

export interface IJackpotInfo {
  poolId: string;
  configVersion: number;
  demo: boolean;
  available: boolean;
  currency: string;
  rtp: number;
  minEligibleBet: number;
  eligibleBetTypes: ['BASE'];
  tiers: { tier: JackpotTier; suit: string; value: number }[];
  v: number;
}

export interface IJackpotPick {
  position: number;
  tier: JackpotTier;
  suit: string;
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

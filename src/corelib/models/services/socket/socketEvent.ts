export enum SocketEventsToServer {
  UPDATE_PLAYER_POSITION = 'updatePlayerPosition',
}

export enum SocketEventsFromServer {
  TEAM_RATINGS_UPDATED = 'teamRatingsUpdated',
  USER_BALANCE_UPDATE = 'USER_BALANCE_UPDATE',
  USER_COIN_UPDATE = 'USER_COIN_UPDATE',
  NOTIFICATION = 'notification',
  SHOW_POPUP = 'SHOW_POPUP',
}

export interface TeamRatingsSocketResponse {
  attackRating: number;
  defenseRating: number;
  overallRating: number;
  creativityRating: number;
  chemistry: number;
  chemistryPercentage: number;
}

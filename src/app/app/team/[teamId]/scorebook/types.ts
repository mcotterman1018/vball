// Shared shape for a saved scorebook set — used by the authenticated team
// save action, the ScorebookClient, and the bookkeeper token save path.
export type ScorebookSetInput = {
  setNumber: number;
  homeScore: number;
  awayScore: number;
  homeLine: string[];
  awayLine: string[];
  homeLibero: string;
  awayLibero: string;
  homeGrid: (number | string)[][];
  awayGrid: (number | string)[][];
  homeCircled: number[][];
  awayCircled: number[][];
  pointLog: unknown[];
  subLog: unknown[];
  timeoutLog: unknown[];
};

export type ScorebookSavePayload = {
  homeTeam: string;
  awayTeam: string;
  format: number;
  sets: ScorebookSetInput[];
};

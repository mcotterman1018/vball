// NFHS stat definitions, sections, and derived-stat math — ported from the prototype.

export type StatDef = { label: string; short: string; color: string };

export const STATS: Record<string, StatDef> = {
  serveAttempt: { label: "Serve Att", short: "SA", color: "var(--color-navy)" },
  ace: { label: "Ace", short: "A", color: "var(--color-green)" },
  serveError: { label: "Serve Err", short: "SE", color: "var(--color-red)" },
  attackAttempt: { label: "Attack Att", short: "ATT", color: "var(--color-navy)" },
  kill: { label: "Kill", short: "K", color: "var(--color-green)" },
  attackError: { label: "Attack Err", short: "E", color: "var(--color-red)" },
  reception: { label: "Reception", short: "R", color: "var(--color-navy)" },
  receptionError: { label: "Recept Err", short: "RE", color: "var(--color-red)" },
  blockSolo: { label: "Block Solo", short: "BS", color: "var(--color-green)" },
  blockAssist: { label: "Block Ast", short: "BA", color: "var(--color-gold)" },
  blockError: { label: "Block Err", short: "BE", color: "var(--color-red)" },
  ballHandlingAttempt: { label: "BH Att", short: "BHA", color: "var(--color-navy)" },
  assist: { label: "Assist", short: "AST", color: "var(--color-green)" },
  ballHandlingError: { label: "BH Err", short: "BHE", color: "var(--color-red)" },
  dig: { label: "Dig", short: "D", color: "var(--color-green)" },
  digError: { label: "Dig Err", short: "DE", color: "var(--color-red)" },
};

export const SECTIONS: { label: string; keys: string[] }[] = [
  { label: "Serves", keys: ["serveAttempt", "ace", "serveError"] },
  { label: "Attacks", keys: ["attackAttempt", "kill", "attackError"] },
  { label: "Service Receptions", keys: ["reception", "receptionError"] },
  { label: "Blocks", keys: ["blockSolo", "blockAssist", "blockError"] },
  { label: "Ball Handling", keys: ["ballHandlingAttempt", "assist", "ballHandlingError"] },
  { label: "Digs", keys: ["dig", "digError"] },
];

export type StatCounts = Record<string, number>;

export type DerivedStats = {
  sa: number; a: number; se: number;
  att: number; k: number; e: number; hp: number;
  r: number; re: number; rpct: number;
  bs: number; ba: number; be: number;
  bha: number; ast: number; bhe: number;
  d: number; de: number; pts: number;
};

export function calc(s: StatCounts = {}): DerivedStats {
  const sa = s.serveAttempt || 0, a = s.ace || 0, se = s.serveError || 0;
  const att = s.attackAttempt || 0, k = s.kill || 0, e = s.attackError || 0;
  const totAtt = Math.max(att, k + e);
  const hp = totAtt > 0 ? (k - e) / totAtt : 0;
  const r = s.reception || 0, re = s.receptionError || 0, totR = r + re;
  const rpct = totR > 0 ? r / totR : 0;
  const bs = s.blockSolo || 0, ba = s.blockAssist || 0, be = s.blockError || 0;
  const bha = s.ballHandlingAttempt || 0, ast = s.assist || 0, bhe = s.ballHandlingError || 0;
  const d = s.dig || 0, de = s.digError || 0;
  const pts = k + a + bs + ba * 0.5;
  return { sa, a, se, att: totAtt, k, e, hp, r, re, rpct, bs, ba, be, bha, ast, bhe, d, de, pts };
}

// Format a hitting percentage like volleyball convention: .250, -.100, 1.000
export function fmtPct(hp: number, hasAtt: boolean): string {
  if (!hasAtt) return "—";
  const sign = hp < 0 ? "-" : "";
  const rounded = Math.round(Math.abs(hp) * 1000); // 0..1000
  if (rounded >= 1000) return sign + "1.000";
  return sign + "." + String(rounded).padStart(3, "0");
}

import { useState, useReducer, useEffect, useRef } from "react";


/* ─── THEME ─── */
const T = {
  bg: "#EBEAE4", bgAlt: "#E3E1D9", bgDeep: "#DAD8D0",
  surface: "#FFFFFF", surfaceWarm: "#F6F5F0",
  border: "#DAD8D0", borderLight: "#E7E5DD",
  text: "#2E2440", textSec: "#6B6270", textTer: "#9A8F96",
  navy: "#2E2440", navyMid: "#3D2F55", navyLight: "#4A3A66",
  navyBg: "#EEE9F5", navyBorder: "#CBBEDF",
  accent: "#5B3A8C", accentBg: "#EEE9F5", accentBorder: "#B99FDB",
  gold: "#1E6B6B", goldBg: "#E4F0EF", goldBorder: "#8DC3C0",
  green: "#166638", greenBg: "#E4F5EC", greenBorder: "#85CCA8",
  red: "#B23A3A", redBg: "#F7E7E7", redBorder: "#E0A5A5",
  blue: "#1E6B6B", blueBg: "#E4F0EF", blueBorder: "#8DC3C0",
  yellow: "#8A6A12", yellowBg: "#F6EED2", yellowBorder: "#DCC77E",
  libero: "#1E6B6B", liberoBg: "#E4F0EF", liberoBorder: "#8DC3C0",
  shadow: "0 2px 8px rgba(46,36,64,0.08), 0 8px 28px rgba(46,36,64,0.07)",
  shadowSm: "0 1px 4px rgba(46,36,64,0.09)",
  shadowLg: "0 12px 52px rgba(46,36,64,0.18)",
  dk: "#16111F", dkSurface: "#241C38", dkCard: "#2E2440",
  dkBorder: "#3D2F55", dkText: "#EFEAF5", dkTextSec: "#9E92B4",
};
const F  = "'Familjen Grotesk', sans-serif";
const FL = "'Barlow Semi Condensed', sans-serif";

/* ─── ICONS ─── */
const paths = {
  barChart: "M3 12h4v9H3zm7-5h4v14h-4zm7-4h4v18h-4z",
  clipboard: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6M9 16h4",
  book: "M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2zM9 7h6M9 11h6",
  users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  calendar: "M3 6h18M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
  arrowLeft: "M19 12H5M12 19l-7-7 7-7",
  arrowRight: "M5 12h14M12 5l7 7-7 7",
  plus: "M12 5v14M5 12h14",
  x: "M18 6L6 18M6 6l12 12",
  check: "M20 6L9 17l-5-5",
  edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4z",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6",
  chevronRight: "M9 18l6-6-6-6",
  trendingUp: "M3 17l6-6 4 4 8-8M17 7h4v4",
  chevronDown: "M6 9l6 6 6-6",
  trophy: "M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0012 0V2z",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
};
const Ic = ({ n, size=20, color="currentColor", sw=1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={paths[n] || ""} />
  </svg>
);

/* ─── DATA ─── */
const STATS = {
  serveAttempt: { label: "Serve Att", short: "SA", color: T.navy },
  ace: { label: "Ace", short: "A", color: T.green },
  serveError: { label: "Serve Err", short: "SE", color: T.red },
  attackAttempt: { label: "Attack Att", short: "ATT", color: T.navy },
  kill: { label: "Kill", short: "K", color: T.green },
  attackError: { label: "Attack Err", short: "E", color: T.red },
  reception: { label: "Reception", short: "R", color: T.navy },
  receptionError: { label: "Recept Err", short: "RE", color: T.red },
  blockSolo: { label: "Block Solo", short: "BS", color: T.green },
  blockAssist: { label: "Block Ast", short: "BA", color: T.gold },
  blockError: { label: "Block Err", short: "BE", color: T.red },
  ballHandlingAttempt: { label: "BH Att", short: "BHA", color: T.navy },
  assist: { label: "Assist", short: "AST", color: T.green },
  ballHandlingError: { label: "BH Err", short: "BHE", color: T.red },
  dig: { label: "Dig", short: "D", color: T.green },
  digError: { label: "Dig Err", short: "DE", color: T.red },
};
const SECTIONS = [
  { label: "Serves", keys: ["serveAttempt", "ace", "serveError"] },
  { label: "Attacks", keys: ["attackAttempt", "kill", "attackError"] },
  { label: "Service Receptions", keys: ["reception", "receptionError"] },
  { label: "Blocks", keys: ["blockSolo", "blockAssist", "blockError"] },
  { label: "Ball Handling", keys: ["ballHandlingAttempt", "assist", "ballHandlingError"] },
  { label: "Digs", keys: ["dig", "digError"] },
];
const COURT_POS = [
  { id: 4, label: "IV", left: "12%", top: "18%" }, { id: 3, label: "III", left: "44%", top: "18%" },
  { id: 2, label: "II", left: "76%", top: "18%" }, { id: 5, label: "V", left: "12%", top: "58%" },
  { id: 6, label: "VI", left: "44%", top: "58%" }, { id: 1, label: "I", left: "76%", top: "58%" },
];
const CATEGORIES = ["All", "Warmup", "Passing", "Setting", "Attacking", "Serving", "Blocking", "Defense", "Game Play"];
const DEFAULT_DRILLS = [
  { id: "d1", name: "Pepper", cat: "Warmup", dur: 10, desc: "Partners pass-set-hit in sequence", focus: "Ball control", notes: "", videoUrl: "" },
  { id: "d2", name: "Butterfly Passing", cat: "Passing", dur: 12, desc: "Continuous serve receive with rotation", focus: "Serve receive", notes: "", videoUrl: "" },
  { id: "d3", name: "Queen of the Court", cat: "Game Play", dur: 15, desc: "Winners stay, losers rotate off", focus: "Competitive play", notes: "", videoUrl: "" },
  { id: "d4", name: "Serving Lines", cat: "Serving", dur: 10, desc: "Targets on court, players serve to zones 1-5", focus: "Serve accuracy", notes: "", videoUrl: "" },
  { id: "d5", name: "Block-Hit-Cover", cat: "Blocking", dur: 12, desc: "3-person blocking drill with transition to attack", focus: "Block footwork", notes: "", videoUrl: "" },
  { id: "d6", name: "Triangle Setting", cat: "Setting", dur: 10, desc: "Setter works triangle: outside-middle-right side", focus: "Set accuracy", notes: "", videoUrl: "" },
  { id: "d7", name: "Dig & Dive", cat: "Defense", dur: 10, desc: "Coach-driven balls, players dig and recover", focus: "Defensive technique", notes: "", videoUrl: "" },
  { id: "d8", name: "6v6 Wash Drill", cat: "Game Play", dur: 20, desc: "3-rally wash: serve receive, free ball, down ball", focus: "Transition", notes: "", videoUrl: "" },
  { id: "d9", name: "Hitting Lines", cat: "Attacking", dur: 12, desc: "Setters feed hitters from left, middle, right", focus: "Approach & swing", notes: "", videoUrl: "" },
  { id: "d10", name: "Serve Receive to Attack", cat: "Passing", dur: 15, desc: "Full pass-set-hit sequence off live serve", focus: "First ball sideout", notes: "", videoUrl: "" },
  { id: "d11", name: "Shuttle Footwork", cat: "Warmup", dur: 8, desc: "Lateral shuffle, crossover, sprint patterns", focus: "Footwork", notes: "", videoUrl: "" },
  { id: "d12", name: "Free Ball Transition", cat: "Game Play", dur: 12, desc: "Coach sends free ball, team runs full offense", focus: "Offensive system", notes: "", videoUrl: "" },
  { id: "d13", name: "Jousting Drill", cat: "Blocking", dur: 8, desc: "Partners at net press ball simultaneously", focus: "Net play", notes: "", videoUrl: "" },
  { id: "d14", name: "Pass & Move", cat: "Passing", dur: 10, desc: "Pass then immediately move to next position", focus: "Movement after contact", notes: "", videoUrl: "" },
  { id: "d15", name: "Team Serve & Receive", cat: "Serving", dur: 15, desc: "Full team serve receive with scoring system", focus: "Pressure serving", notes: "", videoUrl: "" },
];
const mkRoster = () => Array.from({ length: 12 }, (_, i) => ({ num: i + 1, name: "Player " + (i + 1), lib: false }));

// Build full team name: "Lincoln School District Varsity"
const fullTeamName = (org, levelName, teamName) => {
  const parts = [];
  if (org?.name) parts.push(org.name);
  if (teamName) parts.push(teamName);
  return parts.join(" ");
};
// Find a team's level name within an org
const findLevelName = (org, teamId) => {
  if (!org?.levels) return "";
  for (const lv of org.levels) { if (lv.teams.find(t=>t.id===teamId)) return lv.name; }
  return "";
};

const init = {
  authPage: "welcome", loggedIn: false, currentUser: null,
  orgs: [], currentOrgId: null, currentTeamId: null,
  currentGameId: null, homeTeamName: "", awayTeamName: "", matchDate: "",
  page: "teamHome", tab: "roster",
  roster: mkRoster(), lineup: [null,null,null,null,null,null], selPos: null,
  score: [0,0], set: 1, sets: [], serving: true, rot: 0,
  stats: {}, log: [], selPlayer: null, editIdx: null, view: "court",
  customStats: {}, customSections: [],
  matchHistory: [], confirmEnd: false, schedule: [], viewMatchIdx: null,
  drillLibrary: [...DEFAULT_DRILLS],
  practices: [], currentPractice: null, practiceItems: [],
  practiceTitle: "", practiceDuration: 90, practiceDate: "", practiceNotes: "",
  drillFilter: "All", editingDrill: null, newDrill: false,
  newDrillData: { name: "", cat: "Warmup", dur: 10, desc: "", focus: "", notes: "", videoUrl: "" },
  sbPage: "sbSetup", sbHomeTeam: "Home", sbAwayTeam: "Away", sbFormat: 3,
  sbHomeLine: ["8","15","3","22","11","7"], sbAwayLine: ["5","12","9","21","6","14"],
  sbHomeLib: "4", sbAwayLib: "10",
  sbSet: 1, sbSetData: [], sbServing: "home",
  sbHomeScore: 0, sbAwayScore: 0, sbHomeSubs: 0, sbAwaySubs: 0,
  sbHomeTO: 0, sbAwayTO: 0, sbHomeRot: 0, sbAwayRot: 0,
  sbHomeGrid: [[],[],[],[],[],[]], sbAwayGrid: [[],[],[],[],[],[]], 
  sbHomeCircled: [[],[],[],[],[],[]], sbAwayCircled: [[],[],[],[],[],[]],
  sbHomePlayers: [[],[],[],[],[],[]], sbAwayPlayers: [[],[],[],[],[],[]],
  sbHomeTimeouts: [], sbAwayTimeouts: [],
  sbPointLog: [], sbSubLog: [], sbTOLog: [], sbMatchDone: false, sbSavedBooks: [],
};

function rd(state, a) {
  switch (a.t) {
    case "goWelcome": return { ...state, authPage: "welcome" };
    case "goSeasonStats": return { ...state, page: "seasonStats" };
    case "loadTestData": {
      const mkTestRoster = (names) => names.map((n,i)=>({ num: n[0], name: n[1], lib: n[2]||false, pos: n[3]||"" }));
      const varsityRoster = mkTestRoster([[1,"Ava Chen",false,"S"],[3,"Maya Torres",false,"OH"],[5,"Jordan Kim",false,"MB"],[7,"Riley Scott",false,"OPP"],[8,"Sam Park",false,"OH"],[11,"Casey Lee",false,"MB"],[4,"Dana Cruz",true,"L"],[12,"Quinn Ray",false,"DS"],[15,"Alex Webb",false,"S"],[22,"Jamie Fox",false,"OH"]]);
      const jvRoster = mkTestRoster([[2,"Taylor Reed",false,"OH"],[6,"Morgan Bell",false,"MB"],[9,"Drew Hayes",false,"S"],[10,"Jesse Ford",false,"OPP"],[13,"Robin Lane",false,"MB"],[14,"Sky Mora",false,"OH"],[7,"Pat Nunez",true,"L"]]);
      const eighthRoster = mkTestRoster([[1,"Kai Bloom",false,"OH"],[4,"Nico Vale",false,"S"],[5,"Emery Dash",false,"MB"],[8,"Sage Wren",false,"OPP"],[12,"River Cole",false,"OH"],[16,"Wren Ash",false,"MB"],[3,"Blair Fox",true,"L"]]);
      const orgId="org_test", uid="user_test";
      const hsLevel={ id:"level_hs", name:"High School", teams:[
        { id:"team_varsity", name:"Varsity", roster:varsityRoster },
        { id:"team_jv", name:"JV", roster:jvRoster },
        { id:"team_fresh", name:"Freshman", roster:mkRoster() },
      ]};
      const msLevel={ id:"level_ms", name:"Middle School", teams:[
        { id:"team_8th", name:"8th Grade", roster:eighthRoster },
        { id:"team_7th", name:"7th Grade", roster:mkRoster() },
      ]};
      const org={ id:orgId, name:"Lincoln School District", code:"LSD", levels:[hsLevel,msLevel],
        coaches:[
          { id:uid, name:"Coach Taylor", email:"coach@lincoln.edu", levelIds:["level_hs"], favoriteTeams:["team_varsity"] },
          { id:"user_c2", name:"Coach Rivera", email:"rivera@lincoln.edu", levelIds:["level_ms"] },
        ], drillLibrary:[...DEFAULT_DRILLS] };
      const testSchedule=[
        { id:"g1", opponent:"Riverside High", homeAway:"Home", date:"2026-04-15" },
        { id:"g2", opponent:"Central Prep", homeAway:"Away", date:"2026-04-18" },
        { id:"g3", opponent:"Oak Valley", homeAway:"Home", date:"2026-04-22" },
        { id:"g4", opponent:"Westfield Academy", homeAway:"Away", date:"2026-04-25" },
        { id:"g5", opponent:"Northgate", homeAway:"Home", date:"2026-04-29" },
        { id:"g6", opponent:"Summit Charter", homeAway:"Away", date:"2026-05-02" },
      ];
      const testStats={}; varsityRoster.forEach(p=>{const att=Math.floor(Math.random()*18)+4;const k=Math.floor(Math.random()*Math.min(att,12));const e=Math.floor(Math.random()*4);testStats[p.num]={ serveAttempt:Math.floor(Math.random()*14), ace:Math.floor(Math.random()*4), serveError:Math.floor(Math.random()*3), attackAttempt:att, kill:k, attackError:e, reception:Math.floor(Math.random()*12), receptionError:Math.floor(Math.random()*3), blockSolo:Math.floor(Math.random()*3), blockAssist:Math.floor(Math.random()*5), blockError:Math.floor(Math.random()*2), ballHandlingAttempt:p.pos==="S"?Math.floor(Math.random()*30)+10:Math.floor(Math.random()*6), assist:p.pos==="S"?Math.floor(Math.random()*20)+5:Math.floor(Math.random()*3), ballHandlingError:Math.floor(Math.random()*3), dig:Math.floor(Math.random()*12), digError:Math.floor(Math.random()*3) };});
      const testMatch={ date:"2026-04-15", sets:[[25,20],[23,25],[25,18]], stats:testStats, roster:varsityRoster, won:true, homeTeam:"Varsity", awayTeam:"Riverside High", gameId:"g1", matchDate:"2026-04-15" };
      const jvSchedule=[
        { id:"jg1", opponent:"Riverside High JV", homeAway:"Home", date:"2026-04-15" },
        { id:"jg2", opponent:"Central Prep JV", homeAway:"Away", date:"2026-04-18" },
      ];
      const msSchedule=[
        { id:"mg1", opponent:"Jefferson MS", homeAway:"Home", date:"2026-04-16" },
        { id:"mg2", opponent:"Madison MS", homeAway:"Away", date:"2026-04-20" },
      ];
      return { ...state, loggedIn:true, currentUser:{ id:uid, name:"Coach Taylor", email:"coach@lincoln.edu", role:"admin", orgId }, orgs:[org], currentOrgId:orgId, currentTeamId:"team_varsity", currentLevelId:"level_hs", authPage:"done", page:"teamHome", roster:varsityRoster, drillLibrary:[...DEFAULT_DRILLS], schedule:testSchedule, matchHistory:[testMatch], teamData:{ team_varsity:{ matchHistory:[testMatch], practices:[], sbSavedBooks:[], schedule:testSchedule }, team_jv:{ matchHistory:[], practices:[], sbSavedBooks:[], schedule:jvSchedule }, team_8th:{ matchHistory:[], practices:[], sbSavedBooks:[], schedule:msSchedule } } };
    }
    case "goLogin": return { ...state, authPage: "login" };
    case "goSignup": return { ...state, authPage: "signup" };
    case "goCreateOrg": return { ...state, authPage: "createOrg" };
    case "goJoinOrg": return { ...state, authPage: "joinOrg" };
    case "createOrg": {
      const orgId = "org_"+Date.now(), userId = "user_"+Date.now();
      const user = { id: userId, name: a.userName, email: a.email, role: "admin", orgId };
      const org = { id: orgId, name: a.orgName, code: a.orgCode.toUpperCase(), levels: [], coaches: [{ id: userId, name: a.userName, email: a.email, levelIds: [] }], drillLibrary: [...DEFAULT_DRILLS] };
      return { ...state, loggedIn: true, currentUser: user, orgs: [org], currentOrgId: orgId, currentTeamId: null, currentLevelId: null, authPage: "done", page: "teamHome", drillLibrary: [...DEFAULT_DRILLS] };
    }
    case "joinOrg": {
      const org = state.orgs.find(o => o.code === a.orgCode.toUpperCase());
      if (!org) return state;
      const userId = "user_"+Date.now();
      const user = { id: userId, name: a.userName, email: a.email, role: "coach", orgId: org.id };
      const updatedOrg = { ...org, coaches: [...org.coaches, { id: userId, name: a.userName, email: a.email, levelIds: a.levelId ? [a.levelId] : [] }] };
      return { ...state, loggedIn: true, currentUser: user, orgs: state.orgs.map(o => o.id === org.id ? updatedOrg : o), currentOrgId: org.id, currentTeamId: null, currentLevelId: a.levelId || null, authPage: "done", page: "teamHome", drillLibrary: org.drillLibrary || [...DEFAULT_DRILLS] };
    }
    case "login": {
      for (const org of state.orgs) {
        const coach = org.coaches.find(c => c.email === a.email);
        if (coach) {
          const role = org.coaches[0].id === coach.id ? "admin" : "coach";
          const levelId = coach.levelIds?.[0] || null;
          const level = levelId ? org.levels.find(l=>l.id===levelId) : null;
          const teamId = level ? level.teams[0]?.id : null;
          const team = level ? level.teams.find(t=>t.id===teamId) : null;
          return { ...state, loggedIn: true, currentUser: { id: coach.id, name: coach.name, email: coach.email, role, orgId: org.id }, currentOrgId: org.id, currentTeamId: teamId, currentLevelId: levelId, authPage: "done", page: "teamHome", roster: team ? team.roster : state.roster, drillLibrary: org.drillLibrary || [...DEFAULT_DRILLS] };
        }
      }
      return state;
    }
    case "logout": return { ...state, loggedIn: false, currentUser: null, currentOrgId: null, currentTeamId: null, authPage: "welcome", page: "teamHome" };
    case "selectTeam": {
      const org = state.orgs.find(o => o.id === state.currentOrgId);
      let team = null;
      if (org) for (const lv of (org.levels||[])) { const t = lv.teams.find(t=>t.id===a.teamId); if (t) { team = t; break; } }
      const td = { ...(state.teamData || {}) };
      if (state.currentTeamId) td[state.currentTeamId] = { matchHistory: state.matchHistory, practices: state.practices, sbSavedBooks: state.sbSavedBooks, schedule: state.schedule || [] };
      const newTd = td[a.teamId] || { matchHistory: [], practices: [], sbSavedBooks: [], schedule: [] };
      return { ...state, currentTeamId: a.teamId, roster: team ? team.roster : state.roster, teamData: td, matchHistory: newTd.matchHistory, practices: newTd.practices, sbSavedBooks: newTd.sbSavedBooks, schedule: newTd.schedule };
    }
    case "addTeam": {
      const teamId = "team_"+Date.now();
      const newTeam = { id: teamId, name: a.name, roster: mkRoster() };
      const levelId = a.levelId || state.currentLevelId;
      return { ...state, orgs: state.orgs.map(o => o.id === state.currentOrgId ? { ...o, levels: (o.levels||[]).map(lv => lv.id === levelId ? { ...lv, teams: [...lv.teams, newTeam] } : lv) } : o) };
    }
    case "addLevel": {
      const levelId = "level_"+Date.now();
      const newLevel = { id: levelId, name: a.name || "New Level", teams: [] };
      return { ...state, orgs: state.orgs.map(o => o.id === state.currentOrgId ? { ...o, levels: [...(o.levels||[]), newLevel] } : o) };
    }
    case "assignCoachToLevel": return { ...state, orgs: state.orgs.map(o => o.id === state.currentOrgId ? { ...o, coaches: o.coaches.map(c => c.id === a.coachId ? { ...c, levelIds: (c.levelIds||[]).includes(a.levelId) ? c.levelIds.filter(l => l !== a.levelId) : [...(c.levelIds||[]), a.levelId] } : c) } : o) };
    case "toggleFavoriteTeam": return { ...state, orgs: state.orgs.map(o => o.id === state.currentOrgId ? { ...o, coaches: o.coaches.map(c => c.id === state.currentUser?.id ? { ...c, favoriteTeams: (c.favoriteTeams||[]).includes(a.teamId) ? c.favoriteTeams.filter(t => t !== a.teamId) : [...(c.favoriteTeams||[]), a.teamId] } : c) } : o) };
    case "goTeamHome": return { ...state, page: "teamHome" };
    case "goHub": return { ...state, page: "home" };
    case "goHome": return { ...state, page: "home" };
    case "tab": return { ...state, tab: a.v };
    case "editPlayer": return { ...state, editIdx: a.v };
    case "updatePlayer": return { ...state, roster: state.roster.map((p,i) => i === a.i ? { ...p, ...a.d } : p) };
    case "addPlayer": {
      const maxNum = state.roster.reduce((m,p)=>Math.max(m,p.num||0),0);
      const newRoster = [...state.roster, { num: maxNum+1, name: "", lib: false, pos: "" }];
      return { ...state, roster: newRoster, editIdx: newRoster.length-1 };
    }
    case "removePlayer": return { ...state, roster: state.roster.filter((_,i)=>i!==a.i), editIdx: null };
    case "setLib": return { ...state, roster: state.roster.map((p,i) => ({ ...p, lib: i === a.i ? !p.lib : false })) };
    case "selPos": return { ...state, selPos: a.v };
    case "assign": { const l=[...state.lineup]; l[state.selPos]=a.num; return { ...state, lineup: l, selPos: null }; }
    case "start": { const s={}; state.roster.forEach(p => s[p.num]={}); return { ...state, page: "match", stats: s }; }
    case "selPlayer": return { ...state, selPlayer: state.selPlayer === a.v ? null : a.v };
    case "stat": {
      const s = JSON.parse(JSON.stringify(state.stats));
      if (!s[a.num]) s[a.num] = {};
      s[a.num][a.k] = (s[a.num][a.k] || 0) + 1;
      return { ...state, stats: s, log: [...state.log, { num: a.num, k: a.k }], selPlayer: null };
    }
    case "ptUs": { const sc=[state.score[0]+1, state.score[1]]; return state.serving ? { ...state, score: sc } : { ...state, score: sc, serving: true, rot: (state.rot+1)%6 }; }
    case "ptThem": return { ...state, score: [state.score[0], state.score[1]+1], serving: false };
    case "undo": {
      if (!state.log.length) return state;
      const log=[...state.log]; const last=log.pop();
      const s=JSON.parse(JSON.stringify(state.stats));
      if (s[last.num]?.[last.k]) s[last.num][last.k]--;
      return { ...state, stats: s, log };
    }
    case "endSet": return { ...state, sets: [...state.sets, [...state.score]], score: [0,0], set: state.set+1, serving: !state.serving, rot: 0 };
    case "view": return { ...state, view: a.v };
    case "goSetup": return { ...state, page: "setup", tab: "roster" };
    case "confirmEnd": return { ...state, confirmEnd: true };
    case "cancelEnd": return { ...state, confirmEnd: false };
    case "endMatch": {
      const fs=[...state.sets]; if (state.score[0]>0||state.score[1]>0) fs.push([...state.score]);
      const m={ date: new Date().toLocaleDateString(), sets: fs, stats: JSON.parse(JSON.stringify(state.stats)), roster: [...state.roster], won: fs.filter(s=>s[0]>s[1]).length > fs.filter(s=>s[1]>s[0]).length, homeTeam: a.homeTeam||state.homeTeamName||"Us", awayTeam: a.awayTeam||state.awayTeamName||"Them", gameId: state.currentGameId||null, matchDate: state.matchDate||null };
      return { ...state, page: "home", matchHistory: [...state.matchHistory, m], score: [0,0], set: 1, sets: [], serving: true, rot: 0, stats: {}, log: [], selPlayer: null, lineup: [null,null,null,null,null,null], confirmEnd: false };
    }
    case "addCustomStat": {
      const key="custom_"+Date.now();
      const cs={ ...state.customStats, [key]: { label: a.label, short: a.short||a.label.slice(0,3).toUpperCase(), color: a.color||T.navy } };
      let csecs=[...state.customSections];
      const catName = a.category || "Custom";
      const existingIdx = csecs.findIndex(s=>s.label===catName);
      if (existingIdx>=0) { csecs[existingIdx] = { ...csecs[existingIdx], keys: [...csecs[existingIdx].keys, key] }; }
      else { csecs.push({ label: catName, keys: [key] }); }
      return { ...state, customStats: cs, customSections: csecs };
    }
    case "editDrill": return { ...state, editingDrill: a.id };
    case "updateDrill": return { ...state, drillLibrary: state.drillLibrary.map(d => d.id===a.id ? { ...d, ...a.data } : d), orgs: state.orgs.map(o=>o.id===state.currentOrgId?{...o,drillLibrary:(o.drillLibrary||[]).map(d=>d.id===a.id?{...d,...a.data}:d)}:o) };
    case "closeEditDrill": return { ...state, editingDrill: null };
    case "deleteDrill": return { ...state, drillLibrary: state.drillLibrary.filter(d => d.id!==a.id), editingDrill: null, orgs: state.orgs.map(o=>o.id===state.currentOrgId?{...o,drillLibrary:(o.drillLibrary||[]).filter(d=>d.id!==a.id)}:o) };
    case "openNewDrill": return { ...state, newDrill: true, newDrillData: { name:"",cat:"Warmup",dur:10,desc:"",focus:"",notes:"",videoUrl:"" } };
    case "setNewDrillField": return { ...state, newDrillData: { ...state.newDrillData, [a.field]: a.value } };
    case "saveNewDrill": {
      if (!state.newDrillData.name) return state;
      const newDrill = { ...state.newDrillData, id:"custom_"+Date.now(), dur: parseInt(state.newDrillData.dur)||10 };
      return { ...state, drillLibrary: [...state.drillLibrary, newDrill], newDrill: false, orgs: state.orgs.map(o=>o.id===state.currentOrgId?{...o,drillLibrary:[...(o.drillLibrary||[]),newDrill]}:o) };
    }
    case "cancelNewDrill": return { ...state, newDrill: false };
    case "goPractice": return { ...state, page: "practice", currentPractice: null, practiceItems: [], practiceTitle: "", practiceDuration: 90, practiceDate: "", practiceNotes: "", drillFilter: "All", practiceMode: "list" };
    case "setPracticeField": return { ...state, [a.field]: a.value };
    case "addDrillToPlan": {
      const drill=state.drillLibrary.find(d=>d.id===a.id);
      if (!drill) return state;
      return { ...state, practiceItems: [...state.practiceItems, { type:"drill", ...drill, uid: Date.now()+Math.random() }] };
    }
    case "addBlock": return { ...state, practiceItems: [...state.practiceItems, { type:"block",name:a.name||"Block",dur:a.dur||15,drills:[],uid:Date.now()+Math.random() }] };
    case "addHeader": return { ...state, practiceItems: [...state.practiceItems, { type:"header",name:a.name||"Section",uid:Date.now()+Math.random() }] };
    case "addDrillToBlock": {
      const drill=state.drillLibrary.find(d=>d.id===a.drillId);
      if (!drill) return state;
      return { ...state, practiceItems: state.practiceItems.map((item,i) => i===a.blockIdx ? { ...item, drills: [...item.drills, { ...drill, uid: Date.now()+Math.random() }] } : item) };
    }
    case "removeFromBlock": return { ...state, practiceItems: state.practiceItems.map((item,i) => i===a.blockIdx ? { ...item, drills: item.drills.filter((_,j)=>j!==a.drillIdx) } : item) };
    case "updateBlock": return { ...state, practiceItems: state.practiceItems.map((item,i) => i===a.i ? { ...item, ...a.data } : item) };
    case "removeItem": return { ...state, practiceItems: state.practiceItems.filter((_,i)=>i!==a.i) };
    case "moveItem": {
      const items=[...state.practiceItems]; const ni=a.dir==="up"?a.i-1:a.i+1;
      if (ni<0||ni>=items.length) return state;
      [items[a.i],items[ni]]=[items[ni],items[a.i]];
      return { ...state, practiceItems: items };
    }
    case "savePractice": {
      const totalTime=state.practiceItems.reduce((s,item)=>s+(item.dur||0),0);
      const p={ id:state.currentPractice||Date.now(), title:state.practiceTitle||"Practice "+(state.practices.length+1), date:state.practiceDate||new Date().toLocaleDateString(), duration:state.practiceDuration, items:JSON.parse(JSON.stringify(state.practiceItems)), notes:state.practiceNotes, totalTime };
      const existing=state.practices.find(x=>x.id===state.currentPractice);
      const updatedPractices=existing ? state.practices.map(x=>x.id===state.currentPractice?p:x) : [...state.practices,p];
      return { ...state, practices: updatedPractices, practiceMode: "list", practiceItems: [], practiceTitle: "", practiceNotes: "", currentPractice: null };
    }
    case "viewPractice": {
      const p=state.practices.find(x=>x.id===a.id);
      return { ...state, page:"practice", currentPractice:a.id, practiceItems:p?.items||[], practiceTitle:p?.title||"", practiceDuration:p?.duration||90, practiceDate:p?.date||"", practiceNotes:p?.notes||"", practiceMode:"view", practiceLiveNotes:p?.liveNotes||"" };
    }
    case "deletePractice": return { ...state, practices: state.practices.filter(p=>p.id!==a.id), practiceMode:"list", currentPractice:null };
    case "setDrillFilter": return { ...state, drillFilter: a.v };
    case "addParallelBlock": return { ...state, practiceItems: [...state.practiceItems, { type:"parallel",dur:a.dur||15,blocks:[{name:a.name1||"Group A",drills:[]},{name:a.name2||"Group B",drills:[]}],uid:Date.now()+Math.random() }] };
    case "addDrillToParallelBlock": {
      const drill=state.drillLibrary.find(d=>d.id===a.drillId);
      if (!drill) return state;
      const items3=[...state.practiceItems]; const pBlock={...items3[a.blockIdx]};
      pBlock.blocks=pBlock.blocks.map((b,i)=>i===a.groupIdx?{...b,drills:[...b.drills,{...drill}]}:b);
      items3[a.blockIdx]=pBlock;
      return { ...state, practiceItems: items3 };
    }
    case "removeFromParallelBlock": {
      const items4=[...state.practiceItems]; const pBlock2={...items4[a.blockIdx]};
      pBlock2.blocks=pBlock2.blocks.map((b,i)=>i===a.groupIdx?{...b,drills:b.drills.filter((_,j)=>j!==a.drillIdx)}:b);
      items4[a.blockIdx]=pBlock2;
      return { ...state, practiceItems: items4 };
    }
    case "sbRemovePoint": {
      const rmTeam=a.team, rmIsHome=rmTeam==="home";
      const rmScoreKey=rmIsHome?"sbHomeScore":"sbAwayScore";
      if (state[rmScoreKey]<=0) return state;
      const rmLog=[...state.sbPointLog]; let rmIdx=-1;
      for (let i=rmLog.length-1;i>=0;i--){if(rmLog[i].team===rmTeam){rmIdx=i;break;}}
      if (rmIdx===-1) return state;
      const rmEntry=rmLog[rmIdx]; rmLog.splice(rmIdx,1);
      const rmGridKey=rmIsHome?"sbHomeGrid":"sbAwayGrid";
      const rmCircKey=rmIsHome?"sbHomeCircled":"sbAwayCircled";
      const rmGrid=state[rmGridKey].map(r=>[...r]);
      const rmCirc=state[rmCircKey].map(r=>[...r]);
      for (let ri=0;ri<6;ri++){const row=rmGrid[ri];for(let ci=row.length-1;ci>=0;ci--){if(row[ci]===rmEntry[rmIsHome?"homeScore":"awayScore"]){row.splice(ci,1);rmCirc[ri]=rmCirc[ri].filter(c=>c<row.length);break;}}if(rmGrid[ri].length<state[rmGridKey][ri].length)break;}
      return { ...state, [rmScoreKey]:state[rmScoreKey]-1, sbPointLog:rmLog, [rmGridKey]:rmGrid, [rmCircKey]:rmCirc };
    }
    case "goScorebook": {
      const org2=state.orgs.find(o=>o.id===state.currentOrgId);
      const team2=org2?org2.levels?.flatMap(l=>l.teams).find(t=>t.id===state.currentTeamId):null;
      const levelNm=findLevelName(org2,state.currentTeamId);
      const teamNm=team2?fullTeamName(org2,levelNm,team2.name):"Home";
      const g=a.game;
      const homeNm=g?(g.homeAway==="Home"?teamNm:g.opponent):teamNm;
      const awayNm=g?(g.homeAway==="Home"?g.opponent:teamNm):"Away";
      return { ...state, page:"scorebook", sbPage:"sbSetup", sbSet:1, sbHomeScore:0, sbAwayScore:0, sbHomeSubs:0, sbAwaySubs:0, sbHomeTO:0, sbAwayTO:0, sbHomeRot:0, sbAwayRot:0, sbHomeGrid:[[],[],[],[],[],[]], sbAwayGrid:[[],[],[],[],[],[]], sbHomeCircled:[[],[],[],[],[],[]], sbAwayCircled:[[],[],[],[],[],[]], sbHomePlayers:[[],[],[],[],[],[]], sbAwayPlayers:[[],[],[],[],[],[]], sbHomeTimeouts:[], sbAwayTimeouts:[], sbPointLog:[], sbSubLog:[], sbTOLog:[], sbSetData:[], sbMatchDone:false, sbServing:"home", sbHomeTeam:homeNm, sbAwayTeam:awayNm, currentGameId:g?g.id:null, sbHomeLine:state.sbHomeLine&&state.sbHomeLine.some(x=>x)?state.sbHomeLine:["8","15","3","22","11","7"], sbAwayLine:state.sbAwayLine&&state.sbAwayLine.some(x=>x)?state.sbAwayLine:["5","12","9","21","6","14"], sbHomeLib:state.sbHomeLib||"4", sbAwayLib:state.sbAwayLib||"10" };
    }
    case "sbField": return { ...state, [a.f]: a.v };
    case "sbStartSet": {
      if (state.sbHomeLine.some(x=>!x)||state.sbAwayLine.some(x=>!x)) return state;
      return { ...state, sbPage:"sbLive", sbHomePlayers:state.sbHomeLine.map(n=>[n]), sbAwayPlayers:state.sbAwayLine.map(n=>[n]), sbHomeTimeouts:[], sbAwayTimeouts:[] };
    }
    case "sbPoint": {
      const scoringTeam=a.team, servingTeam=state.sbServing, isHome=scoringTeam==="home";
      const hs=state.sbHomeScore+(isHome?1:0), as=state.sbAwayScore+(!isHome?1:0);
      const newPtVal=isHome?hs:as;
      let newServing=servingTeam, newHRot=state.sbHomeRot, newARot=state.sbAwayRot;
      const hGrid=state.sbHomeGrid.map(r=>[...r]), aGrid=state.sbAwayGrid.map(r=>[...r]);
      const hCircled=state.sbHomeCircled.map(r=>[...r]), aCircled=state.sbAwayCircled.map(r=>[...r]);
      if (scoringTeam===servingTeam) {
        if (servingTeam==="home") hGrid[newHRot]=[...hGrid[newHRot],newPtVal];
        else aGrid[newARot]=[...aGrid[newARot],newPtVal];
      } else {
        newServing=scoringTeam;
        if (scoringTeam==="home") { newHRot=(state.sbHomeRot+1)%6; hGrid[newHRot]=[...hGrid[newHRot],newPtVal]; const ci=hGrid[newHRot].length-1; if (!hCircled[newHRot].includes(ci)) hCircled[newHRot].push(ci); }
        else { newARot=(state.sbAwayRot+1)%6; aGrid[newARot]=[...aGrid[newARot],newPtVal]; const ci=aGrid[newARot].length-1; if (!aCircled[newARot].includes(ci)) aCircled[newARot].push(ci); }
      }
      const serverLine=newServing==="home"?state.sbHomeLine:state.sbAwayLine;
      const serverRot=newServing==="home"?newHRot:newARot;
      const entry={ team:scoringTeam, homeScore:hs, awayScore:as, server:serverLine[serverRot], serving:newServing, sideout:scoringTeam!==servingTeam };
      return { ...state, sbHomeScore:hs, sbAwayScore:as, sbServing:newServing, sbHomeRot:newHRot, sbAwayRot:newARot, sbPointLog:[...state.sbPointLog,entry], sbHomeGrid:hGrid, sbAwayGrid:aGrid, sbHomeCircled:hCircled, sbAwayCircled:aCircled };
    }
    case "sbCircle": {
      const key=a.team==="home"?"sbHomeCircled":"sbAwayCircled";
      const c=state[key].map(arr=>[...arr]);
      const idx=c[a.row].indexOf(a.col);
      if (idx>=0) c[a.row].splice(idx,1); else c[a.row].push(a.col);
      return { ...state, [key]:c };
    }
    case "sbUndo": {
      // Find the most recent action (point or timeout) and undo it
      const lastPt = state.sbPointLog.length > 0 ? state.sbPointLog[state.sbPointLog.length-1] : null;
      const lastTO = state.sbTOLog.length > 0 ? state.sbTOLog[state.sbTOLog.length-1] : null;
      // If no actions at all, nothing to undo
      if (!lastPt && !lastTO) return state;
      // Determine which happened most recently by comparing log positions
      // If there's a timeout and it was logged after the last point (or no points), undo the timeout
      if (lastTO && (!lastPt || state.sbTOLog.length > 0)) {
        // Check if timeout was the most recent action
        const toTeam = lastTO.team;
        const toKey = toTeam === "home" ? "sbHomeTO" : "sbAwayTO";
        const toListKey = toTeam === "home" ? "sbHomeTimeouts" : "sbAwayTimeouts";
        if (state[toKey] > 0 && state.sbTOLog.length > 0 && (!lastPt || (lastTO.homeScore === state.sbHomeScore && lastTO.awayScore === state.sbAwayScore))) {
          return { ...state, [toKey]: state[toKey] - 1, [toListKey]: state[toListKey].slice(0, -1), sbTOLog: state.sbTOLog.slice(0, -1) };
        }
      }
      // Otherwise undo the last point
      if (!lastPt) return state;
      const log=[...state.sbPointLog]; log.pop();
      let hs=0,as=0;
      log.forEach(p=>{hs=p.homeScore;as=p.awayScore;});
      if (!log.length) {hs=0;as=0;}
      return { ...state, sbPointLog:log, sbHomeScore:hs, sbAwayScore:as };
    }
    case "sbSub": {
      const isHome=a.team==="home";
      const subsKey=isHome?"sbHomeSubs":"sbAwaySubs";
      if (state[subsKey]>=18) return state;
      const lineKey=isHome?"sbHomeLine":"sbAwayLine";
      const line=[...state[lineKey]]; const idx=line.indexOf(String(a.out));
      if (idx===-1) return state;
      line[idx]=String(a.playerIn);
      const pk=isHome?"sbHomePlayers":"sbAwayPlayers";
      const players=state[pk].map(arr=>[...arr]); players[idx]=[...players[idx],String(a.playerIn)];
      const gk=isHome?"sbHomeGrid":"sbAwayGrid";
      const grid=state[gk].map(r=>[...r]); grid[idx]=[...grid[idx],"S"];
      return { ...state, [lineKey]:line, [subsKey]:state[subsKey]+1, [pk]:players, [gk]:grid, sbSubLog:[...state.sbSubLog,{team:a.team,out:a.out,playerIn:a.playerIn,set:state.sbSet,homeScore:state.sbHomeScore,awayScore:state.sbAwayScore}] };
    }
    case "sbTimeout": {
      const isHome=a.team==="home";
      const toKey=isHome?"sbHomeTO":"sbAwayTO";
      if (state[toKey]>=2) return state;
      const tlKey=isHome?"sbHomeTimeouts":"sbAwayTimeouts";
      const my=isHome?state.sbHomeScore:state.sbAwayScore, opp=isHome?state.sbAwayScore:state.sbHomeScore;
      return { ...state, [toKey]:state[toKey]+1, [tlKey]:[...state[tlKey],my+"-"+opp], sbTOLog:[...state.sbTOLog,{team:a.team,homeScore:state.sbHomeScore,awayScore:state.sbAwayScore}] };
    }
    case "sbEndSet": {
      const setResult={ set:state.sbSet, homeScore:state.sbHomeScore, awayScore:state.sbAwayScore, homeGrid:JSON.parse(JSON.stringify(state.sbHomeGrid)), awayGrid:JSON.parse(JSON.stringify(state.sbAwayGrid)), homeCircled:JSON.parse(JSON.stringify(state.sbHomeCircled)), awayCircled:JSON.parse(JSON.stringify(state.sbAwayCircled)), pointLog:[...state.sbPointLog], subLog:[...state.sbSubLog], homeLine:[...state.sbHomeLine], awayLine:[...state.sbAwayLine] };
      const newSetData=[...state.sbSetData,setResult];
      const needed=Math.ceil(state.sbFormat/2);
      const hw2=newSetData.filter(s=>s.homeScore>s.awayScore).length;
      const aw2=newSetData.filter(s=>s.awayScore>s.homeScore).length;
      return { ...state, sbSetData:newSetData, sbPage:"sbSetEnd", sbMatchDone:hw2>=needed||aw2>=needed };
    }
    case "sbEndMatch": {
      const book={ id:Date.now(), date:new Date().toLocaleDateString(), home:state.sbHomeTeam, away:state.sbAwayTeam, setData:state.sbSetData, format:state.sbFormat, homeLine:state.sbHomeLine, awayLine:state.sbAwayLine, homeLib:state.sbHomeLib, awayLib:state.sbAwayLib, gameId:state.currentGameId||null };
      return { ...state, page:"home", sbSavedBooks:[...state.sbSavedBooks,book] };
    }
    case "sbNextSet": {
      const ls=state.sbServing;
      return { ...state, sbPage:"sbSetup", sbSet:state.sbSet+1, sbHomeScore:0, sbAwayScore:0, sbHomeSubs:0, sbAwaySubs:0, sbHomeTO:0, sbAwayTO:0, sbHomeRot:0, sbAwayRot:0, sbHomeGrid:[[],[],[],[],[],[]], sbAwayGrid:[[],[],[],[],[],[]], sbHomeCircled:[[],[],[],[],[],[]], sbAwayCircled:[[],[],[],[],[],[]], sbHomePlayers:[[],[],[],[],[],[]], sbAwayPlayers:[[],[],[],[],[],[]], sbHomeTimeouts:[], sbAwayTimeouts:[], sbPointLog:[], sbSubLog:[], sbTOLog:[], sbServing:ls==="home"?"away":"home" };
    }
    case "sbBackToLive": return { ...state, sbPage:"sbLive" };
    case "sbBackToSetup": return { ...state, sbPage:"sbSetup" };
    case "addGame": return { ...state, schedule:[...(state.schedule||[]),{id:Date.now(),opponent:a.opponent,homeAway:a.homeAway,date:a.date}] };
    case "removeGame": return { ...state, schedule:(state.schedule||[]).filter(g=>g.id!==a.id) };
    case "viewMatchDetail": return { ...state, page:"matchDetail", viewMatchIdx:a.idx };
    case "startFromRoster": {
      const s2={}; state.roster.forEach(p=>s2[p.num]={});
      const org=state.orgs.find(o=>o.id===state.currentOrgId);
      const team=org?org.levels?.flatMap(l=>l.teams).find(t=>t.id===state.currentTeamId):null;
      const levelName=findLevelName(org,state.currentTeamId);
      const teamName=team?fullTeamName(org,levelName,team.name):"Us";
      // If a specific game was passed, use it; otherwise auto-detect next game
      let game=a.game;
      if(!game){const today=new Date().toISOString().split("T")[0];game=(state.schedule||[]).find(g=>g.date>=today)||(state.schedule||[])[0];}
      const homeName=game?(game.homeAway==="Home"?teamName:game.opponent):teamName;
      const awayName=game?(game.homeAway==="Home"?game.opponent:teamName):"Opponent";
      return { ...state, page:"match", stats:s2, lineup:state.lineup.every(x=>x!==null)?state.lineup:state.roster.filter(p=>!p.lib).slice(0,6).map(p=>p.num), homeTeamName:homeName, awayTeamName:awayName, matchDate:game?game.date:new Date().toLocaleDateString(), currentGameId:game?game.id:null };
    }
    default: return state;
  }
}

function getRotated(l,r) { return l.includes(null)?l:l.map((_,i)=>l[(i+r)%6]); }
function calc(stats,num) {
  const s=stats[num]||{};
  // Serves
  const sa=s.serveAttempt||0, a=s.ace||0, se=s.serveError||0;
  // Attacks — ATT is total attempts (kills and errors are subsets)
  const att=s.attackAttempt||0, k=s.kill||0, e=s.attackError||0;
  const totAtt=Math.max(att,k+e);
  const hp=totAtt>0?(k-e)/totAtt:0;
  // Service receptions
  const r=s.reception||0, re=s.receptionError||0, totR=r+re;
  const rpct=totR>0?r/totR:0;
  // Blocks
  const bs=s.blockSolo||0, ba=s.blockAssist||0, be=s.blockError||0;
  // Ball handling
  const bha=s.ballHandlingAttempt||0, ast=s.assist||0, bhe=s.ballHandlingError||0;
  // Digs
  const d=s.dig||0, de=s.digError||0;
  // Points = Kills + Aces + Block Solos + half Block Assists
  const pts=k+a+bs+(ba*0.5);
  return { sa,a,se,att:totAtt,k,e,hp,r,re,rpct,bs,ba,be,bha,ast,bhe,d,de,pts };
}

/* ─── SHARED COMPONENTS ─── */
const Pill = ({ label, color, bg }) => (
  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: bg||T.bgAlt, color: color||T.textTer, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</span>
);

function Modal({ children, onClose }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(13,27,62,0.45)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200 }} onClick={onClose}>
      <div className="slideup" onClick={e=>e.stopPropagation()} style={{ background:T.surface,borderRadius:20,padding:32,maxWidth:460,width:"92%",boxShadow:T.shadowLg }}>
        {children}
      </div>
    </div>
  );
}

const Label = ({ children }) => (
  <div style={{ fontSize:11,fontWeight:600,color:T.textTer,textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.07em",marginBottom:6 }}>{children}</div>
);

const Input = ({ style, ...rest }) => (
  <input style={{ width:"100%",padding:"12px 14px",fontSize:14,fontWeight:500,borderRadius:10,border:"1.5px solid "+T.border,background:T.bg,color:T.text,outline:"none",transition:"border-color 0.15s",...style }}
    onFocus={e=>e.target.style.borderColor=T.navy} onBlur={e=>e.target.style.borderColor=T.border} {...rest} />
);

const PrimaryBtn = ({ children, onClick, disabled, style }) => (
  <button onClick={onClick} disabled={disabled} style={{ padding:"13px 28px",fontSize:14,fontWeight:700,borderRadius:10,border:"none",background:disabled?T.bgDeep:T.navy,color:disabled?T.textTer:"#FFF",cursor:disabled?"default":"pointer",transition:"opacity 0.15s",letterSpacing:"-0.01em",...style }}>{children}</button>
);

const GhostBtn = ({ children, onClick, style }) => (
  <button onClick={onClick} style={{ padding:"11px 22px",fontSize:13,fontWeight:600,borderRadius:10,border:"1.5px solid "+T.border,background:"transparent",color:T.textSec,cursor:"pointer",...style }}>{children}</button>
);

const CourtBg = () => (
  <svg style={{ position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.06 }} viewBox="0 0 400 600" fill="none" stroke="white" strokeWidth="1.5">
    <rect x="40" y="80" width="320" height="440" rx="4"/>
    <line x1="40" y1="300" x2="360" y2="300"/>
    <line x1="200" y1="80" x2="200" y2="300"/>
    <rect x="120" y="80" width="160" height="80"/>
    <rect x="120" y="440" width="160" height="80"/>
    <circle cx="200" cy="300" r="40"/>
    <line x1="40" y1="220" x2="360" y2="220"/>
  </svg>
);

const FormCard = ({ title, sub, back, children }) => (
  <div style={{ minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F }}>
    <div className="fadein" style={{ width:"100%",maxWidth:400,padding:24 }}>
      <button onClick={back} style={{ display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:T.textSec,fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:32,padding:0 }}>
        <Ic n="arrowLeft" size={16} color={T.textSec} /> Back
      </button>
      <div style={{ fontSize:28,fontWeight:800,letterSpacing:"-0.03em",marginBottom:sub?6:28 }}>{title}</div>
      {sub && <div style={{ fontSize:14,color:T.textSec,marginBottom:28,lineHeight:1.5 }}>{sub}</div>}
      {children}
    </div>
  </div>
);

const AuthField = ({ label, children }) => (
  <div style={{ marginBottom:16 }}><Label>{label}</Label>{children}</div>
);

/* ─── AUTH ─── */
function AuthFlow({ S, D }) {
  const [form, setForm] = useState({ name:"",email:"",password:"",orgName:"",orgCode:"",teamName:"",levelId:null });
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));
  const state_orgs_find = (code) => code ? S.orgs.find(o=>o.code===code.toUpperCase()) : null;

  if (S.authPage === "welcome") return (
    <div style={{ minHeight:"100vh",display:"flex",fontFamily:F }}>
      {/* Left Panel */}
      <div style={{ flex:"0 0 52%",background:T.navy,position:"relative",overflow:"hidden",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:60 }}>
        <CourtBg />
        <div style={{ position:"relative",zIndex:1,textAlign:"center" }}>
          <div style={{ fontSize:52,fontWeight:800,color:"#FFF",letterSpacing:"-0.04em",lineHeight:1 }}>Court<span style={{ color:"rgba(255,255,255,0.45)" }}>IQ</span></div>
          <div style={{ fontSize:15,color:"rgba(255,255,255,0.4)",marginTop:12,fontWeight:500,letterSpacing:"0.02em" }}>Volleyball Coaching Platform</div>
          <div style={{ marginTop:56,display:"flex",flexDirection:"column",gap:10 }}>
            {[["Ball control","green"],["Live stats","libero"],["Practice planning","accent"]].map(([t,c])=>(
              <div key={t} style={{ display:"flex",alignItems:"center",gap:12 }}>
                <div style={{ width:8,height:8,borderRadius:99,background:T[c] }} />
                <span style={{ fontSize:14,color:"rgba(255,255,255,0.55)",fontWeight:500 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Right Panel */}
      <div style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:60,background:T.bg }}>
        <div style={{ width:"100%",maxWidth:360 }} className="fadein">
          <div style={{ fontSize:28,fontWeight:800,color:T.text,letterSpacing:"-0.03em",marginBottom:8 }}>Welcome back</div>
          <div style={{ fontSize:15,color:T.textSec,marginBottom:40,fontWeight:400 }}>Sign in or create a new account to get started.</div>
          <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
            <PrimaryBtn onClick={()=>D({t:"goSignup"})} style={{ width:"100%",padding:15,fontSize:15 }}>Create account</PrimaryBtn>
            <GhostBtn onClick={()=>D({t:"goLogin"})} style={{ width:"100%" }}>Sign in</GhostBtn>
          </div>
          <div style={{ marginTop:32,paddingTop:20,borderTop:"1px dashed "+T.border }}>
            <button onClick={()=>D({t:"loadTestData"})} style={{ width:"100%",padding:"12px",fontSize:13,fontWeight:700,background:T.accentBg,color:T.accent,border:"1px dashed "+T.accentBorder,borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
              ⚡ Load test data (skip setup)
            </button>
            <div style={{ fontSize:11,color:T.textTer,textAlign:"center",marginTop:8 }}>Loads a demo school with teams, rosters, schedule & stats</div>
          </div>
        </div>
      </div>
    </div>
  );

  if (S.authPage === "login") return (
    <FormCard title="Sign in" back={()=>D({t:"goWelcome"})}>
      <AuthField label="Email"><Input type="email" value={form.email} onChange={set("email")} placeholder="coach@school.edu" /></AuthField>
      <AuthField label="Password"><Input type="password" value={form.password} onChange={set("password")} placeholder="••••••••" /></AuthField>
      <PrimaryBtn onClick={()=>D({t:"login",email:form.email})} style={{ width:"100%",marginTop:8 }}>Sign in</PrimaryBtn>
    </FormCard>
  );

  if (S.authPage === "signup") return (
    <FormCard title="Create account" sub="Start coaching smarter." back={()=>D({t:"goWelcome"})}>
      <AuthField label="Your name"><Input value={form.name} onChange={set("name")} placeholder="Coach Smith" /></AuthField>
      <AuthField label="Email"><Input type="email" value={form.email} onChange={set("email")} placeholder="coach@school.edu" /></AuthField>
      <AuthField label="Password"><Input type="password" value={form.password} onChange={set("password")} placeholder="••••••••" /></AuthField>
      <div style={{ fontSize:13,color:T.textSec,margin:"20px 0 16px",textAlign:"center" }}>Joining an existing program or starting a new one?</div>
      <div style={{ display:"flex",gap:10 }}>
        <PrimaryBtn onClick={()=>D({t:"goCreateOrg"})} style={{ flex:1 }}>New org</PrimaryBtn>
        <GhostBtn onClick={()=>D({t:"goJoinOrg"})} style={{ flex:1 }}>Join org</GhostBtn>
      </div>
    </FormCard>
  );

  if (S.authPage === "createOrg") return (
    <FormCard title="New organization" sub="You'll be the admin. Share the org code with your coaching staff." back={()=>D({t:"goSignup"})}>
      <AuthField label="Organization name"><Input value={form.orgName} onChange={set("orgName")} placeholder="Lincoln School District" /></AuthField>
      <AuthField label="Org code (for coaches to join)"><Input value={form.orgCode} onChange={e=>setForm(f=>({...f,orgCode:e.target.value.toUpperCase()}))} placeholder="LSD" maxLength={10} style={{ letterSpacing:"0.2em",fontWeight:700 }} /></AuthField>
      <PrimaryBtn disabled={!form.orgName||!form.orgCode} onClick={()=>{ if(form.orgName&&form.orgCode&&form.name) D({t:"createOrg",userName:form.name,email:form.email,orgName:form.orgName,orgCode:form.orgCode}); }} style={{ width:"100%",marginTop:8 }}>Create organization</PrimaryBtn>
    </FormCard>
  );

  if (S.authPage === "joinOrg") {
    const matchedOrg = state_orgs_find(form.orgCode);
    const codeEntered = form.orgCode && form.orgCode.length >= 2;
    return (
      <FormCard title="Join your team" sub="Enter the invite code your admin shared with you." back={()=>D({t:"goSignup"})}>
        <AuthField label="Invite code"><Input value={form.orgCode} onChange={e=>setForm(f=>({...f,orgCode:e.target.value.toUpperCase(),levelId:null}))} placeholder="e.g. LSD" maxLength={10} style={{ textAlign:"center",fontSize:24,fontWeight:800,letterSpacing:"0.3em",fontFamily:FL }} /></AuthField>

        {codeEntered && !matchedOrg && (
          <div style={{ marginTop:12,padding:"12px 16px",background:T.redBg,borderRadius:10,fontSize:13,color:T.red,fontWeight:600,textAlign:"center" }}>No organization found with that code. Double-check with your admin.</div>
        )}

        {matchedOrg && (
          <div style={{ marginTop:12,padding:"14px 16px",background:T.greenBg,borderRadius:10,marginBottom:4 }}>
            <div style={{ fontSize:12,color:T.green,fontWeight:600,display:"flex",alignItems:"center",gap:6 }}>✓ Found: <strong>{matchedOrg.name}</strong></div>
          </div>
        )}

        {matchedOrg && matchedOrg.levels && matchedOrg.levels.length > 0 && (
          <div style={{ marginTop:16 }}>
            <Label>Which level do you coach?</Label>
            <div style={{ display:"flex",flexDirection:"column",gap:8,marginTop:8 }}>
              {matchedOrg.levels.map(lv=>(
                <button key={lv.id} onClick={()=>setForm(f=>({...f,levelId:lv.id}))} style={{ padding:"14px 18px",fontSize:14,fontWeight:600,borderRadius:12,cursor:"pointer",textAlign:"left",border:form.levelId===lv.id?"2px solid "+T.navy:"1.5px solid "+T.border,background:form.levelId===lv.id?T.navyBg:T.surface,color:form.levelId===lv.id?T.navy:T.textSec,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                  <span>{lv.name} <span style={{ fontSize:12,color:T.textTer,fontWeight:400 }}>· {lv.teams.length} team{lv.teams.length!==1?"s":""}</span></span>
                  {form.levelId===lv.id&&<span style={{ color:T.navy,fontWeight:800 }}>✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {matchedOrg && (!matchedOrg.levels || matchedOrg.levels.length===0) && (
          <div style={{ marginTop:16,padding:"14px 16px",background:T.yellowBg,borderRadius:10,fontSize:13,color:T.yellow,fontWeight:600,textAlign:"center" }}>This organization hasn't set up levels yet. You can still join — your admin will assign you to a level.</div>
        )}

        <PrimaryBtn disabled={!matchedOrg||!form.name} onClick={()=>{ if(form.orgCode&&form.name) D({t:"joinOrg",userName:form.name,email:form.email,orgCode:form.orgCode,levelId:form.levelId||null}); }} style={{ width:"100%",marginTop:20 }}>
          {matchedOrg&&matchedOrg.levels&&matchedOrg.levels.length>0&&!form.levelId?"Select a level to continue":"Join "+(matchedOrg?matchedOrg.name:"organization")}
        </PrimaryBtn>
      </FormCard>
    );
  }
  return null;
}

/* ─── TEAM HOME ─── */
function TeamHome({ S, D }) {
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [showAddLevel, setShowAddLevel] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newLevelName, setNewLevelName] = useState("");
  const [addTeamLevelId, setAddTeamLevelId] = useState(null);
  const [adminTab, setAdminTab] = useState("teams");
  const [codeCopied, setCodeCopied] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const org = S.orgs.find(o=>o.id===S.currentOrgId);
  if (!org) return null;
  const isAdmin = S.currentUser?.role === "admin";
  const myCoach = org.coaches.find(c=>c.id===S.currentUser?.id);
  const myLevelIds = myCoach?.levelIds || [];
  const allLevels = org.levels || [];
  const visibleLevels = isAdmin ? allLevels : allLevels.filter(lv=>myLevelIds.includes(lv.id));
  const favIds = myCoach?.favoriteTeams || [];
  const favTeams = allLevels.flatMap(lv=>lv.teams.map(t=>({...t,levelName:lv.name}))).filter(t=>favIds.includes(t.id));
  const TeamCard = ({team,levelName})=>(
    <div style={{ position:"relative" }}>
      <button onClick={()=>{D({t:"selectTeam",teamId:team.id});D({t:"goHub"});}} style={{ width:"100%",textAlign:"left",background:T.surface,border:"none",borderRadius:16,padding:22,cursor:"pointer",boxShadow:T.shadow,transition:"transform 0.15s,box-shadow 0.15s" }} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=T.shadowLg;}} onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=T.shadow;}}>
        <div style={{ width:40,height:40,borderRadius:10,background:T.navyBg,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14 }}><Ic n="users" size={20} color={T.navy} /></div>
        <div style={{ fontSize:17,fontWeight:700,color:T.text,marginBottom:4 }}>{team.name}</div>
        <div style={{ fontSize:12,color:T.textSec }}>{levelName?levelName+" · ":""}{team.roster.length} players</div>
        <div style={{ marginTop:16,display:"flex",alignItems:"center",gap:4,fontSize:12,fontWeight:600,color:T.navy }}>Open <Ic n="chevronRight" size={14} color={T.navy} sw={2} /></div>
      </button>
      <button onClick={e=>{e.stopPropagation();D({t:"toggleFavoriteTeam",teamId:team.id});}} title={favIds.includes(team.id)?"Remove from My Teams":"Add to My Teams"} style={{ position:"absolute",top:16,right:16,width:32,height:32,borderRadius:8,border:"none",background:favIds.includes(team.id)?T.accentBg:T.bgAlt,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",color:favIds.includes(team.id)?T.accent:T.textTer }}>{favIds.includes(team.id)?"★":"☆"}</button>
    </div>
  );
  return (
    <div style={{ minHeight:"100vh",background:T.bg,fontFamily:F }}>
      <div style={{ background:T.navy,padding:"20px 32px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.35)",textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.12em",marginBottom:2 }}>{org.name}</div>
          <div style={{ fontSize:26,fontWeight:800,color:"#FFF",letterSpacing:"-0.03em" }}>Teams</div>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          {isAdmin && <div style={{ padding:"6px 14px",background:"rgba(255,255,255,0.1)",borderRadius:8,fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.7)",letterSpacing:"0.15em" }}>{org.code}</div>}
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:13,color:"rgba(255,255,255,0.6)",fontWeight:500 }}>{S.currentUser?.name}</div>
            <div style={{ fontSize:10,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.08em" }}>{isAdmin?"Admin":"Coach"}</div>
          </div>
          <button onClick={()=>D({t:"logout"})} style={{ padding:"8px 16px",fontSize:12,fontWeight:600,background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.5)",border:"none",borderRadius:8,cursor:"pointer" }}>Log out</button>
        </div>
      </div>
      {isAdmin && <div style={{ display:"flex",gap:2,padding:"16px 32px 0",borderBottom:"1px solid "+T.border,background:T.surface }}>
        {[["teams","Teams"],["coaches","Coaches & Invites"]].map(([tab,label])=><button key={tab} onClick={()=>setAdminTab(tab)} style={{ padding:"10px 20px",fontSize:13,fontWeight:600,borderRadius:"8px 8px 0 0",border:"none",cursor:"pointer",background:adminTab===tab?T.bg:"transparent",color:adminTab===tab?T.navy:T.textTer,borderBottom:adminTab===tab?"2px solid "+T.navy:"2px solid transparent" }}>{label}</button>)}
      </div>}
      <div style={{ padding:"28px 32px" }}>
        {(adminTab==="teams"||!isAdmin) && <>
          {isAdmin && <div style={{ display:"flex",justifyContent:"flex-end",gap:8,marginBottom:20 }}>
            <button onClick={()=>setShowAddLevel(true)} style={{ display:"flex",alignItems:"center",gap:6,padding:"9px 18px",fontSize:13,fontWeight:600,background:T.surface,color:T.navy,border:"1.5px solid "+T.navyBorder,borderRadius:10,cursor:"pointer" }}><Ic n="plus" size={14} color={T.navy} sw={2.5} /> Add level</button>
          </div>}
          {visibleLevels.length===0 && <div style={{ textAlign:"center",padding:"48px 40px",background:T.surface,borderRadius:16,boxShadow:T.shadowSm }}>
            <div style={{ width:56,height:56,borderRadius:14,background:T.navyBg,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px" }}><Ic n="users" size={28} color={T.navy} /></div>
            <div style={{ fontSize:18,fontWeight:700,marginBottom:6,color:T.text }}>{isAdmin?"Let's set up your program":"No teams assigned yet"}</div>
            <div style={{ fontSize:14,color:T.textSec,marginBottom:isAdmin?20:0,maxWidth:380,margin:"0 auto",lineHeight:1.5 }}>{isAdmin?"Start by creating a level like \"High School\" or \"Middle School\", then add teams within it.":"Your admin hasn't assigned you to a level yet. Check back soon or reach out to them."}</div>
            {isAdmin&&<button onClick={()=>setShowAddLevel(true)} style={{ marginTop:20,padding:"12px 24px",fontSize:14,fontWeight:700,background:T.navy,color:"#FFF",border:"none",borderRadius:12,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8 }}><Ic n="plus" size={16} color="#FFF" sw={2.5} /> Create your first level</button>}
          </div>}
          {/* My Teams pinned section */}
          {favTeams.length>0 && <div style={{ marginBottom:28 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
              <span style={{ fontSize:16,color:T.accent }}>★</span>
              <div style={{ fontSize:18,fontWeight:800,color:T.text,letterSpacing:"-0.02em" }}>My Teams</div>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14 }}>
              {favTeams.map(team=><TeamCard key={team.id} team={team} levelName={team.levelName} />)}
            </div>
          </div>}
          {visibleLevels.map(level=><div key={level.id} style={{ marginBottom:28 }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
              <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                <div style={{ fontSize:18,fontWeight:800,color:T.navy,letterSpacing:"-0.02em" }}>{level.name}</div>
                <div style={{ padding:"3px 10px",borderRadius:99,background:T.navyBg,fontSize:11,fontWeight:700,color:T.navy }}>{level.teams.length} team{level.teams.length!==1?"s":""}</div>
              </div>
              <button onClick={()=>{setAddTeamLevelId(level.id);setShowAddTeam(true);}} style={{ display:"flex",alignItems:"center",gap:4,padding:"7px 14px",fontSize:12,fontWeight:600,background:T.navy,color:"#FFF",border:"none",borderRadius:8,cursor:"pointer" }}><Ic n="plus" size={12} color="#FFF" sw={2.5} /> Add team</button>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14 }}>
              {level.teams.map(team=><TeamCard key={team.id} team={team} />)}
            </div>
          </div>)}
        </>}
        {adminTab==="coaches"&&isAdmin&&<div style={{ maxWidth:720 }}>
          {/* Invite card — prominent, shareable */}
          <div style={{ background:T.navy,borderRadius:16,padding:"24px 28px",marginBottom:24,color:"#FFF" }}>
            <div style={{ fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.1em",marginBottom:6 }}>Invite your coaches</div>
            <div style={{ fontSize:15,color:"rgba(255,255,255,0.85)",marginBottom:16,lineHeight:1.5 }}>Share this code with your coaching staff. They'll create an account, enter the code, and pick their level.</div>
            <div style={{ display:"flex",alignItems:"center",gap:12,flexWrap:"wrap" }}>
              <div style={{ display:"flex",alignItems:"center",gap:14,background:"rgba(255,255,255,0.1)",borderRadius:12,padding:"14px 24px" }}>
                <span style={{ fontSize:32,fontWeight:800,letterSpacing:"0.2em",fontFamily:FL,color:"#FFF" }}>{org.code}</span>
              </div>
              <button onClick={()=>{navigator.clipboard&&navigator.clipboard.writeText(org.code);setCodeCopied(true);setTimeout(()=>setCodeCopied(false),2000);}} style={{ padding:"14px 22px",fontSize:13,fontWeight:700,background:codeCopied?T.green:"#FFF",color:codeCopied?"#FFF":T.navy,border:"none",borderRadius:12,cursor:"pointer",display:"flex",alignItems:"center",gap:8,transition:"all 0.15s" }}>
                {codeCopied?"✓ Copied!":"Copy code"}
              </button>
              <button onClick={()=>{const msg="Join our CourtIQ team! Create an account at courtiq.app and enter code: "+org.code;if(navigator.share){navigator.share({text:msg});}else if(navigator.clipboard){navigator.clipboard.writeText(msg);setInviteCopied(true);setTimeout(()=>setInviteCopied(false),2000);}}} style={{ padding:"14px 22px",fontSize:13,fontWeight:700,background:"rgba(255,255,255,0.15)",color:"#FFF",border:"none",borderRadius:12,cursor:"pointer" }}>
                {inviteCopied?"✓ Message copied":"Share invite"}
              </button>
            </div>
          </div>

          {/* Coaches list with level assignment */}
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
            <div style={{ fontSize:15,fontWeight:700,color:T.text }}>Coaching staff <span style={{ color:T.textTer,fontWeight:500 }}>({org.coaches.length})</span></div>
          </div>

          {/* Admin (you) */}
          <div style={{ padding:"14px 18px",background:T.surface,borderRadius:12,marginBottom:8,boxShadow:T.shadowSm }}>
            <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:allLevels.length>0?12:0 }}>
              <div style={{ width:38,height:38,borderRadius:10,background:T.accentBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,color:T.accent }}>{(S.currentUser?.name||"?")[0].toUpperCase()}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14,fontWeight:600 }}>{S.currentUser?.name} <span style={{ fontSize:11,color:T.textTer }}>(you)</span></div>
                <div style={{ fontSize:12,color:T.textTer }}>{S.currentUser?.email}</div>
              </div>
              <div style={{ padding:"4px 12px",borderRadius:99,background:T.accentBg,fontSize:11,fontWeight:700,color:T.accent,textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.08em" }}>Admin · All access</div>
            </div>
            {allLevels.length>0&&<div style={{ paddingLeft:50 }}>
              <div style={{ fontSize:10,fontWeight:700,color:T.textTer,textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.08em",marginBottom:6 }}>My level (for quick access)</div>
              <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                {allLevels.map(lv=>{const assigned=(myCoach?.levelIds||[]).includes(lv.id);return <button key={lv.id} onClick={()=>D({t:"assignCoachToLevel",coachId:S.currentUser.id,levelId:lv.id})} style={{ padding:"6px 14px",fontSize:12,fontWeight:600,borderRadius:8,cursor:"pointer",border:assigned?"none":"1px solid "+T.border,background:assigned?T.navy:"transparent",color:assigned?"#FFF":T.textSec }}>{assigned?"✓ ":""}{lv.name}</button>;})}
              </div>
            </div>}
          </div>

          {/* Other coaches */}
          {org.coaches.filter(c=>c.id!==S.currentUser?.id).map(coach=>{
            const coachLevels=(coach.levelIds||[]);
            return (
            <div key={coach.id} style={{ padding:"14px 18px",background:T.surface,borderRadius:12,marginBottom:8,boxShadow:T.shadowSm }}>
              <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:12 }}>
                <div style={{ width:38,height:38,borderRadius:10,background:T.navyBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,color:T.navy }}>{(coach.name||"?")[0].toUpperCase()}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14,fontWeight:600 }}>{coach.name}</div>
                  <div style={{ fontSize:12,color:T.textTer }}>{coach.email}</div>
                </div>
                {coachLevels.length===0&&<div style={{ padding:"4px 12px",borderRadius:99,background:T.yellowBg,fontSize:11,fontWeight:700,color:T.yellow }}>Needs level</div>}
              </div>
              <div style={{ paddingLeft:50 }}>
                <div style={{ fontSize:10,fontWeight:700,color:T.textTer,textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.08em",marginBottom:6 }}>Assign to levels</div>
                {allLevels.length===0?<div style={{ fontSize:12,color:T.textTer,fontStyle:"italic" }}>Create a level first (Teams tab) before assigning.</div>:
                <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                  {allLevels.map(lv=>{const assigned=coachLevels.includes(lv.id);return <button key={lv.id} onClick={()=>D({t:"assignCoachToLevel",coachId:coach.id,levelId:lv.id})} style={{ padding:"6px 14px",fontSize:12,fontWeight:600,borderRadius:8,cursor:"pointer",border:assigned?"none":"1px solid "+T.border,background:assigned?T.navy:"transparent",color:assigned?"#FFF":T.textSec }}>{assigned?"✓ ":""}{lv.name}</button>;})}
                </div>}
              </div>
            </div>
            );
          })}
          {org.coaches.filter(c=>c.id!==S.currentUser?.id).length===0 && <div style={{ fontSize:13,color:T.textTer,padding:"30px 20px",textAlign:"center",background:T.surface,borderRadius:12,boxShadow:T.shadowSm }}>No coaches have joined yet.<br/>Share the code above to invite them.</div>}
        </div>}
      </div>
      {showAddTeam && <Modal onClose={()=>{setShowAddTeam(false);setNewTeamName("");}}>
        <div style={{ fontSize:18,fontWeight:800,marginBottom:16 }}>Add Team</div>
        <AuthField label="Team name"><Input value={newTeamName} onChange={e=>setNewTeamName(e.target.value)} placeholder="Varsity, JV, Freshman…" /></AuthField>
        <div style={{ display:"flex",justifyContent:"flex-end",gap:10,marginTop:16 }}>
          <GhostBtn onClick={()=>{setShowAddTeam(false);setNewTeamName("");}}>Cancel</GhostBtn>
          <PrimaryBtn disabled={!newTeamName} onClick={()=>{D({t:"addTeam",name:newTeamName,levelId:addTeamLevelId});setShowAddTeam(false);setNewTeamName("");}}>Add</PrimaryBtn>
        </div>
      </Modal>}
      {showAddLevel && <Modal onClose={()=>{setShowAddLevel(false);setNewLevelName("");}}>
        <div style={{ fontSize:18,fontWeight:800,marginBottom:16 }}>Add Level</div>
        <AuthField label="Level name"><Input value={newLevelName} onChange={e=>setNewLevelName(e.target.value)} placeholder="Middle School, Elementary…" /></AuthField>
        <div style={{ display:"flex",justifyContent:"flex-end",gap:10,marginTop:16 }}>
          <GhostBtn onClick={()=>{setShowAddLevel(false);setNewLevelName("");}}>Cancel</GhostBtn>
          <PrimaryBtn disabled={!newLevelName} onClick={()=>{D({t:"addLevel",name:newLevelName});setShowAddLevel(false);setNewLevelName("");}}>Add</PrimaryBtn>
        </div>
      </Modal>}
    </div>
  );
}


/* ─── HOME (Team roster + tools) ─── */
function Home({ S, D }) {
  const org = S.orgs.find(o=>o.id===S.currentOrgId);
  const team = org ? org.levels?.flatMap(l=>l.teams).find(t=>t.id===S.currentTeamId) : null;
  const [editIdx, setEditIdx] = useState(null);
  const [showAddGame, setShowAddGame] = useState(false);
  const [gameForm, setGameForm] = useState({ opponent:"",date:"",homeAway:"Home" });

  const tools = [
    { icon:"barChart", title:"Stats Tracker", desc:"Live match stats & rotations", color:T.green, bg:T.greenBg, action:()=>D({t:"startFromRoster"}) },
    { icon:"clipboard", title:"Practice Planner", desc:"Build and run drill plans", color:T.navy, bg:T.navyBg, action:()=>D({t:"goPractice"}) },
    { icon:"book", title:"Scorebook", desc:"Glover's digital scorebook", color:T.accent, bg:T.accentBg, action:()=>D({t:"goScorebook"}) },
    { icon:"trendingUp", title:"Season Stats", desc:"Team & player season totals", color:T.gold, bg:T.goldBg, action:()=>D({t:"goSeasonStats"}) },
  ];

  const SH = ({ children, action, actionLabel }) => (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
      <div style={{ fontSize:11,fontWeight:800,color:T.textTer,textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.1em" }}>{children}</div>
      {action && <button onClick={action} style={{ fontSize:11,fontWeight:700,color:T.accent,background:"none",border:"none",cursor:"pointer",padding:0 }}>{actionLabel}</button>}
    </div>
  );

  return (
    <div style={{ display:"flex",flexDirection:"column",height:"100vh",background:T.bg,fontFamily:F }}>
      {/* Header */}
      <div style={{ background:T.navy,padding:"14px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0 }}>
        <div style={{ display:"flex",alignItems:"center",gap:14 }}>
          <button onClick={()=>D({t:"goTeamHome"})} style={{ display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.08)",border:"none",color:"rgba(255,255,255,0.55)",fontSize:12,fontWeight:600,padding:"7px 13px",borderRadius:8,cursor:"pointer" }}>
            <Ic n="arrowLeft" size={13} color="rgba(255,255,255,0.55)" sw={2} /> Teams
          </button>
          <div>
            <div style={{ fontSize:10,color:"rgba(255,255,255,0.28)",fontWeight:700,textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.12em" }}>{org?.name}{team?" · "+findLevelName(org,S.currentTeamId):""}</div>
            <div style={{ fontSize:22,fontWeight:800,color:"#FFF",letterSpacing:"-0.03em",lineHeight:1.1 }}>{team?.name||"Team"}</div>
          </div>
        </div>
        <div style={{ fontSize:11,color:"rgba(255,255,255,0.28)",fontWeight:500 }}>{S.roster.length} players</div>
      </div>

      {/* Split layout */}
      <div style={{ flex:1,display:"flex",overflow:"hidden" }}>

        {/* LEFT — Roster */}
        <div style={{ flex:"0 0 56%",overflow:"auto",padding:"22px 26px",borderRight:"1px solid "+T.border }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
            <div style={{ fontSize:11,fontWeight:800,color:T.textTer,textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.1em" }}>Roster · {S.roster.length}</div>
            <button onClick={()=>D({t:"addPlayer"})} style={{ display:"flex",alignItems:"center",gap:5,padding:"7px 14px",fontSize:12,fontWeight:700,background:T.navy,color:"#FFF",border:"none",borderRadius:8,cursor:"pointer" }}>
              <Ic n="plus" size={13} color="#FFF" sw={2.5}/> Player
            </button>
          </div>

          {/* Column headers */}
          <div style={{ display:"grid",gridTemplateColumns:"52px 1fr 48px 52px 36px",gap:0,padding:"0 4px 8px",borderBottom:"1.5px solid "+T.border,marginBottom:6 }}>
            {["#","Name","Pos","",""].map((h,i)=><div key={i} style={{ fontSize:9,fontWeight:800,color:T.textTer,textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.08em",textAlign:i===0?"center":i>=3?"center":"left" }}>{h}</div>)}
          </div>

          <div style={{ display:"flex",flexDirection:"column" }}>
            {S.roster.map((p,idx)=>{
              const isEditing = editIdx===idx;
              return (
                <div key={idx}>
                <div style={{ display:"grid",gridTemplateColumns:"52px 1fr 48px 52px 36px",gap:0,alignItems:"center",padding:"9px 4px",borderBottom:"1px solid "+T.borderLight,background:isEditing?T.navyBg:"transparent",borderRadius:isEditing?8:0,transition:"background 0.15s" }}>
                  {isEditing ? (<>
                    <input type="number" value={p.num} onChange={e=>D({t:"updatePlayer",i:idx,d:{num:parseInt(e.target.value)||0}})} style={{ width:42,padding:"5px",fontSize:13,borderRadius:7,border:"1.5px solid "+T.navyBorder,background:T.surface,textAlign:"center",fontWeight:800,outline:"none",color:T.navy }} autoFocus />
                    <input type="text" value={p.name} onChange={e=>D({t:"updatePlayer",i:idx,d:{name:e.target.value}})} placeholder="Player name" style={{ padding:"5px 8px",fontSize:13,borderRadius:7,border:"1.5px solid "+T.border,background:T.surface,outline:"none",width:"95%" }} />
                    <div style={{ fontSize:11,color:T.textSec,textAlign:"center",fontWeight:600 }}>{p.pos||"—"}</div>
                    <button onClick={()=>D({t:"setLib",i:idx})} style={{ padding:"5px 8px",fontSize:11,fontWeight:700,borderRadius:7,border:"none",cursor:"pointer",background:p.lib?T.libero:T.bgDeep,color:p.lib?"#FFF":T.textSec,margin:"0 auto" }}>LIB</button>
                    <button onClick={()=>setEditIdx(null)} style={{ fontSize:11,fontWeight:700,color:T.accent,background:"none",border:"none",cursor:"pointer",textAlign:"center" }}>✓</button>
                  </>) : (<>
                    <div onClick={()=>setEditIdx(idx)} style={{ fontSize:15,fontWeight:800,color:p.lib?T.libero:T.navy,cursor:"pointer",textAlign:"center" }}>#{p.num}</div>
                    <div onClick={()=>setEditIdx(idx)} style={{ fontSize:14,fontWeight:500,color:T.text,cursor:"pointer" }}>{p.name||<span style={{color:T.textTer,fontStyle:"italic",fontSize:12}}>unnamed</span>}</div>
                    <div style={{ fontSize:12,color:T.textSec,textAlign:"center" }}>{p.pos||<span style={{color:T.borderLight}}>—</span>}</div>
                    <div style={{ textAlign:"center" }}>{p.lib&&<Pill label="LIB" color={T.libero} bg={T.liberoBg} />}</div>
                    <button onClick={()=>setEditIdx(idx)} style={{ background:"none",border:"none",cursor:"pointer",color:T.textTer,textAlign:"center",padding:0 }}><Ic n="edit" size={14} color={T.textTer} /></button>
                  </>)}
                </div>
                {isEditing&&<div style={{ padding:"0 4px 12px",background:T.navyBg,borderRadius:"0 0 8px 8px",marginTop:-1 }}>
                  <div style={{ fontSize:9,fontWeight:700,color:T.textTer,textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.08em",marginBottom:6,paddingTop:4 }}>Position</div>
                  <div style={{ display:"flex",gap:5,flexWrap:"wrap",marginBottom:10 }}>
                    {["OH","MB","S","OPP","L","DS"].map(pos=><button key={pos} onClick={()=>{D({t:"updatePlayer",i:idx,d:{pos:p.pos===pos?"":pos}});if(pos==="L"&&!p.lib)D({t:"setLib",i:idx});}} style={{ padding:"6px 14px",fontSize:12,fontWeight:700,borderRadius:8,cursor:"pointer",border:p.pos===pos?"none":"1px solid "+T.border,background:p.pos===pos?T.navy:T.surface,color:p.pos===pos?"#FFF":T.textSec }}>{pos}</button>)}
                  </div>
                  <button onClick={()=>{if(confirm("Remove #"+p.num+" from roster?"))D({t:"removePlayer",i:idx});}} style={{ fontSize:11,fontWeight:600,color:T.red,background:"none",border:"none",cursor:"pointer",padding:0 }}>Remove player</button>
                </div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT — Tools + Schedule + History */}
        <div style={{ flex:1,overflow:"auto",padding:"22px 20px",display:"flex",flexDirection:"column",gap:28 }}>

          {/* Tools */}
          <div>
            <SH>Tools</SH>
            <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
              {tools.map(c=>(
                <button key={c.title} onClick={c.action}
                  style={{ display:"flex",alignItems:"center",gap:14,textAlign:"left",background:T.surface,border:"none",borderRadius:14,padding:"14px 16px",cursor:"pointer",boxShadow:T.shadowSm,transition:"all 0.15s" }}
                  onMouseEnter={e=>{e.currentTarget.style.boxShadow=T.shadow;e.currentTarget.style.transform="translateX(2px)";}}
                  onMouseLeave={e=>{e.currentTarget.style.boxShadow=T.shadowSm;e.currentTarget.style.transform="";}}>
                  <div style={{ width:42,height:42,borderRadius:11,background:c.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                    <Ic n={c.icon} size={20} color={c.color} />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:15,fontWeight:700,color:T.text,letterSpacing:"-0.01em" }}>{c.title}</div>
                    <div style={{ fontSize:12,color:T.textSec,marginTop:1 }}>{c.desc}</div>
                  </div>
                  <Ic n="chevronRight" size={16} color={T.textTer} />
                </button>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div>
            <SH action={()=>setShowAddGame(v=>!v)} actionLabel={showAddGame?"Cancel":"+ Add game"}>Schedule</SH>
            {showAddGame && (
              <div className="fadein" style={{ padding:"14px 16px",background:T.surface,borderRadius:12,marginBottom:10,boxShadow:T.shadowSm }}>
                <div style={{ display:"flex",gap:8,flexWrap:"wrap",alignItems:"flex-end" }}>
                  <div style={{ flex:"1 1 130px" }}><Label>Opponent</Label><Input value={gameForm.opponent} onChange={e=>setGameForm({...gameForm,opponent:e.target.value})} placeholder="Team name" style={{ padding:"9px 10px",fontSize:12 }} /></div>
                  <div><Label>Date</Label><Input type="date" value={gameForm.date} onChange={e=>setGameForm({...gameForm,date:e.target.value})} style={{ padding:"9px 10px",fontSize:12 }} /></div>
                  <div>
                    <Label>Location</Label>
                    <div style={{ display:"flex",gap:4 }}>
                      {["Home","Away"].map(ha=><button key={ha} onClick={()=>setGameForm({...gameForm,homeAway:ha})} style={{ padding:"9px 12px",fontSize:12,fontWeight:600,borderRadius:8,cursor:"pointer",background:gameForm.homeAway===ha?T.navy:T.bg,color:gameForm.homeAway===ha?"#FFF":T.textSec,border:"1.5px solid "+(gameForm.homeAway===ha?T.navy:T.border) }}>{ha}</button>)}
                    </div>
                  </div>
                  <PrimaryBtn disabled={!gameForm.opponent} onClick={()=>{if(gameForm.opponent){D({t:"addGame",opponent:gameForm.opponent,date:gameForm.date,homeAway:gameForm.homeAway});setGameForm({opponent:"",date:"",homeAway:"Home"});setShowAddGame(false);}}} style={{ padding:"9px 16px",fontSize:12 }}>Add</PrimaryBtn>
                </div>
              </div>
            )}
            {(S.schedule||[]).length===0 && !showAddGame && <div style={{ fontSize:12,color:T.textTer,padding:"8px 0" }}>No games scheduled yet.</div>}
            {(S.schedule||[]).map(g=>(
              <div key={g.id} style={{ background:T.surface,borderRadius:10,marginBottom:6,boxShadow:T.shadowSm,overflow:"hidden" }}>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                    <Pill label={g.homeAway} color={g.homeAway==="Home"?T.navy:T.textSec} bg={g.homeAway==="Home"?T.navyBg:T.bgAlt} />
                    <div>
                      <div style={{ fontSize:13,fontWeight:600 }}>vs {g.opponent}</div>
                      <div style={{ fontSize:11,color:T.textTer }}>{g.date||"TBD"}</div>
                    </div>
                  </div>
                  <button onClick={()=>D({t:"removeGame",id:g.id})} style={{ fontSize:11,color:T.red,background:"none",border:"none",cursor:"pointer" }}>Remove</button>
                </div>
                <div style={{ display:"flex",gap:0,borderTop:"1px solid "+T.borderLight }}>
                  <button onClick={()=>D({t:"startFromRoster",game:g})} style={{ flex:1,padding:"9px",fontSize:12,fontWeight:700,background:"transparent",color:T.navy,border:"none",borderRight:"1px solid "+T.borderLight,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5 }}><Ic n="barChart" size={13} color={T.navy}/> Take Stats</button>
                  <button onClick={()=>D({t:"goScorebook",game:g})} style={{ flex:1,padding:"9px",fontSize:12,fontWeight:700,background:"transparent",color:T.navy,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5 }}><Ic n="book" size={13} color={T.navy}/> Take Book</button>
                </div>
              </div>
            ))}
          </div>

          {/* Match History */}
          {S.matchHistory.length>0 && (
            <div>
              <SH>Recent Matches</SH>
              {S.matchHistory.slice().reverse().slice(0,4).map((m,i)=>{
                const idx=S.matchHistory.length-1-i;
                return (
                  <div key={i} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:T.surface,borderRadius:10,marginBottom:6,boxShadow:T.shadowSm }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                      <div style={{ width:32,height:32,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,background:m.won?T.greenBg:T.redBg,color:m.won?T.green:T.red }}>{m.won?"W":"L"}</div>
                      <div>
                        <div style={{ fontSize:13,fontWeight:600 }}>vs {m.awayTeam||"Opponent"}</div>
                        <div style={{ fontSize:11,color:T.textTer }}>{m.date} · {m.sets.map(s=>s[0]+"-"+s[1]).join(", ")}</div>
                      </div>
                    </div>
                    <div style={{ display:"flex",gap:4 }}>
                      <button onClick={()=>D({t:"viewMatchDetail",idx})} style={{ padding:"5px 10px",fontSize:10,fontWeight:600,borderRadius:6,border:"none",background:T.navyBg,color:T.navy,cursor:"pointer" }}>Stats</button>
                      {S.sbSavedBooks.find(b=>b.date===m.date)&&<button onClick={()=>{}} style={{ padding:"5px 10px",fontSize:10,fontWeight:600,borderRadius:6,border:"1px solid "+T.border,background:T.surface,color:T.textSec,cursor:"pointer" }}>Book</button>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Practices */}
          {S.practices.length>0 && (
            <div>
              <SH>Saved Practices</SH>
              {S.practices.slice().reverse().slice(0,3).map(p=>(
                <div key={p.id} onClick={()=>D({t:"viewPractice",id:p.id})} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:T.surface,borderRadius:10,marginBottom:6,boxShadow:T.shadowSm,cursor:"pointer" }}>
                  <div>
                    <div style={{ fontSize:13,fontWeight:600 }}>{p.title}</div>
                    <div style={{ fontSize:11,color:T.textTer }}>{p.date} · {p.totalTime} min</div>
                  </div>
                  <Ic n="chevronRight" size={14} color={T.textTer} />
                </div>
              ))}
            </div>
          )}

          {S.sbSavedBooks.length>0 && (
            <div>
              <SH>Scorebooks</SH>
              {S.sbSavedBooks.slice().reverse().slice(0,3).map(b=>(
                <div key={b.id} style={{ padding:"10px 14px",background:T.surface,borderRadius:10,marginBottom:6,boxShadow:T.shadowSm }}>
                  <div style={{ fontSize:13,fontWeight:600 }}>{b.home} vs {b.away}</div>
                  <div style={{ fontSize:11,color:T.textTer }}>{b.date}</div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ─── MATCH ─── */
function Match({ S, D }) {
  const rotated = getRotated(S.lineup, S.rot);
  const findP = n => S.roster.find(p=>p.num===n);
  const libP = S.roster.find(p=>p.lib);
  const courtP = rotated.filter(n=>n!=null).map(findP).filter(Boolean);
  const allP = libP ? [...courtP, libP] : courtP;
  const [homeTeam, setHomeTeam] = useState(S.homeTeamName||"US");
  const [awayTeam, setAwayTeam] = useState(S.awayTeamName||"THEM");
  const [showStats, setShowStats] = useState(false);
  const [showCustomStat, setShowCustomStat] = useState(false);
  const [csName, setCsName] = useState("");
  const [csShort, setCsShort] = useState("");
  const [csCat, setCsCat] = useState("");

  /* Theme - warm beige to match rest of app */
  const dk = { bg:T.bg, surface:T.surface, card:T.surfaceAlt||T.bgAlt, border:T.border, text:T.text, sec:T.textSec };

  /* stats table view */
  if (showStats) return (
    <div style={{ display:"flex",flexDirection:"column",height:"100vh",background:T.bg,fontFamily:F,overflow:"hidden" }}>
      <div style={{ background:T.navy,borderBottom:"1px solid "+T.border,padding:"10px 20px",display:"flex",alignItems:"center",gap:12,flexShrink:0 }}>
        <button onClick={()=>setShowStats(false)} style={{ display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.1)",border:"none",color:"rgba(255,255,255,0.7)",fontSize:12,fontWeight:600,padding:"7px 14px",borderRadius:8,cursor:"pointer" }}><Ic n="arrowLeft" size={13} color="rgba(255,255,255,0.7)" sw={2}/> Back</button>
        <span style={{ fontSize:16,fontWeight:700,color:"#FFF" }}>Stats</span>
        <div style={{ marginLeft:"auto",fontSize:16,fontWeight:800,color:"#FFF" }}>{homeTeam} <span style={{ color:"rgba(255,255,255,0.4)",fontSize:13 }}>vs</span> {awayTeam}</div>
      </div>
      <div style={{ flex:1,overflow:"auto",padding:"16px 20px" }}>
        <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12,background:T.surface,borderRadius:12,overflow:"hidden",boxShadow:T.shadowSm }}>
          <thead>
            <tr>
              {[["",2],["Serves",4],["Attacks",4],["Service Receptions",2],["Blocks",3],["Ball Handling",3],["Digs",2]].map(([g,span],gi)=>(
                <th key={gi} colSpan={span} style={{ padding:"7px 4px",fontSize:9,fontWeight:700,color:g?T.navy:"transparent",textAlign:"center",textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.08em",background:g&&gi%2?T.bgAlt:"transparent",borderBottom:"1px solid "+T.border,borderLeft:gi>0?"1px solid "+T.border:"none" }}>{g}</th>
              ))}
            </tr>
            <tr style={{ borderBottom:"2px solid "+T.navy }}>
              {[["#","Number",0],["Player","Player",0],["GP","Games Played",1],["SA","Serve Attempts",1],["A","Aces",1],["SE","Serve Errors",1],["ATT","Attempts",2],["K","Kills",2],["E","Errors",2],["PCT","Hitting %",2],["R","Receptions",3],["RE","Recept Errors",3],["BS","Block Solos",4],["BA","Block Assists",4],["BE","Block Errors",4],["BHA","BH Attempts",5],["AST","Assists",5],["BHE","BH Errors",5],["D","Digs",6],["DE","Dig Errors",6]].map(([h,full,grp],i)=>(
                <th key={h+i} title={full} style={{ padding:"8px 5px",fontSize:10,fontWeight:700,color:T.textSec,textAlign:h==="Player"?"left":"center",textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.05em",background:grp%2?T.bgAlt:"transparent",borderLeft:(h==="GP"||h==="ATT"||h==="R"||h==="BS"||h==="BHA"||h==="D")?"1px solid "+T.border:"none" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allP.map(p=>{
              const s=calc(S.stats,p.num);
              const num=(v,hi)=><td style={{ padding:"9px 5px",textAlign:"center",color:v>0?(hi||T.text):T.borderLight,fontWeight:v>0?600:400 }}>{v||"—"}</td>;
              return (
                <tr key={p.num} style={{ borderBottom:"1px solid "+T.borderLight }}>
                  <td style={{ padding:"9px 5px",fontWeight:800,color:p.lib?T.libero:T.navy,textAlign:"center",fontSize:14 }}>{p.num}</td>
                  <td style={{ padding:"9px 5px",fontWeight:500,color:T.text,whiteSpace:"nowrap" }}>{p.name}{p.lib&&<span style={{ color:T.libero,fontSize:9,marginLeft:4,fontWeight:700 }}>L</span>}</td>
                  <td style={{ padding:"9px 5px",textAlign:"center",color:T.textTer,borderLeft:"1px solid "+T.border,background:T.bgAlt }}>{S.sets.length+1}</td>
                  <td style={{ padding:"9px 5px",textAlign:"center",color:s.sa>0?T.text:T.borderLight,background:T.bgAlt }}>{s.sa||"—"}</td>
                  <td style={{ padding:"9px 5px",textAlign:"center",color:s.a>0?T.green:T.borderLight,fontWeight:s.a>0?700:400,background:T.bgAlt }}>{s.a||"—"}</td>
                  <td style={{ padding:"9px 5px",textAlign:"center",color:s.se>0?T.red:T.borderLight,background:T.bgAlt }}>{s.se||"—"}</td>
                  <td style={{ padding:"9px 5px",textAlign:"center",color:s.att>0?T.text:T.borderLight,borderLeft:"1px solid "+T.border }}>{s.att||"—"}</td>
                  {num(s.k,T.green)}
                  {num(s.e,T.red)}
                  <td style={{ padding:"9px 5px",textAlign:"center",fontWeight:700,color:s.hp>0.2?T.green:s.hp<0?T.red:T.textSec }}>{s.att>0?(s.hp>=0?"":"-")+"."+Math.abs(s.hp*1000).toFixed(0).padStart(3,"0"):"—"}</td>
                  <td style={{ padding:"9px 5px",textAlign:"center",color:s.r>0?T.text:T.borderLight,borderLeft:"1px solid "+T.border,background:T.bgAlt }}>{s.r||"—"}</td>
                  <td style={{ padding:"9px 5px",textAlign:"center",color:s.re>0?T.red:T.borderLight,background:T.bgAlt }}>{s.re||"—"}</td>
                  <td style={{ padding:"9px 5px",textAlign:"center",color:s.bs>0?T.green:T.borderLight,fontWeight:s.bs>0?600:400,borderLeft:"1px solid "+T.border }}>{s.bs||"—"}</td>
                  {num(s.ba,T.gold)}
                  {num(s.be,T.red)}
                  <td style={{ padding:"9px 5px",textAlign:"center",color:s.bha>0?T.text:T.borderLight,borderLeft:"1px solid "+T.border,background:T.bgAlt }}>{s.bha||"—"}</td>
                  <td style={{ padding:"9px 5px",textAlign:"center",color:s.ast>0?T.green:T.borderLight,fontWeight:s.ast>0?700:400,background:T.bgAlt }}>{s.ast||"—"}</td>
                  <td style={{ padding:"9px 5px",textAlign:"center",color:s.bhe>0?T.red:T.borderLight,background:T.bgAlt }}>{s.bhe||"—"}</td>
                  <td style={{ padding:"9px 5px",textAlign:"center",color:s.d>0?T.green:T.borderLight,fontWeight:s.d>0?600:400,borderLeft:"1px solid "+T.border }}>{s.d||"—"}</td>
                  {num(s.de,T.red)}
                </tr>
              );
            })}
            {(()=>{
              const t={sa:0,a:0,se:0,att:0,k:0,e:0,r:0,re:0,bs:0,ba:0,be:0,bha:0,ast:0,bhe:0,d:0,de:0};
              allP.forEach(p=>{const s=calc(S.stats,p.num);Object.keys(t).forEach(key=>t[key]+=s[key]||0);});
              const hp=t.att>0?(t.k-t.e)/t.att:0;
              const cell=(v,c)=><td style={{ padding:"10px 5px",textAlign:"center",fontWeight:700,color:v>0?(c||T.navy):T.textTer }}>{v||"—"}</td>;
              return (
              <tr style={{ borderTop:"2px solid "+T.navy,background:T.navyBg }}>
                <td colSpan={2} style={{ padding:"10px 5px",fontWeight:800,color:T.navy,textAlign:"right",paddingRight:12,textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.08em",fontSize:11 }}>Team Totals</td>
                <td style={{ padding:"10px 5px",textAlign:"center",color:T.textTer }}>—</td>
                {cell(t.sa)}{cell(t.a,T.green)}{cell(t.se,T.red)}
                {cell(t.att)}{cell(t.k,T.green)}{cell(t.e,T.red)}
                <td style={{ padding:"10px 5px",textAlign:"center",fontWeight:800,color:hp>0.2?T.green:hp<0?T.red:T.navy }}>{t.att>0?(hp>=0?"":"-")+"."+Math.abs(hp*1000).toFixed(0).padStart(3,"0"):"—"}</td>
                {cell(t.r)}{cell(t.re,T.red)}
                {cell(t.bs,T.green)}{cell(t.ba,T.gold)}{cell(t.be,T.red)}
                {cell(t.bha)}{cell(t.ast,T.green)}{cell(t.bhe,T.red)}
                {cell(t.d,T.green)}{cell(t.de,T.red)}
              </tr>);})()}
          </tbody>
        </table>
        <div style={{ marginTop:14,padding:"12px 16px",background:T.surface,borderRadius:10,boxShadow:T.shadowSm }}>
          <div style={{ fontSize:9,fontWeight:700,color:T.textTer,textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.08em",marginBottom:8 }}>Legend</div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:"4px 16px",fontSize:11,color:T.textSec }}>
            {[["GP","Games Played"],["SA","Serve Attempts"],["A","Aces"],["SE","Serve Errors"],["ATT","Attack Attempts"],["K","Kills"],["E","Attack Errors"],["PCT","Hitting Percentage"],["R","Service Receptions"],["RE","Reception Errors"],["BS","Block Solos"],["BA","Block Assists"],["BE","Block Errors"],["BHA","Ball Handling Attempts"],["AST","Assists"],["BHE","Ball Handling Errors"],["D","Digs"],["DE","Digging Errors"]].map(([a,b])=>(
              <div key={a}><strong style={{ color:T.navy,fontFamily:FL }}>{a}</strong> — {b}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const selP = S.selPlayer ? findP(S.selPlayer) : null;

  return (
    <div style={{ display:"flex",flexDirection:"column",height:"100vh",background:T.bg,fontFamily:F,overflow:"hidden" }}>

      {/* Top action bar */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 18px",background:T.navy,flexShrink:0 }}>
        <div style={{ display:"flex",gap:6 }}>
          <button onClick={()=>D({t:"goHome"})} style={{ padding:"8px 14px",fontSize:12,fontWeight:600,background:"rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.7)",border:"none",borderRadius:8,cursor:"pointer" }}>← Back</button>
          <button onClick={()=>D({t:"undo"})} style={{ padding:"8px 14px",fontSize:12,fontWeight:700,background:T.accentBg,color:T.accent,border:"1px solid "+T.accentBorder,borderRadius:8,cursor:"pointer" }}>↩ Undo</button>
          <button onClick={()=>setShowStats(true)} style={{ padding:"8px 14px",fontSize:12,fontWeight:600,background:"rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.7)",border:"none",borderRadius:8,cursor:"pointer" }}>Stats</button>
        </div>
        <div style={{ fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.5)",letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:FL }}>Set {S.set}{S.sets.length>0&&<span style={{ marginLeft:10,opacity:0.6 }}>{S.sets.map(s=>s[0]+"-"+s[1]).join("  ")}</span>}</div>
        <div style={{ display:"flex",gap:6 }}>
          <button onClick={()=>D({t:"endSet"})} style={{ padding:"8px 14px",fontSize:12,fontWeight:600,background:"rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.7)",border:"none",borderRadius:8,cursor:"pointer" }}>End Set</button>
          <button onClick={()=>D({t:"confirmEnd"})} style={{ padding:"8px 14px",fontSize:12,fontWeight:600,background:"rgba(192,57,43,0.25)",color:"#FCA5A5",border:"none",borderRadius:8,cursor:"pointer" }}>End Match</button>
        </div>
      </div>

      {/* Scoreboard */}
      <div style={{ display:"flex",alignItems:"stretch",justifyContent:"center",gap:16,padding:"16px 24px",flexShrink:0 }}>
        {/* Home score */}
        <div style={{ flex:1,maxWidth:220,background:T.greenBg,border:"2px solid "+T.green,borderRadius:16,padding:"18px 20px",textAlign:"center" }}>
          <input value={homeTeam} onChange={e=>setHomeTeam(e.target.value)} style={{ fontSize:12,color:T.green,fontWeight:700,background:"transparent",border:"none",borderBottom:"1px dashed "+T.green,outline:"none",textAlign:"center",width:"100%",letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:FL,marginBottom:4 }} />
          <div style={{ fontSize:64,fontWeight:800,color:T.green,lineHeight:1,letterSpacing:"-0.04em" }}>{S.score[0]}</div>
          <div style={{ display:"flex",justifyContent:"center",gap:0,marginTop:10,borderRadius:10,overflow:"hidden",border:"2px solid "+T.green }}>
            <button onClick={()=>{if(S.score[0]>0)D({t:"setPracticeField",field:"score",value:[S.score[0]-1,S.score[1]]});}} style={{ flex:1,padding:"8px",fontSize:14,fontWeight:800,cursor:S.score[0]>0?"pointer":"default",background:"transparent",color:S.score[0]>0?T.green:T.border,border:"none",borderRight:"1px solid "+T.green }}>−1</button>
            <button onClick={()=>D({t:"ptUs"})} style={{ flex:1,padding:"8px",fontSize:14,fontWeight:800,cursor:"pointer",background:T.greenBg,color:T.green,border:"none" }}>+1</button>
          </div>
        </div>

        {/* Center info */}
        <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,minWidth:80 }}>
          <div style={{ width:10,height:10,borderRadius:99,background:S.serving?T.green:T.red,boxShadow:"0 0 8px "+(S.serving?T.green:T.red)+"66" }} />
          <div style={{ fontSize:10,fontWeight:800,color:T.textTer,letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:FL,textAlign:"center",lineHeight:1.4 }}>{S.serving?"Serving":"Receiving"}</div>
        </div>

        {/* Away score */}
        <div style={{ flex:1,maxWidth:220,background:T.redBg,border:"2px solid "+T.red,borderRadius:16,padding:"18px 20px",textAlign:"center" }}>
          <input value={awayTeam} onChange={e=>setAwayTeam(e.target.value)} style={{ fontSize:12,color:T.red,fontWeight:700,background:"transparent",border:"none",borderBottom:"1px dashed "+T.red,outline:"none",textAlign:"center",width:"100%",letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:FL,marginBottom:4 }} />
          <div style={{ fontSize:64,fontWeight:800,color:T.red,lineHeight:1,letterSpacing:"-0.04em" }}>{S.score[1]}</div>
          <div style={{ display:"flex",justifyContent:"center",gap:0,marginTop:10,borderRadius:10,overflow:"hidden",border:"2px solid "+T.red }}>
            <button onClick={()=>{if(S.score[1]>0)D({t:"setPracticeField",field:"score",value:[S.score[0],S.score[1]-1]});}} style={{ flex:1,padding:"8px",fontSize:14,fontWeight:800,cursor:S.score[1]>0?"pointer":"default",background:"transparent",color:S.score[1]>0?T.red:T.border,border:"none",borderRight:"1px solid "+T.red }}>−1</button>
            <button onClick={()=>D({t:"ptThem"})} style={{ flex:1,padding:"8px",fontSize:14,fontWeight:800,cursor:"pointer",background:T.redBg,color:T.red,border:"none" }}>+1</button>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height:1,background:T.border,flexShrink:0,margin:"0 18px" }} />

      {/* Player grid */}
      <div style={{ flex:1,overflow:"auto",padding:"14px 18px" }}>
        <div style={{ fontSize:10,fontWeight:800,color:T.textSec,textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.12em",marginBottom:12 }}>Tap a player to record stats</div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:10 }}>
          {courtP.map((player, idx)=>{
            if (!player) return null;
            const isSel = S.selPlayer===player.num;
            const pStats = S.stats[player.num]||{};
            const kills = pStats.kill||0;
            const digs = pStats.dig||0;
            const aces = pStats.ace||0;
            const blks = (pStats.blockSolo||0)+(pStats.blockAssist||0);
            const asts = pStats.assist||0;
            const isServer = idx===5 && S.serving;
            return (
              <button key={player.num} onClick={()=>D({t:"selPlayer",v:player.num})}
                style={{ position:"relative",padding:"16px 12px 14px",borderRadius:16,border:"2px solid "+(isSel?T.navy:T.border),background:isSel?T.navyBg:T.surface,cursor:"pointer",textAlign:"center",transition:"all 0.15s",boxShadow:isSel?T.shadow:"none" }}>
                {isServer && <div style={{ position:"absolute",top:8,right:10,fontSize:8,fontWeight:800,color:T.green,letterSpacing:"0.1em",fontFamily:FL }}>SERVE</div>}
                <div style={{ fontSize:44,fontWeight:800,color:isSel?T.navy:T.text,lineHeight:1,letterSpacing:"-0.03em" }}>{player.num}</div>
                <div style={{ fontSize:11,color:isSel?T.navy:T.textSec,fontWeight:500,marginTop:4,maxWidth:"100%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{player.name}</div>
                {(kills>0||digs>0||aces>0||blks>0||asts>0) && (
                  <div style={{ display:"flex",justifyContent:"center",gap:4,marginTop:8,flexWrap:"wrap" }}>
                    {kills>0&&<span style={{ fontSize:10,fontWeight:700,color:T.green,background:T.greenBg,padding:"2px 6px",borderRadius:99 }}>K{kills}</span>}
                    {aces>0&&<span style={{ fontSize:10,fontWeight:700,color:T.accent,background:T.accentBg,padding:"2px 6px",borderRadius:99 }}>A{aces}</span>}
                    {asts>0&&<span style={{ fontSize:10,fontWeight:700,color:T.navy,background:T.navyBg,padding:"2px 6px",borderRadius:99 }}>AST{asts}</span>}
                    {blks>0&&<span style={{ fontSize:10,fontWeight:700,color:T.gold,background:T.goldBg,padding:"2px 6px",borderRadius:99 }}>B{blks}</span>}
                    {digs>0&&<span style={{ fontSize:10,fontWeight:700,color:T.textSec,background:T.bgAlt,padding:"2px 6px",borderRadius:99 }}>D{digs}</span>}
                  </div>
                )}
              </button>
            );
          })}
          {/* Libero card */}
          {libP && (()=>{
            const isSel = S.selPlayer===libP.num;
            const pStats = S.stats[libP.num]||{};
            const digs = pStats.dig||0;
            return (
              <button onClick={()=>D({t:"selPlayer",v:libP.num})}
                style={{ position:"relative",padding:"16px 12px 14px",borderRadius:16,border:"2px solid "+(isSel?T.libero:T.border),background:isSel?"rgba(72,120,200,0.15)":T.surface,cursor:"pointer",textAlign:"center",transition:"all 0.15s",boxShadow:isSel?"0 0 24px rgba(72,120,200,0.2)":"none" }}>
                <div style={{ position:"absolute",top:8,left:10,fontSize:8,fontWeight:800,color:T.libero,letterSpacing:"0.1em" }}>LIB</div>
                <div style={{ fontSize:44,fontWeight:800,color:isSel?T.libero:T.text,lineHeight:1,letterSpacing:"-0.03em" }}>{libP.num}</div>
                <div style={{ fontSize:11,color:T.textSec,fontWeight:500,marginTop:4 }}>{libP.name}</div>
                {digs>0&&<div style={{ marginTop:8 }}><span style={{ fontSize:10,fontWeight:700,color:T.navy,background:T.navyBg,padding:"2px 7px",borderRadius:99 }}>D{digs}</span></div>}
              </button>
            );
          })()}
        </div>

        {/* Recent log */}
        {S.log.length>0 && (
          <div style={{ marginTop:16,display:"flex",gap:5,flexWrap:"wrap" }}>
            {S.log.slice(-12).reverse().map((h,i)=>{
              const st=STATS[h.k]||S.customStats[h.k]||{color:"#888",short:h.k};
              return <span key={i} style={{ fontSize:11,padding:"3px 9px",borderRadius:99,fontWeight:600,background:st.color+"20",color:st.color,border:"1px solid "+st.color+"30" }}>#{h.num} {st.short}</span>;
            })}
          </div>
        )}
      </div>

      {/* Bottom stats panel */}
      {selP && (
        <div style={{ background:T.surface,borderTop:"1px solid "+T.border,padding:"14px 18px 18px",flexShrink:0 }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              <span style={{ fontSize:22,fontWeight:800,color:T.accent }}>#{selP.num}</span>
              <span style={{ fontSize:14,fontWeight:600,color:T.text }}>{selP.name}</span>
              {selP.lib&&<span style={{ fontSize:10,fontWeight:700,color:T.libero,background:"rgba(72,120,200,0.15)",padding:"2px 8px",borderRadius:99 }}>LIBERO</span>}
            </div>
            <button onClick={()=>D({t:"selPlayer",v:selP.num})} style={{ background:"rgba(255,255,255,0.06)",border:"1px solid "+T.border,color:T.textSec,fontSize:12,fontWeight:600,padding:"5px 12px",borderRadius:7,cursor:"pointer" }}>Deselect</button>
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
            {[...SECTIONS,...S.customSections].map(sec=>(
              <div key={sec.label}>
                <div style={{ fontSize:9,fontWeight:800,color:T.textSec,textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.1em",marginBottom:8 }}>{sec.label}</div>
                <div style={{ display:"flex",gap:8 }}>
                  {sec.keys.map(k=>{
                    const st=STATS[k]||S.customStats[k]||{label:k,color:"#888"};
                    const cnt=(S.stats[selP.num]||{})[k]||0;
                    return (
                      <button key={k} onClick={()=>D({t:"stat",num:selP.num,k})}
                        style={{ flex:"1 1 0",minWidth:56,padding:"12px 6px",borderRadius:12,cursor:"pointer",border:"1px solid "+(cnt>0?st.color+"40":T.border),background:cnt>0?st.color+"18":T.surface,textAlign:"center",transition:"all 0.1s" }}>
                        <div style={{ fontSize:24,fontWeight:800,color:cnt>0?st.color:T.textSec,lineHeight:1 }}>{cnt}</div>
                        <div style={{ fontSize:10,fontWeight:600,color:T.textSec,marginTop:4,lineHeight:1.2 }}>{st.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <button onClick={()=>setShowCustomStat(true)} style={{ width:"100%",padding:"8px",fontSize:10,fontWeight:700,borderRadius:8,border:"1px dashed "+T.border,background:"transparent",color:T.textSec,cursor:"pointer",marginTop:8 }}>+ Custom stat</button>
          </div>
        </div>
      )}

      {showCustomStat && (
        <Modal onClose={()=>setShowCustomStat(false)}>
          <div style={{ fontSize:18,fontWeight:800,marginBottom:16 }}>New Custom Stat</div>
          <div style={{ marginBottom:12 }}><Label>Stat Name *</Label><Input value={csName} onChange={e=>setCsName(e.target.value)} placeholder="e.g. Tip, Shank, Free Ball" /></div>
          <div style={{ marginBottom:12 }}><Label>Abbreviation (2-3 letters)</Label><Input value={csShort} onChange={e=>setCsShort(e.target.value.toUpperCase())} placeholder="e.g. TIP" maxLength={4} style={{ textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.15em",fontWeight:700 }} /></div>
          <div style={{ marginBottom:16 }}><Label>Category</Label>
            <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:8 }}>
              {[...SECTIONS.map(s=>s.label),...S.customSections.map(s=>s.label)].map(c=>(
                <button key={c} onClick={()=>setCsCat(c)} style={{ padding:"6px 14px",fontSize:12,fontWeight:csCat===c?700:500,borderRadius:8,cursor:"pointer",background:csCat===c?T.navy:T.bg,color:csCat===c?"#FFF":T.textSec,border:"none" }}>{c}</button>
              ))}
              <button onClick={()=>{const n=prompt("New category name:");if(n)setCsCat(n);}} style={{ padding:"6px 14px",fontSize:12,fontWeight:500,borderRadius:8,cursor:"pointer",background:T.bg,color:T.accent,border:"1px dashed "+T.accentBorder }}>+ New</button>
            </div>
            {csCat && !SECTIONS.find(s=>s.label===csCat) && !S.customSections.find(s=>s.label===csCat) && <div style={{ fontSize:11,color:T.accent,fontWeight:600 }}>New category: "{csCat}"</div>}
          </div>
          <div style={{ display:"flex",justifyContent:"flex-end",gap:10 }}>
            <GhostBtn onClick={()=>{setShowCustomStat(false);setCsName("");setCsShort("");setCsCat("");}}>Cancel</GhostBtn>
            <PrimaryBtn disabled={!csName} onClick={()=>{D({t:"addCustomStat",label:csName,short:csShort||csName.slice(0,3).toUpperCase(),category:csCat||"Custom"});setShowCustomStat(false);setCsName("");setCsShort("");setCsCat("");}}>Add Stat</PrimaryBtn>
          </div>
        </Modal>
      )}

      {S.confirmEnd && (
        <Modal onClose={()=>D({t:"cancelEnd"})}>
          <div style={{ textAlign:"center" }}>
            <div style={{ width:52,height:52,borderRadius:13,background:T.redBg,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px" }}>
              <Ic n="x" size={24} color={T.red} />
            </div>
            <div style={{ fontSize:20,fontWeight:800,marginBottom:6,letterSpacing:"-0.02em" }}>End match?</div>
            <div style={{ fontSize:14,color:T.textSec,marginBottom:28 }}>Current set ({S.score[0]}-{S.score[1]}) will be recorded.</div>
            <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
              <GhostBtn onClick={()=>D({t:"cancelEnd"})}>Cancel</GhostBtn>
              <PrimaryBtn onClick={()=>D({t:"endMatch",homeTeam,awayTeam})} style={{ background:T.red }}>End match</PrimaryBtn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ─── PRACTICE ─── */
function Practice({ S, D }) {
  const [practiceTab, setPracticeTab] = useState(S.practiceMode==="edit"?"edit":"plans");
  const [addingToBlock, setAddingToBlock] = useState(null);
  const usedTime = S.practiceItems.reduce((s,it)=>s+(it.dur||0),0);
  const remaining = S.practiceDuration - usedTime;
  const filtered = S.drillFilter==="All" ? S.drillLibrary : S.drillLibrary.filter(d=>d.cat===S.drillFilter);

  if (S.practiceMode==="view") return (
    <div style={{ display:"flex",flexDirection:"column",height:"100vh",background:T.bg,fontFamily:F }}>
      <div style={{ background:T.navy,padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0 }}>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          <button onClick={()=>D({t:"goHome"})} style={{ display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.08)",border:"none",color:"rgba(255,255,255,0.6)",fontSize:12,fontWeight:600,padding:"7px 14px",borderRadius:8,cursor:"pointer" }}><Ic n="arrowLeft" size={14} color="rgba(255,255,255,0.6)" sw={2} /> Back</button>
          <div>
            <div style={{ fontSize:10,color:"rgba(255,255,255,0.3)",fontWeight:700,textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.1em" }}>{S.practiceDate}</div>
            <div style={{ fontSize:20,fontWeight:800,color:"#FFF" }}>{S.practiceTitle||"Practice Plan"}</div>
          </div>
        </div>
        <button onClick={()=>D({t:"setPracticeField",field:"practiceMode",value:"edit"})} style={{ padding:"8px 18px",fontSize:12,fontWeight:600,background:"rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.7)",border:"none",borderRadius:8,cursor:"pointer" }}>Edit plan</button>
      </div>
      <div style={{ flex:1,display:"flex",overflow:"hidden" }}>
        <div style={{ flex:1,overflow:"auto",padding:"20px 28px" }}>
          <div style={{ fontSize:13,color:T.textSec,marginBottom:16 }}>{S.practiceDuration} min total · {usedTime} min planned</div>
          {(S.practiceItems||[]).map((item,i)=>{
            const elapsed=(S.practiceItems||[]).slice(0,i).reduce((s,x)=>s+(x?.dur||0),0);
            return (
              <div key={i} style={{ display:"flex",gap:12,marginBottom:8 }}>
                <div style={{ width:36,textAlign:"right",paddingTop:10,flexShrink:0,fontSize:13,fontWeight:700,color:T.textTer }}>{elapsed}′</div>
                {item.type==="header" ? (
                  <div style={{ flex:1,paddingTop:8,paddingBottom:6,borderBottom:"2px solid "+T.navy,fontSize:14,fontWeight:800,color:T.navy,textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.06em" }}>{item.name}</div>
                ) : item.type==="parallel" ? (
                  <div style={{ flex:1,border:"1px solid "+T.navyBorder,borderRadius:12,overflow:"hidden" }}>
                    <div style={{ padding:"6px 12px",background:T.navyBg,fontSize:11,fontWeight:700,color:T.navy }}>Split — {item.dur} min</div>
                    <div style={{ display:"flex" }}>{item.blocks.map((grp,gi)=>(
                      <div key={gi} style={{ flex:1,padding:"8px 10px",borderRight:gi<item.blocks.length-1?"1px solid "+T.navyBorder:"none" }}>
                        <div style={{ fontSize:11,fontWeight:700,color:T.navy,marginBottom:4 }}>{grp.name}</div>
                        {grp.drills.map((d,j)=><div key={j} style={{ fontSize:12,padding:"2px 0" }}>· {d.name}</div>)}
                      </div>
                    ))}</div>
                  </div>
                ) : item.type==="block" ? (
                  <div style={{ flex:1,padding:"12px 16px",background:T.navyBg,borderRadius:12,border:"1px solid "+T.navyBorder }}>
                    <div style={{ fontSize:14,fontWeight:700,color:T.navy }}>{item.name} — {item.dur} min</div>
                    {item.drills.map((d,j)=><div key={j} style={{ fontSize:12,color:T.textSec,marginTop:4 }}>· {d.name}{d.blockDur?(" ("+d.blockDur+"m)"):""}</div>)}
                  </div>
                ) : (
                  <div style={{ flex:1,padding:"12px 16px",background:T.surface,borderRadius:12,boxShadow:T.shadowSm }}>
                    <div style={{ fontSize:14,fontWeight:700 }}>{item.name}{item.dur&&<span style={{ fontWeight:400,color:T.textSec,marginLeft:6 }}>· {item.dur} min</span>}</div>
                    {item.focus&&<div style={{ fontSize:12,color:T.textSec,marginTop:2 }}>{item.focus}</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ width:280,borderLeft:"1px solid "+T.border,background:T.surface,padding:20,display:"flex",flexDirection:"column",flexShrink:0 }}>
          <div style={{ fontSize:11,fontWeight:700,color:T.textTer,textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.08em",marginBottom:10 }}>Live notes</div>
          <textarea value={S.practiceLiveNotes||""} onChange={e=>D({t:"setPracticeField",field:"practiceLiveNotes",value:e.target.value})} placeholder="Notes during practice…" style={{ flex:1,width:"100%",padding:12,background:T.bg,border:"1.5px solid "+T.border,borderRadius:10,color:T.text,fontSize:13,outline:"none",resize:"none",lineHeight:1.6 }} />
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex",flexDirection:"column",height:"100vh",background:T.bg,fontFamily:F }}>
      <div style={{ background:T.navy,padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0 }}>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          <button onClick={()=>D({t:"goHome"})} style={{ display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.08)",border:"none",color:"rgba(255,255,255,0.6)",fontSize:12,fontWeight:600,padding:"7px 14px",borderRadius:8,cursor:"pointer" }}><Ic n="arrowLeft" size={14} color="rgba(255,255,255,0.6)" sw={2} /> Back</button>
          <div style={{ fontSize:20,fontWeight:800,color:"#FFF" }}>Practice Planner</div>
        </div>
        <div style={{ display:"flex",gap:2 }}>
          {[["plans","My Plans"],["edit",S.currentPractice?"Edit Plan":"Build Plan"]].map(([tab,label])=>(
            <button key={tab} onClick={()=>setPracticeTab(tab)} style={{ padding:"7px 16px",fontSize:12,fontWeight:600,borderRadius:8,cursor:"pointer",background:practiceTab===tab?"rgba(255,255,255,0.15)":"transparent",color:practiceTab===tab?"#FFF":"rgba(255,255,255,0.4)",border:"none" }}>{label}</button>
          ))}
        </div>
      </div>

      {practiceTab==="plans" && (
        <div style={{ flex:1,overflow:"auto",padding:"20px 28px" }}>
          <div style={{ display:"flex",justifyContent:"flex-end",marginBottom:16 }}>
            <button onClick={()=>{D({t:"goPractice"});setPracticeTab("edit");}} style={{ display:"flex",alignItems:"center",gap:6,padding:"9px 18px",fontSize:13,fontWeight:600,background:T.navy,color:"#FFF",border:"none",borderRadius:10,cursor:"pointer" }}><Ic n="plus" size={14} color="#FFF" sw={2.5} /> Build plan</button>
          </div>
          {S.practices.length===0 && <div style={{ textAlign:"center",padding:"48px 0",color:T.textTer,fontSize:14 }}>No saved plans yet</div>}
          {S.practices.map(p=>(
            <div key={p.id} style={{ padding:"16px 20px",background:T.surface,borderRadius:14,marginBottom:10,boxShadow:T.shadowSm,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
              <div>
                <div style={{ fontSize:15,fontWeight:700 }}>{p.title}</div>
                <div style={{ fontSize:12,color:T.textSec,marginTop:2 }}>{p.date} · {p.items.length} items · {p.totalTime} min</div>
              </div>
              <div style={{ display:"flex",gap:6 }}>
                <button onClick={()=>D({t:"viewPractice",id:p.id})} style={{ padding:"7px 14px",fontSize:12,fontWeight:600,background:T.navyBg,color:T.navy,border:"none",borderRadius:8,cursor:"pointer" }}>View</button>
                <button onClick={()=>D({t:"deletePractice",id:p.id})} style={{ padding:"7px 14px",fontSize:12,fontWeight:600,background:T.redBg,color:T.red,border:"none",borderRadius:8,cursor:"pointer" }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {practiceTab==="edit" && (
        <>
          <div style={{ padding:"10px 24px",background:T.surface,borderBottom:"1px solid "+T.border,display:"flex",gap:12,alignItems:"center",flexShrink:0,flexWrap:"wrap" }}>
            <input value={S.practiceTitle} onChange={e=>D({t:"setPracticeField",field:"practiceTitle",value:e.target.value})} placeholder="Practice title…" style={{ flex:"1 1 180px",padding:"9px 12px",fontSize:14,fontWeight:600,borderRadius:10,border:"1.5px solid "+T.border,background:T.bg,outline:"none",color:T.text }} />
            <select value={S.practiceDuration} onChange={e=>D({t:"setPracticeField",field:"practiceDuration",value:parseInt(e.target.value)})} style={{ padding:"9px 12px",fontSize:13,borderRadius:10,border:"1.5px solid "+T.border,background:T.bg,outline:"none",color:T.text }}>
              {[60,75,90,105,120].map(m=><option key={m} value={m}>{m} min</option>)}
            </select>
            <input type="date" value={S.practiceDate} onChange={e=>D({t:"setPracticeField",field:"practiceDate",value:e.target.value})} style={{ padding:"9px 12px",fontSize:13,borderRadius:10,border:"1.5px solid "+T.border,background:T.bg,outline:"none",color:T.text }} />
            <div style={{ display:"flex",alignItems:"center",gap:8,marginLeft:"auto" }}>
              <div style={{ width:80,height:5,borderRadius:99,background:T.bgDeep,overflow:"hidden" }}>
                <div style={{ height:"100%",borderRadius:99,width:Math.min(100,(usedTime/S.practiceDuration)*100)+"%",background:remaining>=0?T.green:T.red,transition:"width 0.3s" }} />
              </div>
              <span style={{ fontSize:12,fontWeight:700,color:remaining>=0?T.green:T.red }}>{usedTime}/{S.practiceDuration}m</span>
            </div>
            <button onClick={()=>D({t:"savePractice"})} disabled={S.practiceItems.length===0} style={{ padding:"9px 20px",fontSize:13,fontWeight:700,background:S.practiceItems.length>0?T.navy:T.bgDeep,color:S.practiceItems.length>0?"#FFF":T.textTer,border:"none",borderRadius:10,cursor:"pointer" }}>Save</button>
          </div>

          <div style={{ flex:1,display:"flex",overflow:"hidden" }}>
            {/* Library */}
            <div style={{ flex:"0 0 40%",borderRight:"1px solid "+T.border,display:"flex",flexDirection:"column",overflow:"hidden",background:T.surface }}>
              <div style={{ padding:"12px 16px 8px",flexShrink:0 }}>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8 }}>
                  <span style={{ fontSize:12,fontWeight:700,color:T.textTer,textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.06em" }}>Drill Library</span>
                  <button onClick={()=>D({t:"openNewDrill"})} style={{ padding:"5px 12px",fontSize:11,fontWeight:600,borderRadius:8,border:"none",background:T.navyBg,color:T.navy,cursor:"pointer" }}>+ New</button>
                </div>
                <div style={{ display:"flex",gap:4,flexWrap:"wrap" }}>
                  {CATEGORIES.map(c=><button key={c} onClick={()=>D({t:"setDrillFilter",v:c})} style={{ padding:"4px 10px",fontSize:10,fontWeight:S.drillFilter===c?700:500,borderRadius:8,cursor:"pointer",background:S.drillFilter===c?T.navy:T.bg,color:S.drillFilter===c?"#FFF":T.textTer,border:"none" }}>{c}</button>)}
                </div>
              </div>
              <div style={{ flex:1,overflow:"auto",padding:"4px 16px 16px" }}>
                {filtered.map(drill=>(
                  <div key={drill.id} style={{ padding:"10px 12px",borderRadius:10,marginBottom:6,background:T.bg,border:"1px solid "+T.border }}>
                    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:2 }}>
                          <span style={{ fontSize:13,fontWeight:600 }}>{drill.name}</span>
                          <span style={{ fontSize:9,padding:"1px 6px",borderRadius:99,background:T.bgDeep,color:T.textTer }}>{drill.cat}</span>
                          <span style={{ fontSize:10,color:T.textTer }}>{drill.dur}m</span>
                        </div>
                        <div style={{ fontSize:11,color:T.textSec }}>{drill.desc}</div>
                      </div>
                      <div style={{ display:"flex",gap:4,marginLeft:8 }}>
                        <button onClick={()=>D({t:"editDrill",id:drill.id})} style={{ padding:"4px 8px",fontSize:10,borderRadius:6,border:"1px solid "+T.border,background:T.surface,color:T.textSec,cursor:"pointer" }}>Edit</button>
                        <button onClick={()=>{ if(addingToBlock!==null) D({t:"addDrillToBlock",blockIdx:addingToBlock,drillId:drill.id}); else D({t:"addDrillToPlan",id:drill.id}); }} style={{ padding:"4px 10px",fontSize:10,fontWeight:600,borderRadius:6,border:"none",background:T.navy,color:"#FFF",cursor:"pointer" }}>+ Add</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Plan */}
            <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden" }}>
              <div style={{ padding:"12px 18px",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid "+T.borderLight }}>
                <span style={{ fontSize:12,fontWeight:700,color:T.textTer,textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.06em" }}>Plan</span>
                <div style={{ display:"flex",gap:6 }}>
                  <button onClick={()=>D({t:"addHeader",name:"Warm Up"})} style={{ padding:"5px 11px",fontSize:11,fontWeight:600,borderRadius:8,border:"1.5px solid "+T.border,background:"transparent",color:T.textSec,cursor:"pointer" }}>+ Header</button>
                  <button onClick={()=>D({t:"addBlock",name:"Block",dur:15})} style={{ padding:"5px 11px",fontSize:11,fontWeight:600,borderRadius:8,border:"none",background:T.navyBg,color:T.navy,cursor:"pointer" }}>+ Block</button>
                  <button onClick={()=>D({t:"addParallelBlock",dur:15,name1:"Group A",name2:"Group B"})} style={{ padding:"5px 11px",fontSize:11,fontWeight:600,borderRadius:8,border:"none",background:T.navyBg,color:T.navy,cursor:"pointer" }}>+ Split</button>
                </div>
              </div>
              <div style={{ flex:1,overflow:"auto",padding:"8px 18px 18px" }}>
                {S.practiceItems.length===0 ? (
                  <div style={{ textAlign:"center",padding:"48px 20px",color:T.textTer }}>
                    <div style={{ width:52,height:52,borderRadius:14,background:T.bgAlt,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px" }}><Ic n="clipboard" size={24} color={T.textTer} /></div>
                    <div style={{ fontSize:14,fontWeight:600,color:T.textSec }}>Empty plan</div>
                    <div style={{ fontSize:12,marginTop:4 }}>Add drills from the library</div>
                  </div>
                ) : S.practiceItems.map((item,i)=>{
                  const elapsed=S.practiceItems.slice(0,i).reduce((s,x)=>s+(x.dur||0),0);
                  const Ctrl = () => (
                    <div style={{ display:"flex",gap:3 }}>
                      <button onClick={()=>D({t:"moveItem",i,dir:"up"})} disabled={i===0} style={{ width:24,height:24,borderRadius:6,border:"none",background:T.bgAlt,color:i>0?T.textSec:T.borderLight,cursor:i>0?"pointer":"default",fontSize:11 }}>↑</button>
                      <button onClick={()=>D({t:"moveItem",i,dir:"down"})} disabled={i===S.practiceItems.length-1} style={{ width:24,height:24,borderRadius:6,border:"none",background:T.bgAlt,color:i<S.practiceItems.length-1?T.textSec:T.borderLight,cursor:"pointer",fontSize:11 }}>↓</button>
                      <button onClick={()=>D({t:"removeItem",i})} style={{ width:24,height:24,borderRadius:6,border:"none",background:T.redBg,color:T.red,cursor:"pointer",fontSize:11 }}>×</button>
                    </div>
                  );
                  if (item.type==="header") return (
                    <div key={"h"+i} style={{ display:"flex",gap:10,marginBottom:4,marginTop:i>0?12:0 }}>
                      <div style={{ width:36,textAlign:"right",paddingTop:4,flexShrink:0,fontSize:11,fontWeight:700,color:T.textTer }}>{elapsed}′</div>
                      <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"2px solid "+T.navy,paddingBottom:4 }}>
                        <input value={item.name} onChange={e=>{const items=[...S.practiceItems];items[i]={...items[i],name:e.target.value};D({t:"setPracticeField",field:"practiceItems",value:items});}} style={{ fontSize:13,fontWeight:800,color:T.navy,background:"transparent",border:"none",outline:"none",textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.06em" }} />
                        <Ctrl />
                      </div>
                    </div>
                  );
                  if (item.type==="block") {
                    const isAdding=addingToBlock===i;
                    return (
                      <div key={"b"+i} style={{ display:"flex",gap:10,marginBottom:8 }}>
                        <div style={{ width:36,textAlign:"right",paddingTop:12,flexShrink:0,fontSize:12,fontWeight:700,color:T.navy }}>{elapsed}′</div>
                        <div style={{ flex:1,border:"1.5px solid "+T.navyBorder,borderRadius:12,background:T.navyBg,overflow:"hidden" }}>
                          <div style={{ padding:"8px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid "+T.navyBorder }}>
                            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                              <input value={item.name} onChange={e=>D({t:"updateBlock",i,data:{name:e.target.value}})} style={{ fontWeight:700,fontSize:13,color:T.navy,background:"transparent",border:"none",outline:"none",width:120 }} />
                              <input type="number" value={item.dur} onChange={e=>D({t:"updateBlock",i,data:{dur:parseInt(e.target.value)||0}})} style={{ width:36,padding:"2px 6px",fontSize:11,borderRadius:6,border:"1px solid "+T.navyBorder,background:T.surface,textAlign:"center",outline:"none" }} />
                              <span style={{ fontSize:10,color:T.textTer }}>min</span>
                            </div>
                            <div style={{ display:"flex",gap:4 }}>
                              <button onClick={()=>setAddingToBlock(isAdding?null:i)} style={{ padding:"3px 9px",fontSize:10,fontWeight:600,borderRadius:6,border:"none",background:isAdding?T.green:T.accent,color:"#FFF",cursor:"pointer" }}>{isAdding?"Done":"+ Drill"}</button>
                              <Ctrl />
                            </div>
                          </div>
                          <div style={{ padding:"8px 12px" }}>
                            {item.drills.length===0&&<div style={{ fontSize:11,color:T.textTer,textAlign:"center",padding:"6px 0" }}>{isAdding?"Tap '+ Add' on a drill →":"No drills yet"}</div>}
                            {item.drills.map((d,j)=>(
                              <div key={j} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 8px",marginBottom:3,borderRadius:8,background:T.surface }}>
                                <span style={{ fontSize:12,fontWeight:600 }}>{d.name}</span>
                                <div style={{ display:"flex",alignItems:"center",gap:4 }}>
                                  <input type="number" value={d.blockDur||d.dur||""} onChange={e=>{const items=[...S.practiceItems];const drills=[...items[i].drills];drills[j]={...drills[j],blockDur:parseInt(e.target.value)||0};items[i]={...items[i],drills};D({t:"setPracticeField",field:"practiceItems",value:items});}} style={{ width:30,padding:"2px 4px",fontSize:10,borderRadius:4,border:"1px solid "+T.border,textAlign:"center",outline:"none" }} />
                                  <span style={{ fontSize:9,color:T.textTer }}>m</span>
                                  <button onClick={()=>D({t:"removeFromBlock",blockIdx:i,drillIdx:j})} style={{ width:18,height:18,borderRadius:4,border:"none",background:T.redBg,color:T.red,cursor:"pointer",fontSize:10 }}>×</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  if (item.type==="parallel") {
                    return (
                      <div key={"p"+i} style={{ display:"flex",gap:10,marginBottom:8 }}>
                        <div style={{ width:36,textAlign:"right",paddingTop:12,flexShrink:0,fontSize:12,fontWeight:700,color:T.navy }}>{elapsed}′</div>
                        <div style={{ flex:1,border:"1.5px solid "+T.navyBorder,borderRadius:12,overflow:"hidden" }}>
                          <div style={{ padding:"8px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",background:T.navyBg,borderBottom:"1px solid "+T.navyBorder }}>
                            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                              <span style={{ fontSize:12,fontWeight:700,color:T.navy }}>⇄ Split</span>
                              <input type="number" value={item.dur} onChange={e=>{const items=[...S.practiceItems];items[i]={...items[i],dur:parseInt(e.target.value)||0};D({t:"setPracticeField",field:"practiceItems",value:items});}} style={{ width:36,padding:"2px 6px",fontSize:11,borderRadius:6,border:"1px solid "+T.navyBorder,background:T.surface,textAlign:"center",outline:"none" }} />
                              <span style={{ fontSize:10,color:T.textTer }}>min</span>
                            </div>
                            <div style={{ display:"flex",gap:3 }}>
                              <button onClick={()=>{const items=[...S.practiceItems];const bl=[...items[i].blocks,{name:"Group "+String.fromCharCode(65+items[i].blocks.length),drills:[]}];items[i]={...items[i],blocks:bl};D({t:"setPracticeField",field:"practiceItems",value:items});}} style={{ padding:"3px 8px",fontSize:10,fontWeight:600,borderRadius:6,border:"1px solid "+T.navyBorder,background:T.surface,color:T.navy,cursor:"pointer" }}>+ Group</button>
                              <Ctrl />
                            </div>
                          </div>
                          <div style={{ display:"flex" }}>
                            {item.blocks.map((grp,gi)=>(
                              <div key={gi} style={{ flex:1,borderRight:gi<item.blocks.length-1?"1px solid "+T.navyBorder:"none",padding:"8px 10px" }}>
                                <input value={grp.name} onChange={e=>{const items=[...S.practiceItems];const bl=items[i].blocks.map((b,bi)=>bi===gi?{...b,name:e.target.value}:b);items[i]={...items[i],blocks:bl};D({t:"setPracticeField",field:"practiceItems",value:items});}} style={{ fontWeight:700,fontSize:11,color:T.navy,background:"transparent",border:"none",borderBottom:"1px solid "+T.navyBorder,outline:"none",width:"100%",marginBottom:6,paddingBottom:4 }} />
                                {grp.drills.length===0&&<div style={{ fontSize:10,color:T.textTer,padding:"6px 0",textAlign:"center" }}>No drills</div>}
                                {grp.drills.map((d,j)=>(
                                  <div key={j} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"4px 6px",marginBottom:2,borderRadius:6,background:T.surface }}>
                                    <span style={{ fontSize:11,fontWeight:600 }}>{d.name}</span>
                                    <button onClick={()=>D({t:"removeFromParallelBlock",blockIdx:i,groupIdx:gi,drillIdx:j})} style={{ width:16,height:16,borderRadius:3,border:"none",background:T.redBg,color:T.red,cursor:"pointer",fontSize:8 }}>×</button>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={"d"+i} style={{ display:"flex",gap:10,marginBottom:6 }}>
                      <div style={{ width:36,textAlign:"right",paddingTop:12,flexShrink:0,fontSize:12,fontWeight:700,color:T.navy }}>{elapsed}′</div>
                      <div style={{ flex:1,padding:"10px 14px",borderRadius:12,background:T.surface,boxShadow:T.shadowSm,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                        <div>
                          <span style={{ fontSize:13,fontWeight:600 }}>{item.name}</span>
                          <span style={{ fontSize:11,color:T.textTer,marginLeft:6 }}>{item.dur} min</span>
                          {item.focus&&<div style={{ fontSize:11,color:T.textSec,marginTop:1 }}>{item.focus}</div>}
                        </div>
                        <Ctrl />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {S.editingDrill && (()=>{
        const drill=S.drillLibrary.find(d=>d.id===S.editingDrill);
        if (!drill) return null;
        return (
          <Modal onClose={()=>D({t:"closeEditDrill"})}>
            <div style={{ fontSize:18,fontWeight:800,marginBottom:18,letterSpacing:"-0.02em" }}>Edit drill</div>
            {[{label:"Name",field:"name",type:"text"},{label:"Category",field:"cat",type:"select"},{label:"Duration (min)",field:"dur",type:"number"},{label:"Description",field:"desc",type:"text"},{label:"Focus",field:"focus",type:"text"},{label:"Video URL",field:"videoUrl",type:"text"}].map(f=>(
              <div key={f.field} style={{ marginBottom:12 }}>
                <Label>{f.label}</Label>
                {f.type==="select"?(
                  <select value={drill[f.field]} onChange={e=>D({t:"updateDrill",id:drill.id,data:{[f.field]:e.target.value}})} style={{ width:"100%",padding:"10px 12px",fontSize:13,borderRadius:10,border:"1.5px solid "+T.border,background:T.bg,outline:"none",color:T.text }}>
                    {CATEGORIES.filter(c=>c!=="All").map(c=><option key={c}>{c}</option>)}
                  </select>
                ):(
                  <Input type={f.type} value={drill[f.field]||""} onChange={e=>D({t:"updateDrill",id:drill.id,data:{[f.field]:f.type==="number"?parseInt(e.target.value)||0:e.target.value}})} />
                )}
              </div>
            ))}
            <div style={{ display:"flex",justifyContent:"space-between",marginTop:20 }}>
              <button onClick={()=>D({t:"deleteDrill",id:drill.id})} style={{ padding:"10px 20px",fontSize:13,fontWeight:600,background:T.redBg,color:T.red,border:"none",borderRadius:10,cursor:"pointer" }}>Delete</button>
              <PrimaryBtn onClick={()=>D({t:"closeEditDrill"})}>Done</PrimaryBtn>
            </div>
          </Modal>
        );
      })()}

      {S.newDrill && (
        <Modal onClose={()=>D({t:"cancelNewDrill"})}>
          <div style={{ fontSize:18,fontWeight:800,marginBottom:18 }}>New drill</div>
          {[{label:"Name *",field:"name",type:"text",placeholder:"e.g. 3-Person Serve Receive"},{label:"Category",field:"cat",type:"select"},{label:"Duration (min)",field:"dur",type:"number"},{label:"Description",field:"desc",type:"text",placeholder:"Brief overview"},{label:"Focus",field:"focus",type:"text",placeholder:"e.g. Passing accuracy"}].map(f=>(
            <div key={f.field} style={{ marginBottom:12 }}>
              <Label>{f.label}</Label>
              {f.type==="select"?(
                <select value={S.newDrillData[f.field]} onChange={e=>D({t:"setNewDrillField",field:f.field,value:e.target.value})} style={{ width:"100%",padding:"10px 12px",fontSize:13,borderRadius:10,border:"1.5px solid "+T.border,background:T.bg,outline:"none",color:T.text }}>
                  {CATEGORIES.filter(c=>c!=="All").map(c=><option key={c}>{c}</option>)}
                </select>
              ):(
                <Input type={f.type} value={S.newDrillData[f.field]} onChange={e=>D({t:"setNewDrillField",field:f.field,value:e.target.value})} placeholder={f.placeholder} />
              )}
            </div>
          ))}
          <div style={{ display:"flex",justifyContent:"flex-end",gap:10,marginTop:20 }}>
            <GhostBtn onClick={()=>D({t:"cancelNewDrill"})}>Cancel</GhostBtn>
            <PrimaryBtn disabled={!S.newDrillData.name} onClick={()=>D({t:"saveNewDrill"})}>Save drill</PrimaryBtn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ─── MATCH DETAIL ─── */
function MatchDetail({ S, D }) {
  const m = S.matchHistory[S.viewMatchIdx];
  if (!m) return null;
  const allP = m.roster||[];
  return (
    <div style={{ display:"flex",flexDirection:"column",height:"100vh",background:T.bg,fontFamily:F }}>
      <div style={{ background:T.navy,padding:"16px 24px",display:"flex",alignItems:"center",gap:14,flexShrink:0 }}>
        <button onClick={()=>D({t:"goHome"})} style={{ display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.08)",border:"none",color:"rgba(255,255,255,0.6)",fontSize:12,fontWeight:600,padding:"7px 14px",borderRadius:8,cursor:"pointer" }}><Ic n="arrowLeft" size={14} color="rgba(255,255,255,0.6)" sw={2} /> Back</button>
        <div>
          <div style={{ fontSize:10,color:"rgba(255,255,255,0.3)",fontWeight:600,textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.1em" }}>{m.date}</div>
          <div style={{ fontSize:20,fontWeight:800,color:"#FFF" }}>{m.homeTeam} vs {m.awayTeam}</div>
        </div>
        <div style={{ marginLeft:"auto",display:"flex",gap:8 }}>
          {m.sets.map((s,i)=><span key={i} style={{ fontSize:13,fontWeight:700,color:s[0]>s[1]?T.green:"rgba(255,255,255,0.4)" }}>{s[0]}-{s[1]}</span>)}
        </div>
      </div>
      <div style={{ flex:1,overflow:"auto",padding:"20px 24px" }}>
        <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12,background:T.surface,borderRadius:12,overflow:"hidden",boxShadow:T.shadowSm }}>
          <thead><tr style={{ borderBottom:"2px solid "+T.navy }}>{[["#","Number"],["Player","Player"],["SA","Serve Att"],["A","Aces"],["SE","Serve Err"],["ATT","Attack Att"],["K","Kills"],["E","Attack Err"],["PCT","Hit %"],["R","Receptions"],["RE","Recept Err"],["BS","Blk Solo"],["BA","Blk Assist"],["AST","Assists"],["D","Digs"],["DE","Dig Err"]].map(([h,full])=><th key={h} title={full} style={{ padding:"9px 6px",fontSize:10,fontWeight:700,color:T.textSec,textAlign:h==="Player"?"left":"center",textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.05em" }}>{h}</th>)}</tr></thead>
          <tbody>{allP.map(p=>{const s=calc(m.stats||{},p.num);const c=(v,col)=><td style={{ padding:"9px 6px",textAlign:"center",color:v>0?(col||T.text):T.borderLight,fontWeight:v>0?600:400 }}>{v||"—"}</td>;return(
            <tr key={p.num} style={{ borderBottom:"1px solid "+T.borderLight }}>
              <td style={{ padding:"9px 6px",fontWeight:800,color:p.lib?T.libero:T.navy,textAlign:"center" }}>{p.num}</td>
              <td style={{ padding:"9px 6px",fontWeight:500,whiteSpace:"nowrap" }}>{p.name}{p.lib&&<span style={{ color:T.libero,fontSize:9,marginLeft:4,fontWeight:700 }}>L</span>}</td>
              {c(s.sa)}{c(s.a,T.green)}{c(s.se,T.red)}
              {c(s.att)}{c(s.k,T.green)}{c(s.e,T.red)}
              <td style={{ padding:"9px 6px",textAlign:"center",fontWeight:700,color:s.hp>0.2?T.green:s.hp<0?T.red:T.textSec }}>{s.att>0?(s.hp>=0?"":"-")+"."+Math.abs(s.hp*1000).toFixed(0).padStart(3,"0"):"—"}</td>
              {c(s.r)}{c(s.re,T.red)}
              {c(s.bs,T.green)}{c(s.ba,T.gold)}
              {c(s.ast,T.green)}
              {c(s.d,T.green)}{c(s.de,T.red)}
            </tr>);})}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── SCOREBOOK (kept functional, theme refreshed) ─── */
function Scorebook({ S, D }) {
  const [subModal, setSubModal] = useState(null);
  const [subOut, setSubOut] = useState("");
  const [subIn, setSubIn] = useState("");
  const [showSetEndPopup, setShowSetEndPopup] = useState(false);
  const [setEndDismissed, setSetEndDismissed] = useState(false);
  const prevSet = useRef(S.sbSet);
  if (prevSet.current !== S.sbSet) { prevSet.current = S.sbSet; if (setEndDismissed) setSetEndDismissed(false); }
  const currentServer = () => { const l=S.sbServing==="home"?S.sbHomeLine:S.sbAwayLine; const r=S.sbServing==="home"?S.sbHomeRot:S.sbAwayRot; return l[r]||"?"; };
  const maxCols=25;
  const rallyNums=[Array.from({length:12},(_,i)=>i+1),Array.from({length:13},(_,i)=>i+13),Array.from({length:10},(_,i)=>i+26)];
  const courtPositions=[{pos:3,label:"IV",x:"15%",y:"20%"},{pos:2,label:"III",x:"50%",y:"20%"},{pos:1,label:"II",x:"85%",y:"20%"},{pos:4,label:"V",x:"15%",y:"70%"},{pos:5,label:"VI",x:"50%",y:"70%"},{pos:0,label:"I",x:"85%",y:"70%"}];

  const NavBar = ({ right }) => (
    <div style={{ background:T.navy,padding:"12px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0 }}>
      <div style={{ display:"flex",alignItems:"center",gap:12 }}>
        <button onClick={()=>D({t:"goHome"})} style={{ display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.08)",border:"none",color:"rgba(255,255,255,0.6)",fontSize:12,fontWeight:600,padding:"7px 14px",borderRadius:8,cursor:"pointer" }}><Ic n="arrowLeft" size={14} color="rgba(255,255,255,0.6)" sw={2} /> Back</button>
        <div>
          <div style={{ fontSize:10,color:"rgba(255,255,255,0.3)",fontWeight:600,textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.1em" }}>Scorebook</div>
          <div style={{ display:"flex",alignItems:"baseline",gap:8 }}>
            <div style={{ fontSize:18,fontWeight:800,color:"#FFF" }}>Set {S.sbSet}</div>
            {S.sbSetData.length>0&&<div style={{ fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.5)" }}>{S.sbSetData.filter(s=>s.homeScore>s.awayScore).length}–{S.sbSetData.filter(s=>s.awayScore>s.homeScore).length}</div>}
          </div>
        </div>
      </div>
      <div style={{ display:"flex",gap:8 }}>{right}</div>
    </div>
  );

  if (S.sbPage==="sbSetup") return (
    <div style={{ minHeight:"100vh",background:T.bg,fontFamily:F }}>
      <NavBar right={<>
        <button onClick={()=>D({t:"sbStartSet"})} style={{ padding:"10px 28px",fontSize:13,fontWeight:800,background:"#FFF",color:T.navy,border:"none",borderRadius:10,cursor:"pointer",textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.04em" }}>Start Set {S.sbSet}</button>
      </>} />
      {S.sbSet===1&&<div style={{ padding:"16px 28px 0",display:"flex",alignItems:"center",gap:10 }}>
        <span style={{ fontSize:11,fontWeight:700,color:T.textSec,textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.08em" }}>Format</span>
        {[3,5].map(f=><button key={f} onClick={()=>D({t:"sbField",f:"sbFormat",v:f})} style={{ padding:"8px 20px",fontSize:13,fontWeight:700,borderRadius:10,cursor:"pointer",background:S.sbFormat===f?T.navy:T.surface,color:S.sbFormat===f?"#FFF":T.navy,border:"2px solid "+T.navy }}>Best of {f}</button>)}
      </div>}
      {S.sbSetData.length>0&&<div style={{ margin:"16px 28px 0",display:"flex",gap:8 }}>
        {S.sbSetData.map((s,i)=><div key={i} style={{ padding:"10px 16px",background:T.surface,borderRadius:12,boxShadow:T.shadowSm }}>
          <div style={{ fontSize:10,fontWeight:700,color:T.textTer,textTransform:"uppercase",fontFamily:FL }}>Set {s.set}</div>
          <div style={{ fontSize:16,fontWeight:800,marginTop:2 }}><span style={{ color:s.homeScore>s.awayScore?T.navy:T.textTer }}>{s.homeScore}</span><span style={{ color:T.borderLight,margin:"0 4px" }}>—</span><span style={{ color:s.awayScore>s.homeScore?T.navy:T.textTer }}>{s.awayScore}</span></div>
        </div>)}
      </div>}
      <div style={{ padding:"16px 28px 8px",display:"flex",alignItems:"center",gap:10 }}>
        <span style={{ fontSize:11,fontWeight:700,color:T.textSec,textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.08em" }}>First serve</span>
        {["home","away"].map(sv=><button key={sv} onClick={()=>D({t:"sbField",f:"sbServing",v:sv})} style={{ padding:"8px 20px",fontSize:12,fontWeight:700,borderRadius:10,cursor:"pointer",background:S.sbServing===sv?T.navy:T.surface,color:S.sbServing===sv?"#FFF":T.navy,border:"2px solid "+T.navy }}>{sv==="home"?S.sbHomeTeam:S.sbAwayTeam}</button>)}
      </div>
      <div style={{ display:"flex",gap:16,padding:"0 28px 28px" }}>
        {[{team:"home",name:S.sbHomeTeam,nameKey:"sbHomeTeam",line:S.sbHomeLine,lineKey:"sbHomeLine",lib:S.sbHomeLib,libKey:"sbHomeLib",color:T.navy},{team:"away",name:S.sbAwayTeam,nameKey:"sbAwayTeam",line:S.sbAwayLine,lineKey:"sbAwayLine",lib:S.sbAwayLib,libKey:"sbAwayLib",color:T.red}].map(t=>{
          const lastBook=S.sbSavedBooks.length>0?S.sbSavedBooks[S.sbSavedBooks.length-1]:null;
          const lastLine=lastBook?(t.team==="home"?lastBook.setData?.[0]?.homeLine:lastBook.setData?.[0]?.awayLine):null;
          const lastLib=lastBook?(t.team==="home"?lastBook.homeLib:lastBook.awayLib):null;
          const rotateCW=()=>{const l=[...t.line];const first=l.shift();l.push(first);D({t:"sbField",f:t.lineKey,v:l});};
          const rotateCCW=()=>{const l=[...t.line];const last=l.pop();l.unshift(last);D({t:"sbField",f:t.lineKey,v:l});};
          return (
          <div key={t.team} style={{ flex:1,background:T.surface,borderRadius:16,overflow:"hidden",boxShadow:T.shadow }}>
            <div style={{ height:3,background:t.color }} />
            <div style={{ padding:"14px 18px",borderBottom:"1px solid "+T.border }}>
              <div style={{ fontSize:9,fontWeight:700,color:t.color,textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.12em",marginBottom:4 }}>{t.team.toUpperCase()}</div>
              <input value={t.name} onChange={e=>D({t:"sbField",f:t.nameKey,v:e.target.value})} style={{ fontSize:20,fontWeight:800,color:T.text,background:"transparent",border:"none",outline:"none",width:"100%",letterSpacing:"-0.02em" }} />
            </div>
            {lastLine&&S.sbSet===1&&<div style={{ padding:"8px 18px",background:T.navyBg,borderBottom:"1px solid "+T.navyBorder }}>
              <button onClick={()=>{D({t:"sbField",f:t.lineKey,v:[...lastLine]});if(lastLib)D({t:"sbField",f:t.libKey,v:lastLib});}} style={{ fontSize:11,fontWeight:700,color:T.navy,background:"none",border:"none",cursor:"pointer",padding:0 }}>↩ Use last lineup: {lastLine.join(", ")}{lastLib?" (LIB #"+lastLib+")":""}</button>
            </div>}
            <div style={{ display:"flex" }}>
              <div style={{ flex:"0 0 220px",padding:14,borderRight:"1px solid "+T.border }}>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8 }}>
                  <div style={{ fontSize:9,fontWeight:700,color:T.textTer,textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.08em" }}>Court</div>
                  <div style={{ display:"flex",gap:4 }}>
                    <button onClick={rotateCCW} title="Rotate CCW" style={{ width:26,height:26,borderRadius:6,border:"1px solid "+T.border,background:T.bg,color:T.navy,cursor:"pointer",fontSize:12,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center" }}>↶</button>
                    <button onClick={rotateCW} title="Rotate CW" style={{ width:26,height:26,borderRadius:6,border:"1px solid "+T.border,background:T.bg,color:T.navy,cursor:"pointer",fontSize:12,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center" }}>↷</button>
                  </div>
                </div>
                <div style={{ position:"relative",height:170,background:T.bgAlt,borderRadius:10,border:"1px solid "+T.border }}>
                  <div style={{ position:"absolute",top:"12%",left:"5%",right:"5%",height:1.5,background:T.border }} />
                  <div style={{ position:"absolute",top:"12%",left:"50%",transform:"translateX(-50%)",marginTop:-10,fontSize:7,color:T.textTer,fontWeight:700 }}>NET</div>
                  {courtPositions.map(cp=>{
                    const val=t.line[cp.pos]||"";
                    return <div key={cp.pos} style={{ position:"absolute",left:cp.x,top:cp.y,transform:"translate(-50%,-50%)" }}>
                      <input type="number" value={val} onChange={e=>{const l=[...t.line];l[cp.pos]=e.target.value;D({t:"sbField",f:t.lineKey,v:l});}} style={{ width:48,height:40,borderRadius:8,border:val?"2px solid "+t.color:"1.5px dashed "+T.border,background:val?T.surface:"transparent",textAlign:"center",fontSize:16,fontWeight:800,color:T.navy,outline:"none" }} />
                    </div>;
                  })}
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:6,marginTop:8,padding:"8px 10px",background:T.liberoBg,borderRadius:8 }}>
                  <span style={{ fontSize:10,fontWeight:800,color:T.libero }}>LIB</span>
                  <input type="number" value={t.lib} onChange={e=>D({t:"sbField",f:t.libKey,v:e.target.value})} placeholder="#" style={{ width:44,padding:"5px 6px",borderRadius:6,border:"1px solid "+T.liberoBorder,background:T.surface,textAlign:"center",fontSize:15,fontWeight:800,color:T.libero,outline:"none" }} />
                </div>
              </div>
              <div style={{ flex:1,padding:14 }}>
                <div style={{ fontSize:9,fontWeight:700,color:T.textTer,textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.08em",marginBottom:8 }}>Serve order</div>
                {["I","II","III","IV","V","VI"].map((pos,idx)=>(
                  <div key={pos} style={{ display:"flex",alignItems:"center",gap:6,marginBottom:5 }}>
                    <span style={{ width:22,fontSize:11,fontWeight:700,color:T.textTer }}>{pos}</span>
                    <input type="number" value={t.line[idx]} onChange={e=>{const l=[...t.line];l[idx]=e.target.value;D({t:"sbField",f:t.lineKey,v:l});}} style={{ width:50,padding:"7px 8px",borderRadius:8,border:"1.5px solid "+T.border,background:T.bg,textAlign:"center",fontSize:15,fontWeight:800,color:T.text,outline:"none" }} />
                    {t.team==="home"&&S.roster&&(()=>{const p=S.roster.find(r=>String(r.num)===String(t.line[idx]));return p?<span style={{ fontSize:10,color:T.textTer,marginLeft:4 }}>{p.name}</span>:null;})()}
                  </div>
                ))}
              </div>
            </div>
          </div>
          );
        })}
      </div>
      {/* Roster reference below lineup cards */}
      {S.roster&&S.roster.some(p=>p.name)&&<div style={{ padding:"0 28px 28px" }}>
        <div style={{ padding:"12px 16px",background:T.surface,borderRadius:12,boxShadow:T.shadowSm }}>
          <div style={{ fontSize:9,fontWeight:700,color:T.textTer,textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.08em",marginBottom:8 }}>Roster Reference</div>
          <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
            {S.roster.filter(p=>p.name).map(p=><span key={p.num} style={{ fontSize:11,padding:"4px 10px",borderRadius:6,background:p.lib?T.liberoBg:T.bgAlt,color:p.lib?T.libero:T.text,fontWeight:600,border:"1px solid "+(p.lib?T.liberoBorder:T.border) }}>#{p.num} {p.name}</span>)}
          </div>
        </div>
      </div>}
    </div>
  );

  if (S.sbPage==="sbSetEnd") {
    const lastSet=S.sbSetData[S.sbSetData.length-1];
    const hw=S.sbSetData.filter(s=>s.homeScore>s.awayScore).length, aw=S.sbSetData.filter(s=>s.awayScore>s.homeScore).length;
    return (
      <div style={{ minHeight:"100vh",background:T.bg,fontFamily:F }}>
        <NavBar right={<>
          <button onClick={()=>D({t:"sbBackToLive"})} style={{ padding:"10px 18px",fontSize:12,fontWeight:700,background:"rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.7)",border:"none",borderRadius:10,cursor:"pointer" }}>← Edit</button>
          {S.sbMatchDone?<button onClick={()=>D({t:"sbEndMatch"})} style={{ padding:"10px 24px",fontSize:13,fontWeight:800,background:"#FFF",color:T.navy,border:"none",borderRadius:10,cursor:"pointer",textTransform:"uppercase",fontFamily:FL }}>Save match</button>:<button onClick={()=>D({t:"sbNextSet"})} style={{ padding:"10px 24px",fontSize:13,fontWeight:800,background:"#FFF",color:T.navy,border:"none",borderRadius:10,cursor:"pointer",textTransform:"uppercase",fontFamily:FL }}>Next set →</button>}
        </>} />
        <div style={{ maxWidth:520,margin:"32px auto",padding:"0 24px" }}>
          <div style={{ textAlign:"center",padding:28,background:T.surface,borderRadius:20,boxShadow:T.shadow,marginBottom:16 }}>
            <div style={{ fontSize:24,fontWeight:800,letterSpacing:"-0.03em" }}>
              <span style={{ color:lastSet.homeScore>lastSet.awayScore?T.navy:T.textSec }}>{S.sbHomeTeam} {lastSet.homeScore}</span>
              <span style={{ color:T.border,margin:"0 10px" }}>—</span>
              <span style={{ color:lastSet.awayScore>lastSet.homeScore?T.red:T.textSec }}>{lastSet.awayScore} {S.sbAwayTeam}</span>
            </div>
            <div style={{ fontSize:13,color:T.textSec,marginTop:8 }}>Sets: {hw} — {aw}</div>
          </div>
          {S.sbSetData.map((s,i)=><div key={i} style={{ padding:"12px 18px",background:T.surface,borderRadius:12,marginBottom:8,boxShadow:T.shadowSm,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <span style={{ fontSize:12,fontWeight:700,color:T.textTer,textTransform:"uppercase",fontFamily:FL }}>Set {s.set}</span>
            <span style={{ fontSize:16,fontWeight:800 }}><span style={{ color:s.homeScore>s.awayScore?T.navy:T.textSec }}>{s.homeScore}</span><span style={{ color:T.border,margin:"0 8px" }}>—</span><span style={{ color:s.awayScore>s.homeScore?T.red:T.textSec }}>{s.awayScore}</span></span>
          </div>)}
        </div>
      </div>
    );
  }

  // LIVE
  return (
    <div style={{ display:"flex",flexDirection:"column",height:"100vh",background:T.bg,fontFamily:F,overflow:"hidden" }}>
      <div style={{ background:T.navy,padding:"10px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0 }}>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          <span style={{ fontSize:15,fontWeight:800,color:"#FFF" }}>CourtIQ</span>
          <span style={{ fontSize:11,fontWeight:700,color:T.navyBg,padding:"3px 10px",background:T.navyMid,borderRadius:6 }}>SET {S.sbSet}</span>
          <span style={{ fontSize:11,color:"rgba(255,255,255,0.4)" }}>Serving: <strong style={{ color:"#FFF" }}>#{currentServer()} {S.sbServing==="home"?S.sbHomeTeam:S.sbAwayTeam}</strong></span>
          <span style={{ fontSize:22,fontWeight:800,color:"#FFF" }}>{S.sbHomeScore} <span style={{ color:"rgba(255,255,255,0.25)",fontSize:14 }}>—</span> {S.sbAwayScore}</span>
        </div>
        <div style={{ display:"flex",gap:6 }}>
          <button onClick={()=>D({t:"sbUndo"})} style={{ padding:"7px 14px",fontSize:12,fontWeight:700,background:T.accentBg,color:T.accent,border:"1px solid "+T.accentBorder,borderRadius:8,cursor:"pointer" }}>↩ Undo</button>
          <button onClick={()=>D({t:"goHome"})} style={{ padding:"7px 14px",fontSize:11,fontWeight:600,background:"rgba(192,57,43,0.25)",color:"#FCA5A5",border:"none",borderRadius:8,cursor:"pointer" }}>Exit</button>
        </div>
      </div>
      <div style={{ flex:1,overflow:"auto",padding:"8px 10px" }}>
        {(()=>{
          const maxPt=S.sbSet>=S.sbFormat?15:25;
          const hGP=S.sbHomeScore>=maxPt-1&&S.sbHomeScore-S.sbAwayScore>=1;
          const aGP=S.sbAwayScore>=maxPt-1&&S.sbAwayScore-S.sbHomeScore>=1;
          const hWon=S.sbHomeScore>=maxPt&&S.sbHomeScore-S.sbAwayScore>=2;
          const aWon=S.sbAwayScore>=maxPt&&S.sbAwayScore-S.sbHomeScore>=2;
          const shouldPopup=(hWon||aWon)&&!setEndDismissed;
          if (hGP||aGP) return <div style={{ padding:"8px 14px",background:T.yellowBg,border:"1px solid "+T.yellowBorder,borderRadius:10,marginBottom:8,fontSize:12,fontWeight:700,color:T.yellow }}>Game point — {hGP?S.sbHomeTeam:S.sbAwayTeam} ({S.sbHomeScore}-{S.sbAwayScore})</div>;
          return null;
        })()}
        {(()=>{const maxPt=S.sbSet>=S.sbFormat?15:25;const hW=S.sbHomeScore>=maxPt&&S.sbHomeScore-S.sbAwayScore>=2;const aW=S.sbAwayScore>=maxPt&&S.sbAwayScore-S.sbHomeScore>=2;return (hW||aW)&&!setEndDismissed;})()&&<div style={{ position:"fixed",inset:0,background:"rgba(13,27,62,0.5)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200 }}>
          <div className="slideup" style={{ background:T.surface,borderRadius:20,padding:32,maxWidth:360,width:"90%",textAlign:"center",boxShadow:T.shadowLg }}>
            <div style={{ fontSize:20,fontWeight:800,marginBottom:6 }}>Set complete?</div>
            <div style={{ fontSize:14,color:T.textSec,marginBottom:24 }}>{S.sbHomeTeam} {S.sbHomeScore} — {S.sbAwayScore} {S.sbAwayTeam}</div>
            <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
              <GhostBtn onClick={()=>setSetEndDismissed(true)}>Continue</GhostBtn>
              <PrimaryBtn onClick={()=>{setSetEndDismissed(true);D({t:"sbEndSet"});}}>End set</PrimaryBtn>
            </div>
          </div>
        </div>}
        {[{team:"home",name:S.sbHomeTeam,color:T.navy,colorLight:T.navyBg,colorBorder:T.navyBorder,line:S.sbHomeLine,lib:S.sbHomeLib,rot:S.sbHomeRot,subs:S.sbHomeSubs,to:S.sbHomeTO,grid:S.sbHomeGrid,circled:S.sbHomeCircled,score:S.sbHomeScore,players:S.sbHomePlayers,timeouts:S.sbHomeTimeouts},
          {team:"away",name:S.sbAwayTeam,color:T.red,colorLight:T.redBg,colorBorder:T.redBorder,line:S.sbAwayLine,lib:S.sbAwayLib,rot:S.sbAwayRot,subs:S.sbAwaySubs,to:S.sbAwayTO,grid:S.sbAwayGrid,circled:S.sbAwayCircled,score:S.sbAwayScore,players:S.sbAwayPlayers,timeouts:S.sbAwayTimeouts}].map(tm=>(
          <div key={tm.team} style={{ marginBottom:10,background:T.surface,borderRadius:14,overflow:"hidden",boxShadow:T.shadowSm }}>
            <div style={{ height:3,background:tm.color }} />
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 14px",background:T.bg,borderBottom:"1px solid "+T.border }}>
              <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                <span style={{ fontSize:15,fontWeight:800,color:T.text }}>{tm.name}</span>
                <span style={{ fontSize:28,fontWeight:800,color:tm.color }}>{tm.score}</span>
              </div>
              <div style={{ display:"flex",gap:6,alignItems:"center" }}>
                <button onClick={()=>D({t:"sbTimeout",team:tm.team})} disabled={tm.to>=2} style={{ padding:"7px 14px",fontSize:11,fontWeight:700,borderRadius:8,cursor:tm.to>=2?"default":"pointer",background:tm.to>=2?T.redBg:T.surface,border:"2px solid "+(tm.to>=2?T.redBorder:T.navy),color:tm.to>=2?T.red:T.navy }}>
                  {tm.to>=2?"T/O Used":"T/O "+tm.to+"/2"}{tm.timeouts.length>0?" ("+tm.timeouts.join(", ")+")":""}
                </button>
                <div style={{ display:"flex",borderRadius:8,overflow:"hidden",border:"2px solid "+tm.color }}>
                  <button onClick={()=>D({t:"sbRemovePoint",team:tm.team})} disabled={tm.score<=0} style={{ padding:"8px 12px",fontSize:14,fontWeight:800,cursor:tm.score>0?"pointer":"default",background:T.surface,color:tm.score>0?tm.color:T.border,border:"none",borderRight:"1px solid "+tm.color }}>−1</button>
                  <button onClick={()=>D({t:"sbPoint",team:tm.team})} style={{ padding:"8px 18px",fontSize:14,fontWeight:800,cursor:"pointer",background:tm.color,color:"#FFF",border:"none" }}>+1</button>
                </div>
              </div>
            </div>
            <div style={{ display:"flex",overflow:"hidden" }}>
              <div style={{ flexShrink:0,borderRight:"1px solid "+T.border,background:T.bg }}>
                <div style={{ height:18 }} />
                {[0,1,2,3,4,5].map(r=>{const act=S.sbServing===tm.team&&r===tm.rot;return <div key={r} style={{ width:26,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,borderBottom:"1px solid "+T.border,color:act?"#FFF":T.textTer,background:act?T.navy:"transparent" }}>{["I","II","III","IV","V","VI"][r]}</div>;})}
              </div>
              <div style={{ flexShrink:0,borderRight:"2px solid "+T.navyBorder,width:130 }}>
                <div style={{ height:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:T.textTer,borderBottom:"1px solid "+T.border,textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.08em" }}>Players</div>
                {tm.line.map((pn,ri)=>{
                  const act=S.sbServing===tm.team&&ri===tm.rot;
                  const ph=tm.players[ri]||[]; const cur=ph.length>0?ph[ph.length-1]:pn;
                  return <div key={ri} style={{ display:"flex",alignItems:"center",height:32,borderBottom:"1px solid "+T.border,background:act?T.navyBg:"transparent",padding:"0 6px",overflowX:"auto",whiteSpace:"nowrap" }}>
                    {ph.map((p,pi)=><span key={pi} style={{ display:"inline-flex",alignItems:"center" }}>
                      {pi>0&&<span style={{ fontSize:8,color:T.borderLight,margin:"0 2px" }}>/</span>}
                      <span onClick={()=>{if(p===cur){setSubModal({team:tm.team,position:ri,playerOut:p});setSubOut(p);}}} style={{ fontSize:12,fontWeight:800,cursor:p===cur?"pointer":"default",color:p!==cur?T.borderLight:act?T.navy:T.text,textDecoration:p!==cur?"line-through":"none" }}>{p}</span>
                    </span>)}
                  </div>;
                })}
                {tm.lib&&<div style={{ height:22,display:"flex",alignItems:"center",padding:"0 6px",background:T.liberoBg }}><span style={{ fontSize:9,fontWeight:800,color:T.libero }}>LIB #{tm.lib}</span></div>}
              </div>
              <div style={{ flex:1,borderRight:"2px solid "+T.navyBorder,overflowX:"auto" }}>
                {(()=>{const cols=Math.max(maxCols,...tm.grid.map(r=>r.length+2));return <>
                  <div style={{ display:"flex",borderBottom:"1px solid "+T.border,height:18,background:T.bg }}>
                    {Array.from({length:cols},(_,i)=><div key={i} style={{ width:26,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:T.text,fontWeight:700,borderRight:"1px solid "+T.border }}>{i+1}</div>)}
                  </div>
                  {tm.line.map((_,ri)=>{
                    const act=S.sbServing===tm.team&&ri===tm.rot;
                    const rd2=tm.grid[ri]||[],rc=tm.circled[ri]||[];
                    return <div key={ri} style={{ display:"flex",height:32,background:act?T.navyBg:"transparent",borderBottom:"1px solid "+T.border }}>
                      {Array.from({length:cols},(_,ci)=>{
                        const v=rd2[ci],has=v!==undefined,cir=rc.includes(ci),isSub=v==="S";
                        return <div key={ci} onClick={()=>{if(has&&!isSub)D({t:"sbCircle",team:tm.team,row:ri,col:ci});}} style={{ width:26,flexShrink:0,height:32,display:"flex",alignItems:"center",justifyContent:"center",borderRight:"1px solid "+T.border,cursor:has&&!isSub?"pointer":"default" }}>
                          {has&&isSub&&<div style={{ width:20,height:20,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:T.libero,background:T.liberoBg }}>S</div>}
                          {has&&!isSub&&<div style={{ width:20,height:20,borderRadius:cir?99:4,border:cir?"2px solid "+tm.color:"none",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:cir?tm.color:T.text,background:cir?tm.colorLight:"transparent" }}>{v}</div>}
                        </div>;
                      })}
                    </div>;
                  })}
                </>})()}
              </div>
              <div style={{ flexShrink:0 }}>
                <div style={{ fontSize:7,fontWeight:700,color:T.textTer,textAlign:"center",borderBottom:"1px solid "+T.border,height:18,display:"flex",alignItems:"center",justifyContent:"center",background:T.bg,textTransform:"uppercase",fontFamily:FL }}>Pts</div>
                <div style={{ display:"flex" }}>
                  {rallyNums.map((col,ci)=><div key={ci} style={{ borderRight:ci<2?"1px solid "+T.border:"none" }}>
                    {col.map(n=>{
                      if (n>tm.score) return <div key={n} style={{ width:24,height:17,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:T.border,borderBottom:"1px solid "+T.border }}>{n}</div>;
                      const en=S.sbPointLog.find(p=>(tm.team==="home"?p.homeScore:p.awayScore)===n&&p.team===tm.team);
                      const so=en&&en.sideout;
                      return <div key={n} style={{ width:24,height:17,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",borderBottom:"1px solid "+T.border }}>
                        {so?<div style={{ width:15,height:15,borderRadius:99,border:"2px solid "+tm.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:tm.color }}>{n}</div>
                        :<><span style={{ color:tm.color,fontSize:10,fontWeight:800 }}>{n}</span><div style={{ position:"absolute",top:"50%",left:3,right:3,height:1.5,background:tm.color,transform:"rotate(-25deg)" }} /></>}
                      </div>;
                    })}
                  </div>)}
                </div>
              </div>
            </div>
            <div style={{ display:"flex",alignItems:"center",borderTop:"1px solid "+T.border,padding:"5px 10px",background:T.bg }}>
              <span style={{ fontSize:9,fontWeight:700,color:T.textTer,marginRight:6,textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.06em" }}>Subs</span>
              <div style={{ display:"flex",gap:2 }}>{Array.from({length:18},(_,i)=><div key={i} style={{ width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,borderRadius:4,background:i<tm.subs?T.navy:T.surface,color:i<tm.subs?"#FFF":T.border,border:"1px solid "+(i<tm.subs?T.navy:T.border) }}>{i+1}</div>)}</div>
              <span style={{ fontSize:10,fontWeight:800,color:T.navy,marginLeft:8 }}>{tm.subs}/18</span>
            </div>
          </div>
        ))}
      </div>
      {/* Bottom bar with End Set / End Match */}
      <div style={{ padding:"10px 20px",background:T.surface,borderTop:"1px solid "+T.border,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0 }}>
        <div style={{ fontSize:11,color:T.textSec }}>
          {S.sbSetData.length>0 && <span>Sets: {S.sbSetData.filter(s=>s.homeScore>s.awayScore).length}–{S.sbSetData.filter(s=>s.awayScore>s.homeScore).length}</span>}
        </div>
        <div style={{ display:"flex",gap:8 }}>
          <button onClick={()=>D({t:"sbEndSet"})} style={{ padding:"10px 20px",fontSize:12,fontWeight:800,background:T.navy,color:"#FFF",border:"none",borderRadius:10,cursor:"pointer",textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.04em" }}>End Set</button>
          {S.sbSetData.length>0&&<button onClick={()=>{if(confirm("End match?"))D({t:"sbEndMatch"});}} style={{ padding:"10px 20px",fontSize:12,fontWeight:800,background:T.red,color:"#FFF",border:"none",borderRadius:10,cursor:"pointer",textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.04em" }}>End Match</button>}
        </div>
      </div>

      {/* Sub validation flag */}
      {(()=>{
        const flags=[];
        for (const team of ["home","away"]) {
          const subs=S.sbSubLog.filter(s=>s.team===team&&s.set===S.sbSet);
          const pairMap={};
          subs.forEach(s=>{
            if(!pairMap[s.out])pairMap[s.out]=[];
            pairMap[s.out].push(s.playerIn);
          });
          for (const [out,ins] of Object.entries(pairMap)){
            if(ins.length>1){
              const unique=[...new Set(ins)];
              if(unique.length>1) flags.push({team,out,ins:unique});
            }
          }
        }
        if(flags.length===0) return null;
        return <div style={{ position:"fixed",bottom:70,left:"50%",transform:"translateX(-50%)",zIndex:100,background:"#FEF2F2",border:"2px solid #FCA5A5",borderRadius:12,padding:"10px 20px",boxShadow:T.shadowLg,maxWidth:400 }}>
          <div style={{ fontSize:12,fontWeight:800,color:T.red,marginBottom:4 }}>⚠ Illegal Sub Warning</div>
          {flags.map((f,i)=><div key={i} style={{ fontSize:11,color:T.text }}>#{f.out} ({f.team}) was replaced by multiple players: {f.ins.map(n=>"#"+n).join(", ")}</div>)}
        </div>;
      })()}

      {/* Match end popup — triggers when a team has clinched */}
      {(()=>{
        const needed=Math.ceil(S.sbFormat/2);
        const hW=S.sbSetData.filter(s=>s.homeScore>s.awayScore).length;
        const aW=S.sbSetData.filter(s=>s.awayScore>s.homeScore).length;
        if(hW>=needed||aW>=needed) return <div style={{ position:"fixed",inset:0,background:"rgba(13,27,62,0.5)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200 }}>
          <div className="slideup" style={{ background:T.surface,borderRadius:20,padding:32,maxWidth:360,width:"90%",textAlign:"center",boxShadow:T.shadowLg }}>
            <div style={{ fontSize:22,fontWeight:800,marginBottom:6 }}>Match Complete!</div>
            <div style={{ fontSize:15,color:T.textSec,marginBottom:8 }}>{hW>=needed?S.sbHomeTeam:S.sbAwayTeam} wins</div>
            <div style={{ fontSize:14,color:T.textTer,marginBottom:24 }}>Sets: {hW}–{aW}</div>
            <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
              <GhostBtn onClick={()=>D({t:"sbNextSet"})}>Continue playing</GhostBtn>
              <PrimaryBtn onClick={()=>D({t:"sbEndMatch"})}>Save & Exit</PrimaryBtn>
            </div>
          </div>
        </div>;
        return null;
      })()}

      {subModal&&(()=>{
        const teamColor=subModal.team==="home"?T.navy:T.red;
        const teamName=subModal.team==="home"?S.sbHomeTeam:S.sbAwayTeam;
        const line=subModal.team==="home"?S.sbHomeLine:S.sbAwayLine;
        const players=subModal.team==="home"?S.sbHomePlayers:S.sbAwayPlayers;
        const posIdx=subModal.position!==undefined?subModal.position:(subOut?line.indexOf(subOut):-1);
        const posHistory=posIdx>=0?(players[posIdx]||[]):[];
        const suggestedIn=posHistory.length>=2?posHistory[posHistory.length-2]:"";
        return <div style={{ position:"fixed",inset:0,background:"rgba(13,27,62,0.5)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200 }} onClick={()=>{setSubModal(null);setSubOut("");setSubIn("");}}>
          <div className="slideup" onClick={e=>e.stopPropagation()} style={{ background:T.surface,borderRadius:20,padding:28,maxWidth:380,width:"92%",boxShadow:T.shadowLg }}>
            <div style={{ textAlign:"center",marginBottom:20 }}>
              <div style={{ fontSize:10,fontWeight:700,color:T.textTer,textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.1em" }}>Substitution</div>
              <div style={{ fontSize:18,fontWeight:800,color:teamColor,marginTop:4 }}>{teamName}</div>
            </div>
            {!subOut?(
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:13,color:T.textSec,textAlign:"center",marginBottom:14 }}>Who's coming out?</div>
                <div style={{ display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center" }}>
                  {line.map((num,idx)=><button key={num} onClick={()=>{setSubModal({...subModal,playerOut:num,position:idx});setSubOut(num);}} style={{ width:56,height:56,borderRadius:12,fontSize:20,fontWeight:800,cursor:"pointer",background:T.bg,border:"2px solid "+T.navy,color:T.navy }}>{num}</button>)}
                </div>
              </div>
            ):(
              <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:24,marginBottom:24 }}>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:10,fontWeight:800,color:T.red,marginBottom:8,textTransform:"uppercase",fontFamily:FL }}>Out</div>
                  <div style={{ width:64,height:64,borderRadius:12,background:T.redBg,border:"3px solid "+T.redBorder,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:800,color:T.red }}>{subOut}</div>
                  <button onClick={()=>{setSubModal({...subModal,playerOut:""});setSubOut("");}} style={{ fontSize:10,color:T.textTer,background:"none",border:"none",cursor:"pointer",marginTop:6,textDecoration:"underline" }}>change</button>
                </div>
                <div style={{ fontSize:26,color:T.border,fontWeight:300 }}>→</div>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:10,fontWeight:800,color:T.green,marginBottom:8,textTransform:"uppercase",fontFamily:FL }}>In</div>
                  <input type="number" value={subIn} onChange={e=>setSubIn(e.target.value)} placeholder="#" style={{ width:64,height:64,borderRadius:12,border:"3px solid "+T.greenBorder,background:T.greenBg,textAlign:"center",fontSize:26,fontWeight:800,color:T.green,outline:"none" }} autoFocus />
                  {suggestedIn&&!subIn&&<button onClick={()=>setSubIn(suggestedIn)} style={{ display:"block",margin:"8px auto 0",fontSize:11,color:T.green,background:T.greenBg,border:"1.5px solid "+T.greenBorder,borderRadius:8,padding:"4px 12px",cursor:"pointer",fontWeight:600 }}>#{suggestedIn} back in</button>}
                </div>
              </div>
            )}
            <div style={{ display:"flex",justifyContent:"center",gap:10 }}>
              <GhostBtn onClick={()=>{setSubModal(null);setSubOut("");setSubIn("");}}>Cancel</GhostBtn>
              <PrimaryBtn disabled={!subOut||!subIn} onClick={()=>{if(subOut&&subIn){D({t:"sbSub",team:subModal.team,out:subOut,playerIn:subIn});setSubModal(null);setSubOut("");setSubIn("");}}}>Confirm</PrimaryBtn>
            </div>
          </div>
        </div>;
      })()}
    </div>
  );
}

/* ─── APP ─── */
/* ─── SEASON STATS ─── */
const SCOLS = [["SA","sa"],["A","a"],["SE","se"],["ATT","att"],["K","k"],["E","e"],["PCT","hp"],["R","r"],["RE","re"],["BS","bs"],["BA","ba"],["BE","be"],["BHA","bha"],["AST","ast"],["BHE","bhe"],["D","d"],["DE","de"]];
const fmtPct = h => (h>=0?"":"-")+"."+Math.abs(h*1000).toFixed(0).padStart(3,"0");
const sumStats = (list) => { const agg={}; list.forEach(s=>{ if(s) Object.keys(s).forEach(k=>agg[k]=(agg[k]||0)+(s[k]||0)); }); return agg; };
const derive = (agg) => calc({ _:agg }, "_");

function SeasonStats({ S, D }) {
  const [tab, setTab] = useState("team");
  const [mode, setMode] = useState("total");
  const [playerNum, setPlayerNum] = useState(null);
  const org = S.orgs.find(o=>o.id===S.currentOrgId);
  const team = org ? org.levels?.flatMap(l=>l.teams).find(t=>t.id===S.currentTeamId) : null;
  const matches = S.matchHistory||[];
  const gp = matches.length;
  const totalSets = matches.reduce((n,m)=>n+(m.sets?.length||0),0);

  const th = (extra) => ({ padding:"8px 6px",fontSize:10,fontWeight:700,color:T.textSec,textAlign:"center",textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.05em",...extra });
  const cellVal = (s,key,dec) => key==="hp" ? (s.att>0?fmtPct(s.hp):"—") : (dec ? (s[key]?s[key].toFixed(1):"—") : (s[key]||"—"));

  const Header = ({ title, sub, onBack }) => (
    <div style={{ background:T.navy,padding:"14px 24px",display:"flex",alignItems:"center",gap:14,flexShrink:0 }}>
      <button onClick={onBack} style={{ display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.1)",border:"none",color:"rgba(255,255,255,0.7)",fontSize:12,fontWeight:600,padding:"7px 13px",borderRadius:8,cursor:"pointer",fontFamily:F }}>
        <Ic n="arrowLeft" size={13} color="rgba(255,255,255,0.7)" sw={2}/> Back
      </button>
      <div>
        <div style={{ fontSize:10,color:"rgba(255,255,255,0.3)",fontWeight:700,textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.12em" }}>{sub}</div>
        <div style={{ fontSize:20,fontWeight:800,color:"#FFF",letterSpacing:"-0.02em" }}>{title}</div>
      </div>
    </div>
  );

  const Empty = () => (
    <div style={{ textAlign:"center",padding:"60px 40px",background:T.surface,borderRadius:16,boxShadow:T.shadowSm }}>
      <div style={{ fontSize:16,fontWeight:700,marginBottom:6,color:T.text }}>No games recorded yet</div>
      <div style={{ fontSize:13,color:T.textSec }}>Track a match with the Stats Tracker and it'll show up here.</div>
    </div>
  );

  /* ── PLAYER DETAIL ── */
  if (playerNum !== null) {
    const p = S.roster.find(r=>r.num===playerNum);
    const played = matches.filter(m=>m.stats&&m.stats[playerNum]);
    const season = derive(sumStats(played.map(m=>m.stats[playerNum])));
    const pSets = played.reduce((n,m)=>n+(m.sets?.length||0),0);
    return (
      <div style={{ display:"flex",flexDirection:"column",height:"100vh",background:T.bg,fontFamily:F,overflow:"hidden" }}>
        <Header title={"#"+playerNum+" "+(p?.name||"")} sub={(p?.pos?p.pos+" · ":"")+played.length+" games · "+pSets+" sets"} onBack={()=>setPlayerNum(null)} />
        <div style={{ flex:1,overflow:"auto",padding:"18px 24px" }}>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:10,marginBottom:20 }}>
            {[["Points",season.pts.toFixed(1),T.accent],["Kills",season.k,T.green],["Hit %",season.att>0?fmtPct(season.hp):"—",season.hp>0.2?T.green:T.navy],["Aces",season.a,T.green],["Assists",season.ast,T.navy],["Digs",season.d,T.gold]].map(([label,val,col])=>(
              <div key={label} style={{ background:T.surface,borderRadius:12,padding:"12px 14px",boxShadow:T.shadowSm }}>
                <div style={{ fontSize:9,fontWeight:700,color:T.textTer,textTransform:"uppercase",fontFamily:FL,letterSpacing:"0.08em",marginBottom:3 }}>{label}</div>
                <div style={{ fontSize:24,fontWeight:800,color:col,letterSpacing:"-0.02em" }}>{val}</div>
              </div>
            ))}
          </div>
          {played.length===0 ? <Empty/> : (
          <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12,background:T.surface,borderRadius:12,overflow:"hidden",boxShadow:T.shadowSm }}>
            <thead><tr style={{ borderBottom:"2px solid "+T.navy }}>
              <th style={th({textAlign:"left"})}>Game</th>
              {SCOLS.map(([h])=><th key={h} style={th()}>{h}</th>)}
            </tr></thead>
            <tbody>
              {played.map((m,i)=>{ const s=derive(m.stats[playerNum]); return (
                <tr key={i} style={{ borderBottom:"1px solid "+T.borderLight }}>
                  <td style={{ padding:"9px 6px",whiteSpace:"nowrap" }}>
                    <div style={{ fontWeight:600,fontSize:12 }}>vs {m.awayTeam===team?.name||m.homeTeam===team?.name?(m.homeTeam===team?.name?m.awayTeam:m.homeTeam):m.awayTeam}</div>
                    <div style={{ fontSize:10,color:T.textTer }}>{m.date}</div>
                  </td>
                  {SCOLS.map(([h,key])=><td key={h} style={{ padding:"9px 6px",textAlign:"center",color:(key==="hp"?s.att>0:s[key]>0)?T.text:T.borderLight }}>{cellVal(s,key)}</td>)}
                </tr>);})}
              <tr style={{ borderTop:"2px solid "+T.navy,background:T.navyBg }}>
                <td style={{ padding:"10px 6px",fontWeight:800,color:T.navy,textTransform:"uppercase",fontFamily:FL,fontSize:11,letterSpacing:"0.06em" }}>Season Total</td>
                {SCOLS.map(([h,key])=><td key={h} style={{ padding:"10px 6px",textAlign:"center",fontWeight:800,color:T.navy }}>{cellVal(season,key)}</td>)}
              </tr>
              <tr style={{ background:T.goldBg }}>
                <td style={{ padding:"10px 6px",fontWeight:800,color:T.gold,textTransform:"uppercase",fontFamily:FL,fontSize:11,letterSpacing:"0.06em" }}>Per Game</td>
                {SCOLS.map(([h,key])=><td key={h} style={{ padding:"10px 6px",textAlign:"center",fontWeight:700,color:T.gold }}>{key==="hp"?(season.att>0?fmtPct(season.hp):"—"):(played.length>0&&season[key]?(season[key]/played.length).toFixed(1):"—")}</td>)}
              </tr>
            </tbody>
          </table>)}
        </div>
      </div>
    );
  }

  /* ── TEAM / PLAYERS ── */
  return (
    <div style={{ display:"flex",flexDirection:"column",height:"100vh",background:T.bg,fontFamily:F,overflow:"hidden" }}>
      <Header title="Season Stats" sub={(team?.name||"Team")+" · "+gp+" games · "+totalSets+" sets"} onBack={()=>D({t:"goHome"})} />
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 24px 0",background:T.surface,borderBottom:"1px solid "+T.border }}>
        <div style={{ display:"flex",gap:2 }}>
          {[["team","By Game"],["players","By Player"]].map(([k,label])=>(
            <button key={k} onClick={()=>setTab(k)} style={{ padding:"10px 20px",fontSize:13,fontWeight:600,borderRadius:"8px 8px 0 0",border:"none",cursor:"pointer",fontFamily:F,background:tab===k?T.bg:"transparent",color:tab===k?T.navy:T.textTer,borderBottom:tab===k?"2px solid "+T.navy:"2px solid transparent" }}>{label}</button>
          ))}
        </div>
        {tab==="players"&&<div style={{ display:"flex",gap:0,borderRadius:8,overflow:"hidden",border:"1px solid "+T.border,marginBottom:8 }}>
          {[["total","Totals"],["avg","Per Game"]].map(([k,label])=>(
            <button key={k} onClick={()=>setMode(k)} style={{ padding:"6px 14px",fontSize:11,fontWeight:700,border:"none",cursor:"pointer",fontFamily:F,background:mode===k?T.navy:"transparent",color:mode===k?"#FFF":T.textSec }}>{label}</button>
          ))}
        </div>}
      </div>

      <div style={{ flex:1,overflow:"auto",padding:"18px 24px" }}>
        {gp===0 ? <Empty/> : tab==="team" ? (
          <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12,background:T.surface,borderRadius:12,overflow:"hidden",boxShadow:T.shadowSm }}>
            <thead><tr style={{ borderBottom:"2px solid "+T.navy }}>
              <th style={th({textAlign:"left"})}>Game</th><th style={th()}>Result</th>
              {SCOLS.map(([h])=><th key={h} style={th()}>{h}</th>)}
            </tr></thead>
            <tbody>
              {matches.map((m,i)=>{ const s=derive(sumStats(Object.values(m.stats||{}))); return (
                <tr key={i} onClick={()=>D({t:"viewMatchDetail",idx:i})} style={{ borderBottom:"1px solid "+T.borderLight,cursor:"pointer" }}>
                  <td style={{ padding:"9px 6px",whiteSpace:"nowrap" }}>
                    <div style={{ fontWeight:600,fontSize:12 }}>{m.homeTeam} vs {m.awayTeam}</div>
                    <div style={{ fontSize:10,color:T.textTer }}>{m.date} · {(m.sets||[]).map(x=>x[0]+"-"+x[1]).join(", ")}</div>
                  </td>
                  <td style={{ padding:"9px 6px",textAlign:"center" }}><span style={{ fontSize:11,fontWeight:800,padding:"3px 9px",borderRadius:99,background:m.won?T.greenBg:T.redBg,color:m.won?T.green:T.red }}>{m.won?"W":"L"}</span></td>
                  {SCOLS.map(([h,key])=><td key={h} style={{ padding:"9px 6px",textAlign:"center",color:(key==="hp"?s.att>0:s[key]>0)?T.text:T.borderLight }}>{cellVal(s,key)}</td>)}
                </tr>);})}
              {(()=>{ const tot=derive(sumStats(matches.flatMap(m=>Object.values(m.stats||{})))); return (<>
                <tr style={{ borderTop:"2px solid "+T.navy,background:T.navyBg }}>
                  <td colSpan={2} style={{ padding:"10px 6px",fontWeight:800,color:T.navy,textTransform:"uppercase",fontFamily:FL,fontSize:11,letterSpacing:"0.06em" }}>Season Total</td>
                  {SCOLS.map(([h,key])=><td key={h} style={{ padding:"10px 6px",textAlign:"center",fontWeight:800,color:T.navy }}>{cellVal(tot,key)}</td>)}
                </tr>
                <tr style={{ background:T.goldBg }}>
                  <td colSpan={2} style={{ padding:"10px 6px",fontWeight:800,color:T.gold,textTransform:"uppercase",fontFamily:FL,fontSize:11,letterSpacing:"0.06em" }}>Per Game Avg</td>
                  {SCOLS.map(([h,key])=><td key={h} style={{ padding:"10px 6px",textAlign:"center",fontWeight:700,color:T.gold }}>{key==="hp"?(tot.att>0?fmtPct(tot.hp):"—"):(tot[key]?(tot[key]/gp).toFixed(1):"—")}</td>)}
                </tr>
              </>);})()}
            </tbody>
          </table>
        ) : (
          <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12,background:T.surface,borderRadius:12,overflow:"hidden",boxShadow:T.shadowSm }}>
            <thead><tr style={{ borderBottom:"2px solid "+T.navy }}>
              <th style={th({textAlign:"left"})}>Player</th><th style={th()}>GP</th>
              {SCOLS.map(([h])=><th key={h} style={th()}>{h}</th>)}
            </tr></thead>
            <tbody>
              {S.roster.map(p=>{
                const played=matches.filter(m=>m.stats&&m.stats[p.num]);
                const s=derive(sumStats(played.map(m=>m.stats[p.num])));
                const n=played.length;
                return (
                <tr key={p.num} onClick={()=>setPlayerNum(p.num)} style={{ borderBottom:"1px solid "+T.borderLight,cursor:"pointer" }}
                  onMouseEnter={e=>e.currentTarget.style.background=T.bgAlt} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"9px 6px",whiteSpace:"nowrap" }}>
                    <span style={{ fontWeight:800,color:p.lib?T.libero:T.navy,marginRight:7 }}>#{p.num}</span>
                    <span style={{ fontWeight:500 }}>{p.name}</span>
                    {p.pos&&<span style={{ fontSize:10,color:T.textTer,marginLeft:6 }}>{p.pos}</span>}
                  </td>
                  <td style={{ padding:"9px 6px",textAlign:"center",color:T.textSec }}>{n||"—"}</td>
                  {SCOLS.map(([h,key])=>(
                    <td key={h} style={{ padding:"9px 6px",textAlign:"center",color:(key==="hp"?s.att>0:s[key]>0)?T.text:T.borderLight }}>
                      {key==="hp" ? (s.att>0?fmtPct(s.hp):"—") : (mode==="avg" ? (n>0&&s[key]?(s[key]/n).toFixed(1):"—") : (s[key]||"—"))}
                    </td>
                  ))}
                </tr>);
              })}
            </tbody>
          </table>
        )}
        {gp>0&&tab==="players"&&<div style={{ fontSize:11,color:T.textTer,marginTop:10,textAlign:"center" }}>Tap any player to see their game-by-game log</div>}
      </div>
    </div>
  );
}

export default function App() {
  const [S, D] = useReducer(rd, init);

  useEffect(()=>{
    if (!document.querySelector('link[href*="Familjen"]')) {
      const l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@400;500;600;700&family=Barlow+Semi+Condensed:wght@500;600;700;800&display=swap';document.head.appendChild(l);
    }
  },[]);

  if (!S.loggedIn) return <AuthFlow S={S} D={D} />;
  if (S.page==="teamHome") return <TeamHome S={S} D={D} />;
  if (S.page==="home") return <Home S={S} D={D} />;
  if (S.page==="match") return <Match S={S} D={D} />;
  if (S.page==="practice") return <Practice S={S} D={D} />;
  if (S.page==="scorebook") return <Scorebook S={S} D={D} />;
  if (S.page==="matchDetail") return <MatchDetail S={S} D={D} />;
  if (S.page==="seasonStats") return <SeasonStats S={S} D={D} />;
  return <Home S={S} D={D} />;
}


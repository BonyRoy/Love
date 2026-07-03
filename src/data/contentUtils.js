export const EMPTY_CONTENT = {
  meta: {
    herName: "",
    yourName: "",
    ourStartDate: "2025-01-01",
    appTitle: "",
    appDescription: "",
  },
  landing: { eyebrow: "", subtitle: "", cta: "" },
  layout: { headerBefore: "", footerBefore: "", moreMenuTitle: "More" },
  daysHero: { greeting: "", subtitle: "", daysLabel: "" },
  navigation: { primary: [], more: [] },
  homeSections: [],
  gamesPage: { title: "", subtitle: "" },
  games: [],
  home: { gameStripLabel: "" },
  secretHeart: { hint: "", final: "", messages: [] },
  storageKeys: {
    bucketList: "ishu-bucket-list",
    catchHeartsHighScore: "ishu-catch-hearts-high-score",
    heartRushHighScore: "ishu-heart-rush-high-score",
  },
  heartRushMessages: [],
  ourSong: { title: "", artist: "", note: "", beatifyUuid: "" },
  timeline: [],
  bucketList: [],
  dailyMessages: [],
  dateIdeas: [],
  moodResponses: {},
  herFavorites: [],
  reasons: [],
  compliments: [],
  openWhen: [],
  loveNotes: [],
  quizQuestions: [],
  wheelPrizes: [],
  memorySymbols: [],
  wouldYouRather: [],
  truths: [],
  dares: [],
  scratchPrizes: [],
};

export function fillTemplates(value, meta) {
  if (typeof value !== "string") return value;
  return value
    .replaceAll("{{herName}}", meta.herName)
    .replaceAll("{{yourName}}", meta.yourName);
}

export function fillDeep(value, meta) {
  if (typeof value === "string") return fillTemplates(value, meta);
  if (Array.isArray(value)) return value.map((item) => fillDeep(item, meta));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [key, fillDeep(val, meta)]),
    );
  }
  return value;
}

export function processContent(raw) {
  const meta = raw.meta ?? {};

  return {
    HER_NAME: meta.herName ?? "",
    YOUR_NAME: meta.yourName ?? "",
    OUR_START_DATE: meta.ourStartDate ?? "",
    APP_TITLE: meta.appTitle ?? "",
    APP_DESCRIPTION: meta.appDescription ?? "",

    landing: fillDeep(raw.landing ?? {}, meta),
    layout: fillDeep(raw.layout ?? {}, meta),
    daysHero: fillDeep(raw.daysHero ?? {}, meta),
    navigation: raw.navigation ?? { primary: [], more: [] },
    homeSections: raw.homeSections ?? [],
    gamesPage: raw.gamesPage ?? {},
    games: raw.games ?? [],
    home: raw.home ?? {},
    secretHeart: fillDeep(raw.secretHeart ?? {}, meta),
    storageKeys: raw.storageKeys ?? {},
    heartRushMessages: raw.heartRushMessages ?? [],

    ourSong: raw.ourSong ?? {},
    timeline: raw.timeline ?? [],
    bucketList: raw.bucketList ?? [],
    dailyMessages: raw.dailyMessages ?? [],
    dateIdeas: raw.dateIdeas ?? [],
    moodResponses: raw.moodResponses ?? {},
    herFavorites: raw.herFavorites ?? [],
    reasons: raw.reasons ?? [],
    compliments: raw.compliments ?? [],
    openWhen: fillDeep(raw.openWhen ?? [], meta),
    loveNotes: raw.loveNotes ?? [],
    quizQuestions: raw.quizQuestions ?? [],
    wheelPrizes: raw.wheelPrizes ?? [],
    memorySymbols: raw.memorySymbols ?? [],
    wouldYouRather: raw.wouldYouRather ?? [],
    truths: raw.truths ?? [],
    dares: raw.dares ?? [],
    scratchPrizes: raw.scratchPrizes ?? [],
  };
}

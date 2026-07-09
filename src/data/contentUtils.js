import { PHOTOS_HOME_CARD, PHOTOS_NAV_ITEM } from "../config/photos";

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

function hasPhotosLink(items) {
  return items.some((item) => item.to === "/photos");
}

function withPhotosNavigation(navigation) {
  const primary = navigation.primary ?? [];
  const more = navigation.more ?? [];
  if (hasPhotosLink([...primary, ...more])) return navigation;
  return { ...navigation, primary, more: [...more, PHOTOS_NAV_ITEM] };
}

function withPhotosHomeSection(homeSections) {
  const hasCard = homeSections.some((section) =>
    section.cards?.some((card) => card.to === "/photos"),
  );
  if (hasCard) return homeSections;

  const sections = homeSections.map((section) => ({
    ...section,
    cards: [...(section.cards ?? [])],
  }));

  const togetherIndex = sections.findIndex((section) => section.title === "Together");
  if (togetherIndex >= 0) {
    sections[togetherIndex].cards.push(PHOTOS_HOME_CARD);
    return sections;
  }

  if (sections.length > 0) {
    sections[0].cards.push(PHOTOS_HOME_CARD);
    return sections;
  }

  return [{ title: "Memories", cards: [PHOTOS_HOME_CARD] }];
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
    navigation: withPhotosNavigation(raw.navigation ?? { primary: [], more: [] }),
    homeSections: withPhotosHomeSection(raw.homeSections ?? []),
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

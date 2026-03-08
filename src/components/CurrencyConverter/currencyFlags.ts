// Comprehensive ISO 4217 currency code to ISO 3166-1 alpha-2 country code mapping
// Lowercase keys for direct API matching.

const currencyToCountryCode: Record<string, string> = {
  // Major currencies
  usd: "us", eur: "eu", gbp: "gb", jpy: "jp", aud: "au", cad: "ca", chf: "ch", cny: "cn",

  // Asia & Middle East
  inr: "in", pkr: "pk", kwd: "kw", aed: "ae", sar: "sa", qar: "qa", bhd: "bh", omr: "om",
  egp: "eg", try: "tr", sgd: "sg", hkd: "hk", krw: "kr", idr: "id", myr: "my", thb: "th",
  vnd: "vn", php: "ph", afn: "af", amd: "am", azn: "az", bdt: "bd", btn: "bt", khr: "kh",
  irr: "ir", iqd: "iq", ils: "il", jod: "jo", kzt: "kz", kgs: "kg", lak: "la",
  lbp: "lb", mvr: "mv", mnt: "mn", mmk: "mm", npr: "np", kpw: "kp", lkr: "lk", syp: "sy",
  twd: "tw", tjs: "tj", tmt: "tm", uzs: "uz", yer: "ye", bnd: "bn", mop: "mo",
  gel: "ge", bam: "ba",

  // Africa
  ngn: "ng", zar: "za", dzd: "dz", aoa: "ao", bif: "bi", bwp: "bw", cve: "cv", xaf: "cm",
  kmf: "km", cdf: "cd", djf: "dj", ern: "er", etb: "et", gmd: "gm", ghs: "gh", gnf: "gn",
  kes: "ke", lsl: "ls", lrd: "lr", lyd: "ly", mga: "mg", mwk: "mw", mru: "mr", mur: "mu",
  mad: "ma", mzn: "mz", nad: "na", rwf: "rw", stn: "st", scr: "sc", sll: "sl", sle: "sl",
  sos: "so", ssp: "ss", sdg: "sd", szl: "sz", tzs: "tz", tnd: "tn", ugx: "ug", zmw: "zm",
  zwl: "zw", zwd: "zw", xof: "sn", zwg: "zw",

  // Europe
  all: "al", bgn: "bg", hrk: "hr", czk: "cz", dkk: "dk", huf: "hu",
  isk: "is", mdl: "md", mkd: "mk", nok: "no", pln: "pl", ron: "ro", rub: "ru", rsd: "rs",
  sek: "se", uah: "ua", byn: "by", ggp: "gg", imp: "im", jep: "je",

  // Americas
  ars: "ar", brl: "br", mxn: "mx", ang: "cw", awg: "aw", bsd: "bs", bbd: "bb", bzd: "bz",
  bmd: "bm", bob: "bo", clp: "cl", cop: "co", crc: "cr", cup: "cu", cuc: "cu", dop: "do",
  xcd: "ag", fkp: "fk", gyd: "gy", htg: "ht", hnl: "hn", jmd: "jm", nio: "ni", pab: "pa",
  pyg: "py", pen: "pe", srd: "sr", ttd: "tt", uyu: "uy", ves: "ve", gtq: "gt", svc: "sv",

  // Oceania
  nzd: "nz", fjd: "fj", pgk: "pg", sbd: "sb", top: "to", vuv: "vu", wst: "ws", tvd: "tv",
  kid: "ki", xpf: "pf",

  // Additional Europe / territories
  gip: "gi", fok: "fo", shp: "sh", kyd: "ky",

  // Legacy / Historical European currencies
  cyp: "cy", eek: "ee", skk: "sk", sit: "si", mtl: "mt", adp: "ad",
  ats: "at", bef: "be", dem: "de", esp: "es", fim: "fi", frf: "fr",
  grd: "gr", iep: "ie", itl: "it", luf: "lu", nlg: "nl", pte: "pt",
  lvl: "lv", ltl: "lt",

  // Precious metals & special (globe/UN flag)
  xau: "un", xag: "un", xpt: "un", xpd: "un", xdr: "un", xts: "un", xxx: "un",

  // Crypto (globe flag)
  btc: "un", eth: "un", ltc: "un", xrp: "un", bch: "un", doge: "un",

  // Other / less common
  clf: "cl", cnh: "cn", std: "st", vef: "ve", xcg: "cw",
};

/**
 * Get the country code for a given currency code (case-insensitive).
 * Falls back to deriving from the first 2 chars of the currency code.
 */
export function getCountryCode(currencyCode: string): string {
  const lower = currencyCode.toLowerCase();
  if (currencyToCountryCode[lower]) {
    return currencyToCountryCode[lower];
  }
  // Fallback: try first 2 chars as country code (works for many currencies like SGD->sg, etc.)
  const guess = lower.substring(0, 2);
  if (/^[a-z]{2}$/.test(guess)) {
    return guess;
  }
  return "un"; // UN flag as ultimate fallback
}

export default currencyToCountryCode;

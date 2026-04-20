const ISO_TO_NAME: Readonly<Record<string, string>> = {
  AO: "Angola",
  AU: "Australia",
  BF: "Burkina Faso",
  BI: "Burundi",
  BJ: "Benin",
  BR: "Brazil",
  BW: "Botswana",
  CA: "Canada",
  CD: "DR Congo",
  CF: "Central African Republic",
  CG: "Republic of the Congo",
  CI: "Côte d'Ivoire",
  CM: "Cameroon",
  CN: "China",
  CV: "Cape Verde",
  DE: "Germany",
  DJ: "Djibouti",
  DZ: "Algeria",
  EG: "Egypt",
  EH: "Western Sahara",
  ER: "Eritrea",
  ET: "Ethiopia",
  FR: "France",
  GA: "Gabon",
  GB: "United Kingdom",
  GH: "Ghana",
  GM: "Gambia",
  GN: "Guinea",
  GQ: "Equatorial Guinea",
  GW: "Guinea-Bissau",
  IN: "India",
  JP: "Japan",
  KE: "Kenya",
  KM: "Comoros",
  LR: "Liberia",
  LS: "Lesotho",
  LY: "Libya",
  MA: "Morocco",
  MG: "Madagascar",
  ML: "Mali",
  MR: "Mauritania",
  MU: "Mauritius",
  MW: "Malawi",
  MZ: "Mozambique",
  NA: "Namibia",
  NE: "Niger",
  NG: "Nigeria",
  RW: "Rwanda",
  SC: "Seychelles",
  SD: "Sudan",
  SL: "Sierra Leone",
  SN: "Senegal",
  SO: "Somalia",
  SS: "South Sudan",
  ST: "São Tomé and Príncipe",
  SZ: "Eswatini",
  TD: "Chad",
  TG: "Togo",
  TN: "Tunisia",
  TZ: "Tanzania",
  UG: "Uganda",
  US: "United States",
  ZA: "South Africa",
  ZM: "Zambia",
  ZW: "Zimbabwe",
};

const ALIASES: Readonly<Record<string, string>> = {
  uk: "GB",
  britain: "GB",
  england: "GB",
  "great britain": "GB",
  "united kingdom": "GB",
  usa: "US",
  america: "US",
  "united states": "US",
  "united states of america": "US",
  "ivory coast": "CI",
  "cote divoire": "CI",
  drc: "CD",
  "dr congo": "CD",
  "democratic republic of congo": "CD",
  "democratic republic of the congo": "CD",
  congo: "CG",
  "republic of congo": "CG",
  "republic of the congo": "CG",
  swaziland: "SZ",
  eswatini: "SZ",
  "cabo verde": "CV",
  "cape verde": "CV",
  "sao tome and principe": "ST",
  "sao tome": "ST",
  "the gambia": "GM",
  "central african republic": "CF",
  car: "CF",
  "south africa": "ZA",
  "south sudan": "SS",
  "western sahara": "EH",
  "sierra leone": "SL",
  "equatorial guinea": "GQ",
  "guinea bissau": "GW",
  "burkina faso": "BF",
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const NAME_TO_ISO: ReadonlyMap<string, string> = (() => {
  const map = new Map<string, string>();
  for (const [code, name] of Object.entries(ISO_TO_NAME)) {
    map.set(normalize(name), code);
  }
  for (const [alias, code] of Object.entries(ALIASES)) {
    map.set(normalize(alias), code);
  }
  return map;
})();

export function nameForCode(code: string): string {
  const upper = code.toUpperCase();
  return ISO_TO_NAME[upper] ?? upper;
}

export function codeForName(name: string): string | undefined {
  const key = normalize(name);
  if (key.length === 0) return undefined;
  return NAME_TO_ISO.get(key);
}

export const UN_LOCODES: Record<string, string> = {
    // China
    "shanghai": "CNSHA",
    "ningbo": "CNNGB",
    "shenzhen": "CNSZX",
    "guangzhou": "CNCAN",
    "qingdao": "CNQDA",
    "tianjin": "CNTXG",
    "xiamen": "CNXMN",
    "dalian": "CNDLC",
    "hong kong": "HKHKG",
    "beijing": "CNBJS",

    // Asia (Other)
    "singapore": "SGSIN",
    "tokyo": "JPTYO",
    "yokohama": "JPYOK",
    "kobe": "JPUKB",
    "osaka": "JPOSA",
    "busan": "KRPUS",
    "ulsan": "KRUSN",
    "incheon": "KRINC",
    "kaohsiung": "TWKHH",
    "keelung": "TWKEL",
    "port klang": "MYPKG",
    "tanjung pelepas": "MYTPP",
    "ho chi minh": "VNSGN",
    "hai phong": "VNHPH",
    "laem chabang": "THLCH",
    "bangkok": "THBKK",
    "nhava sheva": "INNSA",
    "mumbai": "INBOM",
    "chennai": "INMAA",
    "mundra": "INMUN",
    "colombo": "LKCMB",
    "dubai": "AEDXB",
    "jebel ali": "AEJEA",

    // Europe
    "rotterdam": "NLRTM",
    "antwerp": "BEANR",
    "hamburg": "DEHAM",
    "bremerhaven": "DEBRV",
    "felixstowe": "GBFXT",
    "southampton": "GBSOU",
    "london": "GBLON",
    "london gateway": "GBLGP",
    "liverpool": "GBLIV",
    "le havre": "FRLEH",
    "marseille": "FRMRS",
    "valencia": "ESVLC",
    "barcelona": "ESBCN",
    "gecio": "ITGOA", // Genoa
    "genoa": "ITGOA",
    "la spezia": "ITSPE",
    "trieste": "ITTRS",
    "piraeus": "GRPIR",
    "gdansk": "PLGDN",
    "gothenburg": "SEGIC",

    // North America (US/Canada)
    "los angeles": "USLAX",
    "long beach": "USLGB",
    "new york": "USNYC",
    "newark": "USEWR",
    "savannah": "USSAV",
    "houston": "USHOU",
    "norfolk": "USORF",
    "seattle": "USSEA",
    "tacoma": "USTIW",
    "oakland": "USOAK",
    "charleston": "USCHS",
    "miami": "USMIA",
    "jacksonville": "USJAX",
    "vancouver": "CAVAN",
    "prince rupert": "CAPRR",
    "montreal": "CAMTR",
    "toronto": "CATOR",
    "halifax": "CAHAL",

    // South America
    "santos": "BSSX",
    "buenos aires": "ARBUE",
    "callao": "PECLL",
    "san antonio": "CLSAI",
    "cartagena": "COCTG",
    "manzanillo": "MXZLO", // Mexico (Pacific) or Panama? Usually Mexico in this context
    "veracruz": "MXVER",
    "balboa": "PABLB",
    "colon": "PAONX",

    // Oceania
    "sydney": "AUSYD",
    "melbourne": "AUMEL",
    "brisbane": "AUBNE",
    "fremantle": "AUFRE",
    "auckland": "NZAKL",
    "tauranga": "NZTRG",

    // Airports (Common Major Freight Hubs)
    "shanghai pudong": "CNPVG",
    "hong kong intl": "HKHKG",
    "incheon intl": "KRICN",
    "tokyo narita": "JPNRT",
    "dubai intl": "AEDXB",
    "frankfurt": "DEFRA",
    "paris charles de gaulle": "FRCDG",
    "london heathrow": "GBLHR",
    "amsterdam schiphol": "NLAMS",
    "los angeles intl": "USLAX",
    "chicago ohare": "USORD",
    "new york jfk": "USJFK",
    "atlanta hartsfield": "USATL",
    "memphis": "USMEM",
    "miami intl": "USMIA"
};

export function findLocode(query: string): string | null {
    const normalized = query.toLowerCase().trim();

    // 1. Direct match (e.g. "shanghai")
    if (UN_LOCODES[normalized]) {
        return UN_LOCODES[normalized];
    }

    // 2. Contains match (e.g. "shanghai, china" -> matches "shanghai")
    // Only searching keys that are at least 4 chars long to avoid bad partial matches
    const key = Object.keys(UN_LOCODES).find(k => k.length > 3 && normalized.includes(k));
    if (key) {
        return UN_LOCODES[key];
    }

    return null;
}

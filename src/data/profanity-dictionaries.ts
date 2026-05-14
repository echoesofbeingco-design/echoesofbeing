/**
 * Profanity dictionaries for content moderation.
 *
 * Languages covered: English, Hindi, Marathi, Tamil, Telugu,
 * Kannada, Bengali, Gujarati, Malayalam, Punjabi.
 *
 * This is a baseline list. Add terms as needed.
 * Each entry should be the canonical form — the moderation engine
 * normalizes user input before matching (lowercase, leetspeak, repeats).
 *
 * Categories per language:
 * - Slurs / hate speech
 * - Obscenity / vulgar abuse
 * - Self-harm encouragement
 * - Threats / violence
 * - Sexual harassment terms
 */

export const profanityDictionaries: Record<string, string[]> = {
  en: [
    // Obscenity
    "fuck", "shit", "ass", "asshole", "bitch", "bastard", "dick", "cock",
    "pussy", "cunt", "damn", "whore", "slut", "motherfucker", "bullshit",
    "piss", "crap", "douche", "wanker", "twat", "prick",
    // Slurs
    "nigger", "nigga", "faggot", "fag", "retard", "retarded", "tranny",
    "chink", "spic", "kike", "wetback", "cracker",
    // Hate / violence
    "kill yourself", "kys", "go die", "neck yourself", "hang yourself",
    "end yourself", "you should die",
    // Threats
    "i will kill", "kill you", "rape you", "beat you",
    // Harassment
    "send nudes", "show bobs", "show vagene",
  ],

  hi: [
    // Hindi — obscenity & abuse
    "मादरचोद", "भोसडीके", "चूतिया", "गांड", "लौड़ा", "लंड", "रंडी",
    "हरामी", "कमीना", "कुत्ता", "कुतिया", "साला", "सूअर", "भड़वा",
    "चूत", "टट्टी", "गधा", "उल्लू", "बकचोद", "झाटू", "लौड़े",
    "भोसड़ी", "मक्कार", "बहनचोद", "गांडू", "चटोरा",
    // Romanized Hindi
    "madarchod", "bhosdi", "bhosadike", "chutiya", "gaand", "lauda",
    "lund", "randi", "harami", "kamina", "kutti", "kutta", "suar",
    "bhadwa", "chut", "bakchod", "jhaatu", "behenchod", "gandu",
    "mc", "bc",
    // Violence / harm
    "mar ja", "mar jaa", "मर जा",
  ],

  mr: [
    // Marathi
    "झवाड्या", "भोसडीच्या", "आईझवाड्या", "रांडेच्या", "मादरचोद",
    "चूतिया", "गांड", "बायको झव",
    // Romanized
    "zavadya", "bhosadichya", "aaizavadya", "randechya",
  ],

  ta: [
    // Tamil
    "ஒத்த", "தேவடியா", "ஊம்பு", "புண்டை", "சுன்னி", "கூதி",
    "லவடா", "தாயோளி", "போடா", "மயிரு",
    // Romanized
    "otha", "thevadiya", "oombu", "pundai", "sunni", "koothi",
    "lavada", "thayoli", "poda", "mayiru",
  ],

  te: [
    // Telugu
    "లంజ", "దెంగు", "పూకు", "మొడ్డ", "లవడ", "దొమ్మ",
    // Romanized
    "lanja", "dengu", "pooku", "modda", "lavada", "dommari",
  ],

  kn: [
    // Kannada
    "ಸೂಳೆ", "ಮಗನೆ", "ಬೋಳಿ", "ತುಣ್ಣೆ", "ಗೂತಿ",
    // Romanized
    "sule", "magane", "boli", "tunne", "goothi",
  ],

  bn: [
    // Bengali
    "শালা", "খানকি", "মাগী", "বাল", "চোদা", "ভোদা", "হারামি",
    "গু", "ধন", "বোকাচোদা",
    // Romanized
    "shala", "khanki", "magi", "bal", "choda", "bhoda",
    "harami", "bokachoda",
  ],

  gu: [
    // Gujarati
    "ભોસડી", "ચૂતિયો", "ગાંડુ", "લોડો", "રાંડ",
    // Romanized
    "bhosdi", "chutiyo", "gandu", "lodo", "raand",
  ],

  ml: [
    // Malayalam
    "മൈരേ", "പൂറി", "തായോളി", "കുണ്ണ", "കൂതി",
    // Romanized
    "maire", "poori", "thayoli", "kunna", "koothi",
  ],

  pa: [
    // Punjabi
    "ਪੈਂਚੋ", "ਕੁੱਤੀ", "ਭੋਸੜੀ", "ਗਾਂਡੂ", "ਚੂਤੀਆ",
    // Romanized
    "paincho", "kutti", "bhosdi", "gandu", "chutiya",
  ],
};

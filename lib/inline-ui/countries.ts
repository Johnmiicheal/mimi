export interface Country {
  code: string;
  name: string;
  popular?: boolean;
}

/** Top travel destinations shown first in CountryPicker. */
export const POPULAR_COUNTRIES: Country[] = [
  { code: "JP", name: "Japan",            popular: true },
  { code: "FR", name: "France",           popular: true },
  { code: "IT", name: "Italy",            popular: true },
  { code: "TH", name: "Thailand",         popular: true },
  { code: "ES", name: "Spain",            popular: true },
  { code: "GR", name: "Greece",           popular: true },
  { code: "ID", name: "Bali / Indonesia", popular: true },
  { code: "GB", name: "United Kingdom",   popular: true },
  { code: "TR", name: "Turkey",           popular: true },
  { code: "PT", name: "Portugal",         popular: true },
  { code: "AE", name: "UAE",              popular: true },
  { code: "MX", name: "Mexico",           popular: true },
  { code: "AU", name: "Australia",        popular: true },
  { code: "SG", name: "Singapore",        popular: true },
  { code: "MA", name: "Morocco",          popular: true },
];

/** Full alphabetical list (non-popular entries). */
export const ALL_COUNTRIES: Country[] = [
  { code: "AR", name: "Argentina"         },
  { code: "AT", name: "Austria"           },
  { code: "BE", name: "Belgium"           },
  { code: "BR", name: "Brazil"            },
  { code: "KH", name: "Cambodia"          },
  { code: "CA", name: "Canada"            },
  { code: "CL", name: "Chile"             },
  { code: "CN", name: "China"             },
  { code: "CO", name: "Colombia"          },
  { code: "CR", name: "Costa Rica"        },
  { code: "HR", name: "Croatia"           },
  { code: "CZ", name: "Czech Republic"    },
  { code: "DK", name: "Denmark"           },
  { code: "DO", name: "Dominican Republic"},
  { code: "EG", name: "Egypt"             },
  { code: "EE", name: "Estonia"           },
  { code: "FI", name: "Finland"           },
  { code: "DE", name: "Germany"           },
  { code: "HU", name: "Hungary"           },
  { code: "IS", name: "Iceland"           },
  { code: "IN", name: "India"             },
  { code: "IE", name: "Ireland"           },
  { code: "IL", name: "Israel"            },
  { code: "JM", name: "Jamaica"           },
  { code: "JO", name: "Jordan"            },
  { code: "KE", name: "Kenya"             },
  { code: "KR", name: "South Korea"       },
  { code: "LV", name: "Latvia"            },
  { code: "LB", name: "Lebanon"           },
  { code: "LT", name: "Lithuania"         },
  { code: "MY", name: "Malaysia"          },
  { code: "MV", name: "Maldives"          },
  { code: "MT", name: "Malta"             },
  { code: "MU", name: "Mauritius"         },
  { code: "NL", name: "Netherlands"       },
  { code: "NZ", name: "New Zealand"       },
  { code: "NO", name: "Norway"            },
  { code: "OM", name: "Oman"              },
  { code: "PA", name: "Panama"            },
  { code: "PE", name: "Peru"              },
  { code: "PH", name: "Philippines"       },
  { code: "PL", name: "Poland"            },
  { code: "QA", name: "Qatar"             },
  { code: "RO", name: "Romania"           },
  { code: "SA", name: "Saudi Arabia"      },
  { code: "RS", name: "Serbia"            },
  { code: "SK", name: "Slovakia"          },
  { code: "SI", name: "Slovenia"          },
  { code: "ZA", name: "South Africa"      },
  { code: "SE", name: "Sweden"            },
  { code: "CH", name: "Switzerland"       },
  { code: "TW", name: "Taiwan"            },
  { code: "TZ", name: "Tanzania"          },
  { code: "US", name: "United States"     },
  { code: "UY", name: "Uruguay"           },
  { code: "VN", name: "Vietnam"           },
];

export const COUNTRIES: Country[] = [...POPULAR_COUNTRIES, ...ALL_COUNTRIES];

/** Fast O(1) lookup by ISO-2 code. */
export const COUNTRY_BY_CODE: Record<string, Country> = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, c])
);

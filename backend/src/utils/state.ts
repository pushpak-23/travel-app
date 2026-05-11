const CANONICAL_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

const STATE_ALIASES: Record<string, string> = {
  maharastra: 'Maharashtra',
  maharshtra: 'Maharashtra',
  maharashtra: 'Maharashtra',
  'nct of delhi': 'Delhi',
  orissa: 'Odisha',
  uttrakhand: 'Uttarakhand',
};

const CANONICAL_STATE_LOOKUP = new Map(
  CANONICAL_STATES.map((state) => [state.toLowerCase(), state])
);

export const normalizeStateName = (value?: string | null): string => {
  const cleaned = (value || '').trim().toLowerCase().replace(/\s+/g, ' ');
  if (!cleaned) {
    return '';
  }

  if (STATE_ALIASES[cleaned]) {
    return STATE_ALIASES[cleaned];
  }

  if (CANONICAL_STATE_LOOKUP.has(cleaned)) {
    return CANONICAL_STATE_LOOKUP.get(cleaned) || '';
  }

  return '';
};

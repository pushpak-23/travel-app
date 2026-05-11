const STATE_ALIASES: Record<string, string> = {
  maharastra: 'Maharashtra',
  maharshtra: 'Maharashtra',
  maharashtra: 'Maharashtra',
};

export const normalizeStateName = (value?: string | null): string => {
  const cleaned = (value || '').trim().toLowerCase().replace(/\s+/g, ' ');
  if (!cleaned) {
    return '';
  }

  if (STATE_ALIASES[cleaned]) {
    return STATE_ALIASES[cleaned];
  }

  return cleaned
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

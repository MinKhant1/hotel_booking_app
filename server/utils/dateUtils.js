/** UTC date-only semantics: YYYY-MM-DD parsed as noon UTC. */

const MIN_YEAR = 2000;
const MAX_YEAR = 2100;

export function parseYmdToUtcNoon(ymd) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(ymd).trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(Date.UTC(y, mo - 1, d, 12, 0, 0, 0));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) {
    return null;
  }
  return dt;
}

export function isJune2025Utc(dt) {
  return dt.getUTCFullYear() === 2025 && dt.getUTCMonth() === 5;
}

/**
 * Validates and dedupes YYYY-MM-DD strings; each must be a real calendar day with year in [MIN_YEAR, MAX_YEAR].
 */
export function assertValidDates(dates) {
  if (!Array.isArray(dates) || dates.length === 0) {
    const err = new Error('dates must be a non-empty array of YYYY-MM-DD strings');
    err.status = 400;
    throw err;
  }
  const normalized = [];
  const seen = new Set();
  for (const raw of dates) {
    const dt = parseYmdToUtcNoon(raw);
    if (!dt) {
      const err = new Error(`Invalid date: ${raw}. Use YYYY-MM-DD.`);
      err.status = 400;
      throw err;
    }
    const y = dt.getUTCFullYear();
    if (y < MIN_YEAR || y > MAX_YEAR) {
      const err = new Error(`Year must be between ${MIN_YEAR} and ${MAX_YEAR}: ${raw}`);
      err.status = 400;
      throw err;
    }
    const key = dt.toISOString().slice(0, 10);
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(dt);
  }
  if (normalized.length === 0) {
    const err = new Error('No valid dates provided');
    err.status = 400;
    throw err;
  }
  return normalized;
}

/** @deprecated use assertValidDates */
export function assertJune2025Dates(dates) {
  return assertValidDates(dates);
}

export function normalizeQueryDates(dateParam, datesParam) {
  if (datesParam) {
    const parts = String(datesParam)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return assertValidDates(parts);
  }
  if (dateParam) {
    return assertValidDates([dateParam]);
  }
  const err = new Error('Provide date=YYYY-MM-DD or dates=YYYY-MM-DD,YYYY-MM-DD');
  err.status = 400;
  throw err;
}

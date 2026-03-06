/**
 * Heuristics for matching PRD items with code patterns
 */

/**
 * Normalize string: lowercase, remove accents, trim
 */
export function normalizeString(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .trim();
}

/**
 * Calculate Levenshtein distance between two strings
 * Measures minimum number of single-character edits (insert, delete, replace)
 */
export function levenshteinDistance(s1: string, s2: string): number {
  const n1 = s1.length;
  const n2 = s2.length;

  // Create DP table
  const dp: number[][] = Array(n1 + 1)
    .fill(null)
    .map(() => Array(n2 + 1).fill(0));

  // Initialize base cases
  for (let i = 0; i <= n1; i++) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= n2; j++) {
    dp[0][j] = j;
  }

  // Fill DP table
  for (let i = 1; i <= n1; i++) {
    for (let j = 1; j <= n2; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[n1][n2];
}

/**
 * Score exact match (case-insensitive, accent-insensitive)
 */
export function scoreExactMatch(prdItem: string, codeItem: string): number {
  const norm1 = normalizeString(prdItem);
  const norm2 = normalizeString(codeItem);
  return norm1 === norm2 ? 100 : 0;
}

/**
 * Score substring match
 * e.g., "user" is contained in "createUser" → 80
 */
export function scoreSubstringMatch(prdItem: string, codeItem: string): number {
  const norm1 = normalizeString(prdItem);
  const norm2 = normalizeString(codeItem);

  // Check if prdItem is substring of codeItem
  if (norm2.includes(norm1) || norm1.includes(norm2)) {
    return 80;
  }

  return 0;
}

/**
 * Score fuzzy match using Levenshtein distance
 * Distance < 3 → score 60-75 depending on length
 */
export function scoreFuzzyMatch(prdItem: string, codeItem: string): number {
  const norm1 = normalizeString(prdItem);
  const norm2 = normalizeString(codeItem);

  // Only consider if similar length (within 50%)
  const lenRatio = Math.max(norm1.length, norm2.length) / Math.min(norm1.length, norm2.length);
  if (lenRatio > 1.5) {
    return 0;
  }

  const distance = levenshteinDistance(norm1, norm2);
  const maxLen = Math.max(norm1.length, norm2.length);

  // If distance is less than 30% of max length, it's a fuzzy match
  if (distance < maxLen * 0.3) {
    // Closer = higher score (60-75)
    const similarity = 1 - distance / maxLen;
    return Math.round(60 + similarity * 15);
  }

  return 0;
}

/**
 * Pattern matching using regex
 * Common patterns: auth, user, login, password, api, database, etc.
 */
const PATTERN_MAP: Record<string, RegExp[]> = {
  authentication: [/auth/, /login/, /signin/, /credential/],
  user: [/user/, /account/, /profile/, /member/],
  payment: [/payment/, /checkout/, /transaction/, /billing/, /purchase/],
  notification: [/notification/, /alert/, /email/, /sms/, /message/],
  upload: [/upload/, /file/, /attachment/, /media/, /storage/],
  dashboard: [/dashboard/, /panel/, /admin/, /home/, /landing/],
  api: [/api/, /endpoint/, /request/, /response/, /route/],
  database: [/database/, /db/, /query/, /model/, /schema/],
  cache: [/cache/, /redis/, /memory/, /store/],
  security: [/security/, /ssl/, /encrypt/, /hash/, /token/],
};

/**
 * Score pattern match
 * If both prdItem and codeItem match similar patterns → 70
 */
export function scorePatternMatch(prdItem: string, codeItem: string): number {
  const norm1 = normalizeString(prdItem);
  const norm2 = normalizeString(codeItem);

  // Find matching patterns for prdItem and codeItem
  const prdPatterns = Object.entries(PATTERN_MAP)
    .filter(([_, regexes]) => regexes.some((r) => r.test(norm1)))
    .map(([key]) => key);

  const codePatterns = Object.entries(PATTERN_MAP)
    .filter(([_, regexes]) => regexes.some((r) => r.test(norm2)))
    .map(([key]) => key);

  // If they share any pattern, it's a match
  const sharedPatterns = prdPatterns.filter((p) => codePatterns.includes(p));
  if (sharedPatterns.length > 0) {
    return 70;
  }

  return 0;
}

/**
 * Main scoring function: combines all heuristics
 * Returns maximum score from all matching strategies
 */
export function scoreMatch(prdItem: string, codeItem: string): number {
  const scores = [
    scoreExactMatch(prdItem, codeItem),
    scoreSubstringMatch(prdItem, codeItem),
    scoreFuzzyMatch(prdItem, codeItem),
    scorePatternMatch(prdItem, codeItem),
  ];

  return Math.max(...scores);
}

/**
 * Batch score matching for multiple items
 */
export function scoreMatches(
  prdItems: string[],
  codeItems: string[]
): Array<{ prdItem: string; codeItem: string; score: number }> {
  const results = [];

  for (const prdItem of prdItems) {
    for (const codeItem of codeItems) {
      const score = scoreMatch(prdItem, codeItem);
      if (score > 0) {
        results.push({ prdItem, codeItem, score });
      }
    }
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score);
}

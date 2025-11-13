// src/utils/GenreService.js
// Maps numeric genre IDs to human-readable names from data.js

import { genres } from "../data.js";

/**
 * Resolve genre IDs to human-readable names.
 * Accepts an array of numbers (ids). Returns an array of strings (names).
 */
export const GenreService = {
  getNames(ids = []) {
    if (!Array.isArray(ids)) return [];
    const byId = new Map(genres.map(g => [g.id, g.title]));
    return ids
      .map(id => byId.get(id))
      .filter(Boolean);
  },
};

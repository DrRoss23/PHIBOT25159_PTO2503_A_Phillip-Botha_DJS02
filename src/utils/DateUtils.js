// src/utils/DateUtils.js
// Provides a consistent, human-readable “Updated …” label.

export const DateUtils = {
  /**
   * Formats a date string into "Updated Month Day, Year".
   * Returns empty string if input is invalid.
   * @param {string} dateStr
   * @returns {string}
   */
  format(dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date)) return "";
    return `Updated ${date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`;
  },
};

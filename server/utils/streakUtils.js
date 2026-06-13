/**
 * Utilities for managing the learning streak on a User document.
 * Requirements: 8.4, 8.5
 */

/**
 * Returns the absolute difference in UTC calendar days between two Date values.
 * Time components are ignored — only the date portion (year/month/day in UTC) matters.
 *
 * @param {Date} dateA
 * @param {Date} dateB
 * @returns {number} Non-negative integer number of calendar days between the two dates.
 */
function utcDayDiff(dateA, dateB) {
  // Truncate each date to midnight UTC to strip the time component.
  const msA = Date.UTC(
    dateA.getUTCFullYear(),
    dateA.getUTCMonth(),
    dateA.getUTCDate()
  );
  const msB = Date.UTC(
    dateB.getUTCFullYear(),
    dateB.getUTCMonth(),
    dateB.getUTCDate()
  );
  return Math.abs(Math.round((msA - msB) / 86400000));
}

/**
 * Mutates the user object to update the learning streak based on the given
 * completion date (UTC). Does NOT call user.save() — the caller is responsible
 * for persisting the change.
 *
 * Rules (requirement 8.4 / 8.5):
 *  - lastActivityDate is null  → streak = 1, set lastActivityDate
 *  - day diff === 1            → streak++, update lastActivityDate
 *  - day diff > 1              → streak = 1, update lastActivityDate
 *  - day diff === 0            → no change (same day, already counted)
 *
 * @param {object} user                  Mongoose User document (or plain object with the same fields)
 * @param {Date}   completionDateUtc     The UTC date on which the Module_Step was completed
 */
function updateStreak(user, completionDateUtc) {
  if (!user.lastActivityDate) {
    // First recorded activity — start the streak.
    user.learningStreak = 1;
    user.lastActivityDate = completionDateUtc;
    return;
  }

  const dayDiff = utcDayDiff(completionDateUtc, new Date(user.lastActivityDate));

  if (dayDiff === 1) {
    // Consecutive day — extend the streak.
    user.learningStreak = (user.learningStreak || 0) + 1;
    user.lastActivityDate = completionDateUtc;
  } else if (dayDiff > 1) {
    // Gap detected — reset streak to 1 (counting the current day).
    user.learningStreak = 1;
    user.lastActivityDate = completionDateUtc;
  }
  // dayDiff === 0: same day, do nothing.
}

module.exports = { utcDayDiff, updateStreak };

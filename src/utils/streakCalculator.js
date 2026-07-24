export function calculateStreak(completionDates) {
  if (!completionDates || completionDates.length === 0) return 0;

  const sorted = [...completionDates].sort((a, b) => new Date(b) - new Date(a));

  let streak = 0;
  let current = new Date();
  current.setHours(0, 0, 0, 0);

  for (let i = 0; i < sorted.length; i++) {
    const date = new Date(sorted[i]);
    date.setHours(0, 0, 0, 0);

    const diff = (current - date) / (1000 * 60 * 60 * 24);

    if (diff === 0 || diff === 1) {
      streak++;
      current = date;
    } else {
      break;
    }
  }

  return streak;
}
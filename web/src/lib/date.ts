import { Temporal } from 'temporal-polyfill';

export const formatTimeAgo = (isoDateString: string): string => {
  const now = Temporal.Instant.from(Temporal.Now.instant().toString());
  const then = Temporal.Instant.from(new Date(isoDateString).toISOString());

  const duration = now.until(then);

  if (duration.years !== 0) {
    return `${-duration.years} years ago`;
  }
  if (duration.months !== 0) {
    return `${-duration.months} months ago`;
  }
  if (duration.days !== 0) {
    return `${-duration.days} days ago`;
  }
  if (duration.hours !== 0) {
    return `${-duration.hours} hrs ago`;
  }
  if (duration.minutes !== 0) {
    return `${-duration.minutes} mins ago`;
  }
  return 'Just now';
};

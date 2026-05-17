export function formatDueTime(
    dueAt?: number
  ) {
    if (!dueAt) return null;
  
    const now = Date.now();
  
    const diff =
      dueAt - now;
  
    const minute =
      1000 * 60;
  
    const hour =
      minute * 60;
  
    const day =
      hour * 24;
  
    // PAST
    if (diff < 0) {
      return 'Passed';
    }
  
    // < 1h
    if (diff < hour) {
      const mins = Math.round(
        diff / minute
      );
  
      return `${mins}m`;
    }
  
    // TODAY
    if (diff < day) {
      const hours = Math.round(
        diff / hour
      );
  
      return `${hours}h`;
    }
  
    // TOMORROW+
    const days = Math.round(
      diff / day
    );
  
    return `${days}d`;
  }
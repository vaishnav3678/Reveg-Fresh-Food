/**
 * RevEg Fresh Foods - Centralized Real-time Website Synchronization Utility
 * Dispatches window events and BroadcastChannel messages across tabs and components
 * to trigger zero-delay UI re-renders whenever admin content changes.
 */

export const REVEG_SYNC_EVENT = 'reveg_sync_event';
export const REVEG_SYNC_CHANNEL = 'reveg_sync_channel';

export const triggerSiteSync = (source: string = 'admin') => {
  if (typeof window === 'undefined') return;

  // 1. Dispatch custom DOM event in current window
  try {
    const event = new CustomEvent(REVEG_SYNC_EVENT, {
      detail: { source, timestamp: Date.now() },
    });
    window.dispatchEvent(event);
  } catch {
    window.dispatchEvent(new Event(REVEG_SYNC_EVENT));
  }

  // 2. Broadcast to other tabs or iframes if supported
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const channel = new BroadcastChannel(REVEG_SYNC_CHANNEL);
      channel.postMessage({ type: 'CONTENT_UPDATED', source, timestamp: Date.now() });
      channel.close();
    } catch (e) {
      // Ignore BroadcastChannel errors in restrictive environments
    }
  }

  // 3. Update localStorage timestamp as an additional cross-tab fallback
  try {
    localStorage.setItem('reveg_last_sync_timestamp', String(Date.now()));
  } catch {}
};

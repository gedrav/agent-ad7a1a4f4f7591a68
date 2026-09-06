import { fetchEventSource } from '@microsoft/fetch-event-source';

const MIN_RETRY_MS = 1000;
const MAX_RETRY_MS = 30000;

class RealtimeConnectionService {
  private retryDelay = MIN_RETRY_MS;

  connect(sessionToken: string): void {
    const baseUrl = import.meta.env.VITE_REALTIME_URL;
    if (!baseUrl || !sessionToken) {
      console.log('[realtime] skipping connect - missing VITE_REALTIME_URL or session token');
      return;
    }

    fetchEventSource(`${baseUrl}/sse/balance`, {
      headers: { Authorization: `Bearer ${sessionToken}` },
      openWhenHidden: true,
      onopen: async (response) => {
        this.retryDelay = MIN_RETRY_MS;
        if (!response.ok) {
          console.log('[realtime] connection rejected', response.status);
        }
      },
      onmessage(msg) {
        console.log('[realtime]', msg.event, msg.data);
      },
      onerror: (err) => {
        console.log('[realtime] connection error, retrying', err);
        const delay = this.retryDelay;
        this.retryDelay = Math.min(this.retryDelay * 2, MAX_RETRY_MS);
        return delay;
      },
    });
  }
}

export const RealtimeConnection = new RealtimeConnectionService();

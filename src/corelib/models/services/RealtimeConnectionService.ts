import { fetchEventSource } from '@microsoft/fetch-event-source';

class RealtimeConnectionService {
  connect(sessionToken: string): void {
    fetchEventSource(`${import.meta.env.VITE_REALTIME_URL}/sse/balance`, {
      headers: { Authorization: `Bearer ${sessionToken}` },
      onmessage(msg) {
        console.log('[realtime]', msg.event, msg.data);
      },
      onerror(err) {
        console.log('[realtime] connection error', err);
      },
    });
  }
}

export const RealtimeConnection = new RealtimeConnectionService();

import { fetchEventSource } from '@microsoft/fetch-event-source';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';

const MIN_RETRY_MS = 1000;
const MAX_RETRY_MS = 30000;

interface BalanceUpdatedData {
  playerId: string;
  balance: number;
  currency: string;
  ts: number;
}

interface EventResponse {
  event: string;
  data: string;
}

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
        //console.log('[realtime]', msg.event, msg.data);
        if (msg.event) {
          const parsedData: BalanceUpdatedData = JSON.parse(msg.data);
          EventHandler.dispatchEvent(SlotEvents.REALTIME_BALANCE_UPDATE, { event: msg.event, data: parsedData });
        }
        if (msg.event) {
        }
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

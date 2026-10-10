import { fetchEventSource } from '@microsoft/fetch-event-source';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { JackpotMetersMessage, JackpotPoolChangedMessage, JackpotWonMessage } from '@core/models/jackpot.types';

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
  private isConnected = false;
  private abortController?: AbortController;
  private watchdogTimer?: number;
  private sessionToken?: string;
  private listenersRegistered = false;
  private readonly HEARTBEAT_TIMEOUT_MS = 45000; // ~2x the 20s server heartbeat + buffer

  connect(sessionToken: string): void {
    const baseUrl = import.meta.env.VITE_REALTIME_URL;
    if (!baseUrl || !sessionToken) {
      console.log('[realtime] skipping connect - missing VITE_REALTIME_URL or session token');
      return;
    }

    this.sessionToken = sessionToken;
    this.abortController = new AbortController();

    if (!this.listenersRegistered) {
      window.addEventListener('offline', this.handleOffline);
      window.addEventListener('online', this.handleOnline);
      this.listenersRegistered = true;
    }

    fetchEventSource(`${baseUrl}/sse/events?jp=1`, {
      headers: { Authorization: `Bearer ${sessionToken}` },
      openWhenHidden: true,
      signal: this.abortController.signal,
      onopen: async (response) => {
        // console.log('[realtime] connection opened');
        this.retryDelay = MIN_RETRY_MS;
        if (!response.ok) {
          console.log('[realtime] connection rejected', response.status);
          return;
        }
        this.markConnected();
        this.resetWatchdog();
      },
      onmessage: (msg) => {
        this.resetWatchdog();
        // console.log('[realtime]', msg.event, msg.data);
        if (msg.event && msg.data) {
          this.routeMessage(msg.event, JSON.parse(msg.data));
        }
      },
      onclose: () => {
        // console.log('[realtime] connection closed by server');
        this.markDisconnected();
      },
      onerror: (err) => {
        console.log('[realtime] connection error, retrying', err);
        this.markDisconnected();
        const delay = this.retryDelay;
        this.retryDelay = Math.min(this.retryDelay * 2, MAX_RETRY_MS);
        return delay;
      },
    });
  }

  private routeMessage(event: string, data: any): void {
    //console.log('route msg -- ', event, data);
    switch (event) {
      case 'balance_updated':
        EventHandler.dispatchEvent(SlotEvents.REALTIME_BALANCE_UPDATE, { event, data: data as BalanceUpdatedData });
        break;
      case 'jackpot_meters': {
        const meters = data as JackpotMetersMessage;
        const info = appModel.jackpotInfo;
        if (!info) return;
        if (meters.poolId !== info.poolId) return;
        appModel.applyJackpotTick({ values: meters.meters, v: meters.version });
        break;
      }
      case 'jackpot_won': {
        const won = data as JackpotWonMessage;
        EventHandler.dispatchEvent(SlotEvents.JACKPOT_WON, {
          tier: won.tier,
          amount: won.amount,
          currency: won.currency,
          playerId: won.player ?? '***',
          gameName: won.gameName,
          gameAlias: won.gameAlias,
        });
        break;
      }
      case 'jackpot_pool_changed': {
        const changed = data as JackpotPoolChangedMessage;
        if (appModel.jackpotInfo) appModel.jackpotReinitPending = true;
        EventHandler.dispatchEvent(SlotEvents.JACKPOT_POOL_CHANGED, { poolId: changed.poolId });
        break;
      }
      default:
        break;
    }
  }

  private readonly handleOffline = (): void => {
    // console.log('[realtime] browser reported network offline');
    this.markDisconnected();
    this.abortController?.abort();
  };

  private readonly handleOnline = (): void => {
    // console.log('[realtime] browser reported network online');
    if (!this.isConnected && this.sessionToken) {
      this.retryDelay = MIN_RETRY_MS;
      this.connect(this.sessionToken);
    }
  };

  private resetWatchdog(): void {
    window.clearTimeout(this.watchdogTimer);
    this.watchdogTimer = window.setTimeout(() => {
      // console.log('[realtime] no data received within timeout, assuming dead connection');
      this.markDisconnected();
      this.abortController?.abort();
    }, this.HEARTBEAT_TIMEOUT_MS);
  }

  private markConnected(): void {
    if (!this.isConnected) {
      this.isConnected = true;
      EventHandler.dispatchEvent(SlotEvents.REALTIME_CONNECTION_RESTORED, {});
    }
  }

  private markDisconnected(): void {
    window.clearTimeout(this.watchdogTimer);
    if (this.isConnected) {
      this.isConnected = false;
      EventHandler.dispatchEvent(SlotEvents.REALTIME_CONNECTION_LOST, {});
    }
  }
}

export const RealtimeConnection = new RealtimeConnectionService();

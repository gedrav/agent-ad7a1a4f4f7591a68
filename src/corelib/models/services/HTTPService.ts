import ky, { HTTPError } from 'ky';
import { MessageServiceProxy } from '@brand/models/MessageServiceProxy';
import { appModel } from '@core/models/services/AppModelService';
import sampleData from './sample.json';

// Shared ky instance — prefixUrl is set from the env var baked in at build time.
// All requests only need to pass the endpoint path (e.g. 'init', 'spin').
// 30s timeout: on iOS the event loop can stall during asset loading while the init
// response is in flight; 10s (ky default) is too short in that scenario.
const httpClient = ky.create({
  prefixUrl: import.meta.env.VITE_API_URL,
  timeout: 30000,
});

// Shared ky instance for external URLs (no prefixUrl).
const externalHttpClient = ky.create({});

export class HTTPService {
  protected app: MessageServiceProxy;

  constructor(ref: MessageServiceProxy) {
    this.app = ref;
  }

  public async getServerResponse(
    messageName: string,
    request: any,
    endpoint: string,
    methodType = 'POST',
  ): Promise<void> {
    appModel.isErrorOccurred = false;
    const isAbsolute = /^https?:\/\//.test(endpoint);
    // ky's prefixUrl requires the endpoint must NOT start with '/'
    const path = isAbsolute ? endpoint : endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    // if (path === 'feature') {
    //   console.log('feature endpoint called');
    //   this.callBackFunction(messageName, sampleData.data);
    //   return;
    // }
    const client = isAbsolute ? externalHttpClient : httpClient;
    try {
      let responseData: any;
      if (methodType === 'GET') {
        responseData = await client.get(path).json();
      } else if (methodType === 'PUT') {
        responseData = await client.put(path, { json: request }).json();
      } else {
        responseData = await client.post(path, { json: request }).json();
      }
      this.callBackFunction(messageName, responseData.data);
    } catch (error) {
      if (error instanceof HTTPError) {
        // Normalize ky's HTTPError shape to match what SlotGameApp.onServerError expects:
        //   obj.data?.response?.statusText  — used for gameinit errors
        //   obj.data?.response?.data?.message — used for other errors
        try {
          const errorBody = await error.response.json();
          this.onServerError(messageName, errorBody);
        } catch {
          this.onServerError(messageName, error);
        }
      } else {
        this.onServerError(messageName, error);
      }
    }
  }

  protected callBackFunction(msgName: string, data: any): void {
    this.app.handleServerResponse(msgName, data);
  }

  protected onServerError(msgName: string, error: any): void {
    this.app.onServerError(msgName, error);
  }
}

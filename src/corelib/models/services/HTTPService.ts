import ky, { HTTPError } from 'ky';
import { MessageServiceProxy } from '@brand/models/MessageServiceProxy';
import { appModel } from '@core/models/services/AppModelService';

// Shared ky instance — prefixUrl is set from the env var baked in at build time.
// All requests only need to pass the endpoint path (e.g. 'init', 'spin').
const httpClient = ky.create({
  prefixUrl: import.meta.env.VITE_API_URL,
});

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
    // ky's prefixUrl requires the endpoint must NOT start with '/'
    const path = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    try {
      let responseData: any;
      if (methodType === 'GET') {
        responseData = await httpClient.get(path).json();
      } else {
        responseData = await httpClient.post(path, { json: request }).json();
      }
      this.callBackFunction(messageName, responseData.data);
    } catch (error) {
      if (error instanceof HTTPError) {
        // Normalize ky's HTTPError shape to match what SlotGameApp.onServerError expects:
        //   obj.data?.response?.statusText  — used for gameinit errors
        //   obj.data?.response?.data?.message — used for other errors
        try {
          const errorBody = await error.response.json();
          this.onServerError(messageName, {
            response: { statusText: error.response.statusText, data: errorBody },
          });
        } catch {
          this.onServerError(messageName, { response: { statusText: error.response.statusText, data: {} } });
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

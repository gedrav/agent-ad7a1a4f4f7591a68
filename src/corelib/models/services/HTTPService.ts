import axios, { AxiosInstance } from 'axios';
import { MessageServiceProxy } from '@brand/models/MessageServiceProxy';
import { appModel } from '@core/models/services/AppModelService';

// Shared axios instance — baseURL is set from the env var baked in at build time.
// All requests only need to pass the endpoint path (e.g. 'init', 'spin').
const httpClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export class HTTPService {
  protected app: any;

  constructor(ref: MessageServiceProxy) {
    this.app = ref;
  }

  async getServerResponse(messageName: string, request: any, endpoint: string, methodType = 'POST'): Promise<void> {
    appModel.isErrorOccurred = false;
    try {
      let response;
      if (methodType === 'GET') {
        response = await httpClient.get(endpoint);
      } else {
        response = await httpClient.post(endpoint, request);
      }
      this.callBackFunction(messageName, response.data.data);
    } catch (error) {
      this.onServerError(messageName, error);
    }
  }
  protected showErrorPopUp(error) {
    if (error.response.data.errorCode === 208) {
      this.app.handleGameError(error.response.data.errorMessage);
    } else {
      this.app.handleInvalidGameError(error);
    }
  }
  protected callBackFunction(msgName: string, data: any): void {
    this.app.handleServerResponse(msgName, data);
  }
  protected onServerError(msgName: string, error: any): void {
    this.app.onServerError(msgName, error);
  }
}

import axios from 'axios';
import { MessageServiceProxy } from '@core/models/MessageServiceProxy';
import { appModel } from '@core/models/services/AppModelService';

export class HTTPService {
  protected app: any;

  constructor(ref: MessageServiceProxy) {
    this.app = ref;
  }

  async getServerResponse(messageName: string, request: any, url: string, methodType = 'POST'): Promise<void> {
    appModel.isErrorOccurred = false;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const refObj = this;
    if (methodType === 'GET') {
      await axios
        .get(url, { params: { ID: 1 } })
        .then(function (response) {
          refObj.callBackFunction(messageName, response.data.data);
        })
        .catch(function (error) {
          console.log('error == ', error);
        })
        .then(function () {
          // always executed
        });
    } else if (methodType === 'POST') {
      await axios
        .post(url, request)
        .then(function (response) {
          refObj.callBackFunction(messageName, response.data.data);
        })
        .catch(function (error) {
          // refObj.showErrorPopUp(error);
          refObj.onServerError(messageName, error);
          //console.log('error == ', error);
        })
        .then(function () {
          // always executed
        });
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

import { MessageServiceProxy } from '../MessageServiceProxy';
export declare class HTTPService {
  protected app: any;
  constructor(ref: MessageServiceProxy);
  setReference(ref: any): void;
  getServerResponse(messageName: string, request: any, url: string, methodType?: string): void;
  protected callBackFunction(msgName: string, data: any): void;
}

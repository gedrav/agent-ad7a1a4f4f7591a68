import { AbstractProxy } from './AbstractProxy';
import { LoaderProxy } from './LoaderServiceProxy';
import { HTTPService } from './services/HTTPService';
export declare class MessageServiceProxy extends AbstractProxy {
  protected httpService: HTTPService;
  protected loaderService: typeof LoaderProxy;
  connectToServer(loaderService: typeof LoaderProxy): void;
}
export declare const MessageProxy: MessageServiceProxy;

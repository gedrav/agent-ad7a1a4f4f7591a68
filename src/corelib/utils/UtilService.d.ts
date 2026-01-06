declare class UtilService {
  protected gameUtil: any;
  getRandomRange(min: number, max: number): number;
  getCurrentTimeInMili(): number;
  getDefaultValue(val: any, originalVal?: any): any;
  getContent(str: string): string;
  parseMessage(str: string, map: Array<any>): string;
  getDegrees(radians: number): number;
  getRadians(degrees: number): number;
  setGameUtilClass(ref: any): void;
  getGameUtilClass(): any;
}
export declare const Util: UtilService;
export {};

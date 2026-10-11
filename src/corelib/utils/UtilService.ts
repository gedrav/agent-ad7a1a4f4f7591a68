import { appModel } from '../models/services/AppModelService';
import { ContentProxy } from '../models/ContentServiceProxy';
import i18next from 'i18next';

class UtilService {
  protected gameUtil: any;

  public pickRandomProperty(obj: any): any {
    let prop,
      len = 0,
      randomPos: number,
      pos = 0;
    for (prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        len += 1;
      }
    }
    // eslint-disable-next-line prefer-const
    randomPos = Math.floor(Math.random() * len);
    for (prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        if (pos === randomPos) {
          return obj[prop];
        }
        pos += 1;
      }
    }
  }
  public unicodeToChar(text: string): string {
    return text.replace(/\\u[\dA-F]{4}/gi, function (match) {
      return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
    });
  }
  public inRange(value: number, first: number, last: number): boolean {
    const lower = Math.min(first, last);
    const upper = Math.max(first, last);
    return value >= lower && value <= upper;
  }
  public getNextHundred(num: number): number {
    return Math.ceil(num / 100) * 100;
  }
  public getDecimalRandom(min: number, max: number, decimalPlaces = 2): number {
    const rand = Math.random() * (max - min) + min;
    const power = Math.pow(10, decimalPlaces);
    return Math.floor(rand * power) / power;
  }
  public getRandomRange(min: number, max: number): number {
    const val: number = Math.floor(Math.random() * (max - min + 1)) + min;
    return val;
  }
  public getAnyRandom(num1: number, num2: number): number {
    const rnd = this.getRandomRange(1, 2);
    if (rnd == 1) {
      return num1;
    } else {
      return num2;
    }
  }
  public parseMessage(str: string, map: Array<any>): string {
    let st = '';
    const len = map.length;
    for (let n = 0; n < len; n++) {
      st = '{{text' + (n + 1) + '}}';
      str = str.replace(st, map[n]);
    }
    return str;
  }
  public getContent(str: string, arr: (string | number)[] = [], toUpperCase = false): string {
    const text = this.parseMessage(ContentProxy.content[str], arr);
    if (toUpperCase) {
      return text.toUpperCase();
    } else {
      return text;
    }
  }
  getCurrentTime(): string {
    const now = new Date();
    const pretty: string = [now.getHours(), ':', now.getMinutes(), ':', now.getSeconds()].join('');
    return pretty;
  }

  public getCurrentTimeInMili(): number {
    return Date.now();
  }

  public getDefaultValue(val: any, originalVal: any = null): any {
    return val === undefined || isNaN(val) ? originalVal : val;
  }

  public stripText(str: string) {
    const strLength = str.split('').length;
    if (strLength > 15) {
      return str.substring(0, 15) + '...';
    }
    return str;
  }

  public toString(value: number): string {
    return value.toString();
  }

  public roundMoney(value: number, decimals = appModel.moneyDecimals): number {
    if (!Number.isFinite(value)) return value;
    const sign = value < 0 ? -1 : 1;
    const clean = Number(Math.abs(value).toFixed(8));
    if (clean < 0.5 / 10 ** decimals) return 0;
    return sign * Number(`${Math.round(Number(`${clean}e${decimals}`))}e-${decimals}`);
  }

  public formatCurrency(num: number, decimal = appModel.moneyDecimals) {
    if (num == undefined) {
      num = 0;
    }
    num = this.roundMoney(num, decimal);
    let str = '';

    if (Intl) {
      if (appModel.funMode) {
        str = new Intl.NumberFormat(appModel.language, {
          minimumFractionDigits: decimal,
          maximumFractionDigits: decimal,
        }).format(num);
      } else {
        str = new Intl.NumberFormat(appModel.language, {
          style: 'currency',
          currencyDisplay: 'symbol',
          currency: appModel.currency,
          minimumFractionDigits: decimal,
          maximumFractionDigits: decimal,
          useGrouping: true,
        }).format(num);
      }
    } else {
      str = appModel.currency + num;
    }
    return str;
  }

  public formatJPCurrency(num: number, currency: string, decimal = appModel.moneyDecimals) {
    if (num == undefined) {
      num = 0;
    }
    num = this.roundMoney(num, decimal);
    let str = '';

    if (Intl) {
      if (appModel.funMode) {
        str = new Intl.NumberFormat(appModel.language, {
          minimumFractionDigits: decimal,
          maximumFractionDigits: decimal,
        }).format(num);
      } else {
        str = new Intl.NumberFormat(appModel.language, {
          style: 'currency',
          currencyDisplay: 'symbol',
          currency: currency,
          minimumFractionDigits: decimal,
          maximumFractionDigits: decimal,
          useGrouping: true,
        }).format(num);
      }
    } else {
      str = appModel.currency + num;
    }
    return str;
  }

  public formatCurrencyNoSymbol(num: number, decimal = appModel.moneyDecimals) {
    num = this.roundMoney(num, decimal);
    const lang = appModel.language ? appModel.language : 'en';
    const curr = appModel.currency ? appModel.currency : 'USD';
    let str = '';
    if (Intl) {
      str = new Intl.NumberFormat(lang, {
        currency: curr,
        minimumFractionDigits: decimal,
        maximumFractionDigits: decimal,
        useGrouping: true,
      }).format(num);
    } else {
      str = appModel.currency + num;
    }
    return str;
  }

  public getCurrencySymbol(): string {
    const lang = appModel.language ? appModel.language : 'en';
    const curr = appModel.currency ? appModel.currency : 'USD';
    if (Intl) {
      const currencyPart = new Intl.NumberFormat(lang, {
        style: 'currency',
        currencyDisplay: 'symbol',
        currency: curr,
      })
        .formatToParts(0)
        .find((part) => part.type === 'currency');
      return currencyPart?.value ?? curr;
    }
    return curr;
  }

  public getDegrees(radians: number): number {
    const pi = Math.PI;
    return radians * (180 / pi);
  }
  public getRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  public setGameUtilClass(ref: any) {
    this.gameUtil = ref;
  }

  public getGameUtilClass(): any {
    return this.gameUtil;
  }

  public getTwoDecimalValue(value: number): number {
    return Math.round(value);
  }

  cloneArray(arr: any[]): any[] {
    const arrCopy: any[] = JSON.parse(JSON.stringify(arr));
    return arrCopy;
  }

  combineBlastPoisitions(data: any[]) {
    const arr = this.cloneArray(data);
    const combinedPositions = arr.flatMap((item) => item.positions);
    const unique = Array.from(new Set(combinedPositions.map((item) => item.join(',')))).map((item) =>
      item.split(',').map(Number),
    );
    return unique;
  }

  deepClone(obj, hash = new WeakMap()) {
    if (Object(obj) !== obj) return obj; // Return primitive values
    if (hash.has(obj)) return hash.get(obj); // Handle circular references

    const result = Array.isArray(obj) ? [] : Object.create(Object.getPrototypeOf(obj));
    hash.set(obj, result); // Store the reference in the hash to track circular references

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = this.deepClone(obj[key], hash);
      }
    }
    return result;
  }
  moveElement(arr: any, from: number, to: number): any {
    let numberOfDeletedElm = 1;
    const elm = arr.splice(from, numberOfDeletedElm)[0];
    numberOfDeletedElm = 0;
    if (to > arr.length - 1) {
      to = arr.length;
    }
    arr.splice(to, numberOfDeletedElm, elm);
    return arr;
  }

  trimString(input: string, length: number, postfix: string = '') {
    if (input.length > length) {
      return input.slice(0, length) + '...';
    }
    return input;
  }

  convertToDHMS(seconds: number): string {
    const days = Math.floor(seconds / (24 * 3600));
    seconds %= 24 * 3600;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    return `${days}d ${hours}h ${minutes}m ${Math.ceil(seconds)}s`;
  }

  convertToHMS(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    return `${hours}h ${minutes}m ${Math.ceil(seconds)}s`;
  }

  convertToD(seconds: number): string {
    const days = Math.floor(seconds / (24 * 3600));
    seconds %= 24 * 3600;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    return `${days}d`;
  }

  async addDelays(duration: number): Promise<void> {
    const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

    await sleep(duration);
  }
}

export const Util = new UtilService();

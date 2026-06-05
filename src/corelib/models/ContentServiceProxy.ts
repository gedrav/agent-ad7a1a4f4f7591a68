import { Cache } from 'pixi.js';
import { AbstractProxy } from '@core/models/AbstractProxy';

class ContentServiceProxy extends AbstractProxy {
  private _content!: any;
  private _textConfig!: any;
  private _loaded = false;

  constructor() {
    super();
    this._content = {};
    this._textConfig = {};
  }

  public initiate() {
    const data = (Cache as any)._cache;
    this.setContent(data.get('gameContent.json'));
    this.updateContent(data.get('commonContent.json'));
    this._loaded = true;
  }

  public get isLoaded(): boolean {
    return this._loaded;
  }

  public setContent(data: any) {
    this._content = data;
    if (!this._content) {
      this._content = {};
    }
  }

  public setTextConfig(data: any) {
    this._textConfig = data;
  }

  public update3rdPartyContent(data: any): void {
    if (data) {
      for (const p in data) {
        this._content[p] = data[p];
      }
    }
  }

  public updateContent(data: any) {
    if (data) {
      for (const p in data) {
        this._content[p] = data[p];
      }
    }
  }

  public updateTextConfig(data: any) {
    if (data) {
      for (const p in data) {
        this._textConfig[p] = data[p];
      }
    }
  }

  public get content(): any {
    return this._content;
  }

  public get textConfig(): any {
    return this._textConfig;
  }
}

export const ContentProxy = new ContentServiceProxy();

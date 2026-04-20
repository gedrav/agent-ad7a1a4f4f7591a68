import { Howl, Howler } from 'howler';
import { appModel } from '@core/models/services/AppModelService';
import { GameProxy } from '@core/models/GameConfigProxy';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { AppEvents } from '@core/events/AppEvents';
import { Util } from '@core/utils/UtilService';

class SoundServiceProxy {
  protected isSoundPresent: boolean;
  protected isFxSoundOn: boolean;
  protected isAmbientSoundOn: boolean;
  protected soundLibrary: any;
  protected ambientSounds: Array<any>;
  protected sfxSounds: Array<any>;
  protected totalFiles = 0;
  protected loadingIndex: number;
  protected _ambientPlaying: any;
  private soundFiles: any;
  private _lastAmbientSoundName: any;

  constructor() {
    this.isSoundPresent = false;
    this.isFxSoundOn = true;
    this.isAmbientSoundOn = true;
    this.soundLibrary = null;
    this.soundLibrary = {};
    this.ambientSounds = [];
    this.sfxSounds = [];
  }

  public get soundState(): boolean {
    return this.isFxSoundOn;
  }

  public get sfxState(): boolean {
    return this.isFxSoundOn;
  }
  public set sfxState(flag: boolean) {
    this.isFxSoundOn = flag;
    Howler.mute(!flag);
  }
  public get ambientState(): boolean {
    return this.isAmbientSoundOn;
  }
  public set ambientState(flag: boolean) {
    this.isAmbientSoundOn = flag;
    const len: number = this.ambientSounds.length;
    if (len > 0) {
      for (let k = 0; k < len; k++) {
        this.ambientSounds[k].mute(!flag);
      }
    }
  }

  public loadSounds(list: any, gamePath: string) {
    // EventHandler.dispatchEvent(AppEvents.SOUNDS_LOADING_COMPLETE);
    // return;

    this.loadingIndex = 0;
    const soundPathMP3: string = gamePath + 'mp3/';
    const soundPathOGG: string = gamePath + 'ogg/';
    const loadingIndex = 0;
    this.totalFiles = list.length;
    this.soundFiles = list;
    let file1: string, file2: string;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const refObj: any = this;
    if (this.totalFiles > 0) {
      let langstring = '';

      for (let k = 0; k < this.totalFiles; k++) {
        langstring = '';
        if (list[k].langEnagled) {
          langstring = appModel.language;
        }
        file1 =
          soundPathMP3 +
          list[k].name +
          langstring +
          '.mp3' +
          '?version=' +
          // GameProxy.config.buildVersion +
          // '_' +
          GameProxy.config.gameVersion;
        file2 =
          soundPathOGG +
          list[k].name +
          langstring +
          '.ogg' +
          '?version=' +
          // GameProxy.config.buildVersion +
          // '_' +
          GameProxy.config.gameVersion;

        this.soundLibrary[list[k].name] = new Howl({
          src: [file2, file1],
          autoplay: false,
          onload: function (obj: any) {
            refObj.handleSoundsLoaded(this._src, refObj.loadingIndex);
          },
          onloaderror: function (id: number, msg: string) {
            refObj.handleSoundsLoaded(null);
          },
        });
        if (list[k].type == 'ambient') {
          this.ambientSounds.push(this.soundLibrary[list[k].name]);
        } else {
          this.sfxSounds.push(this.soundLibrary[list[k].name]);
        }
      }
    } else {
      EventHandler.dispatchEvent(AppEvents.SOUNDS_LOADING_COMPLETE);
    }
  }

  protected handleSoundsLoaded(file: string, index: string): void {
    if (!this.isSoundPresent) {
      const loaded = Math.round(((this.loadingIndex + 1) / this.totalFiles) * 100);
      const progress = 80 + Math.round(loaded * 0.2);
      EventHandler.dispatchEvent(AppEvents.LOAD_PROGRESS, progress);
    }

    if (this.loadingIndex >= this.totalFiles - 1) {
      if (!this.isSoundPresent) {
        EventHandler.dispatchEvent(AppEvents.SOUNDS_LOADING_COMPLETE);
        this.isSoundPresent = true;
      }
    } else {
      this.loadingIndex++;
    }
  }

  public playSound(sObj: any): void {
    //console.log('PLAY SOUND == ', sObj);
    if (!sObj) {
      return;
    }
    if (!this.isSoundPresent) {
      return;
    }

    const instance = this.soundLibrary[sObj.name];
    //console.log('PLAY SOUND == ', sObj.name);
    if (instance) {
      if (sObj.type == 'ambient') {
        if (this._ambientPlaying == instance) {
          return instance;
        }
      }
      if (sObj.type == 'ambient' && this._ambientPlaying) {
        this._ambientPlaying.stop();
      }
      if (sObj.type == 'ambient') {
        this._ambientPlaying = instance;
        if (sObj.resumePreviousSound) {
          this._lastAmbientSoundName = sObj.name;
        }
      }
      if (instance.playing() && !sObj.dontStopInstances) {
        instance.stop();
      }
      instance.volume(Util.getDefaultValue(sObj.volume, 1));
      instance.loop(Util.getDefaultValue(sObj.loop, false));
      const duration = sObj.fadeInDuration ? sObj.fadeInDuration : 0;
      instance.play();
      instance.fade(0, sObj.volume, duration);
    }

    return instance;
  }
  public stopSound(sObj: any): void {
    if (!sObj) {
      return;
    }
    if (!this.isSoundPresent) {
      return;
    }
    // console.log('stop sound == ', sObj.name);
    const instance = this.soundLibrary[sObj.name];
    if (instance?.playing()) {
      const duration = sObj.fadeOutDuration ? sObj.fadeOutDuration : 0;
      //const soundId = instance.play();
      instance.fade(sObj.volume, 0, duration);
    }
  }
  public resumeAmbientSound() {
    this.playSound(this.getSoundProps(this._lastAmbientSoundName));
  }
  protected getSoundProps(name: string): any {
    const len = this.soundFiles.length;
    let obj;
    for (let k = 0; k < len; k++) {
      if (this.soundFiles[k].name === name) {
        obj = this.soundFiles[k];
        break;
      }
    }
    return obj;
  }
  public muteAllSounds(): void {
    //console.log(' MUTE 🔕');
    Howler.mute(true);
  }

  public unmuteAllSounds(fromFocusOff = false): void {
    //console.log(' UNMUTE 🔔');
    if (this.isAmbientSoundOn) {
      Howler.mute(false);
    }
  }
}

export const SoundFactory = new SoundServiceProxy();

declare class SoundServiceProxy {
  protected isSoundPresent: boolean;
  protected isFxSoundOn: boolean;
  protected isAmbientSoundOn: boolean;
  protected soundLibrary: any;
  protected ambientSounds: Array<any>;
  protected sfxSounds: Array<any>;
  protected totalFiles: number;
  protected loadingIndex: number;
  constructor();
  get soundState(): boolean;
  get sfxState(): boolean;
  get ambientState(): boolean;
  set sfxState(flag: boolean);
  set ambientState(flag: boolean);
  loadSounds(list: any): void;
  protected handleSoundsLoaded(file: string, index: string): void;
  playSound(sObj: any, callback?: () => void): void;
  stopSound(sObj: any): void;
  muteAllSounds(): void;
  unmuteAllSounds(fromFocusOff?: boolean): void;
}
export declare const SoundFactory: SoundServiceProxy;
export {};

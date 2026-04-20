import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SoundFactory } from '@core/sound/SoundServiceProxy';

export class SoundManager {
  constructor(config: any) {
    this.addEvents(config.soundFiles);
    if (config.lazySoundFiles && Array.isArray(config.lazySoundFiles)) {
      this.addEvents(config.lazySoundFiles);
    }
  }

  addEvents(soundArray: any[]) {
    if (!Array.isArray(soundArray)) return;
    const soundsLength = soundArray.length;
    if (soundsLength > 0) {
      for (let k = 0; k < soundsLength; k++) {
        if (soundArray[k].playEvents) {
          const playLength = soundArray[k].playEvents.length;
          if (playLength > 0) {
            for (let i = 0; i < playLength; i++) {
              if (SlotEvents[soundArray[k].playEvents[i]]) {
                EventHandler.addEventListener(
                  SlotEvents[soundArray[k].playEvents[i]],
                  this.onSoundPlayEvent.bind(this, soundArray[k]),
                );
              } else {
                EventHandler.addEventListener(
                  soundArray[k].playEvents[i],
                  this.onSoundPlayEvent.bind(this, soundArray[k]),
                );
              }
            }
          }
          if (soundArray[k].stopEvents) {
            const stopLength = soundArray[k].stopEvents.length;
            if (stopLength > 0) {
              for (let i = 0; i < stopLength; i++) {
                if (SlotEvents[soundArray[k].stopEvents[i]]) {
                  EventHandler.addEventListener(
                    SlotEvents[soundArray[k].stopEvents[i]],
                    this.onSoundStopEvent.bind(this, soundArray[k]),
                  );
                } else {
                  EventHandler.addEventListener(
                    soundArray[k].stopEvents[i],
                    this.onSoundStopEvent.bind(this, soundArray[k]),
                  );
                }
              }
            }
          }
        }
      }
    }
  }

  onSoundPlayEvent(sObj: any, param: any): any {
    if (sObj.matchParam != undefined) {
      if (sObj.matchParam === param) {
        SoundFactory.playSound(sObj);
      }
    } else if (sObj.matchParams != undefined) {
      if (sObj.matchParams.includes(param)) {
        SoundFactory.playSound(sObj);
      }
    } else {
      SoundFactory.playSound(sObj);
    }
  }

  onSoundStopEvent(sObj: any): void {
    SoundFactory.stopSound(sObj);
  }
}

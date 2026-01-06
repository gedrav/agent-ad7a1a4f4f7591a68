import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SoundFactory } from '@core/sound/SoundServiceProxy';

export class SoundManager {
  constructor(config: any) {
    this.addEvents(config);
  }

  addEvents(config: any) {
    const soundsLength = config.soundFiles.length;
    if (soundsLength > 0) {
      for (let k = 0; k < soundsLength; k++) {
        if (config.soundFiles[k].playEvents) {
          const playLength = config.soundFiles[k].playEvents.length;
          if (playLength > 0) {
            for (let i = 0; i < playLength; i++) {
              if (SlotEvents[config.soundFiles[k].playEvents[i]]) {
                EventHandler.addEventListener(
                  SlotEvents[config.soundFiles[k].playEvents[i]],
                  this.onSoundPlayEvent.bind(this, config.soundFiles[k]),
                );
              } else {
                EventHandler.addEventListener(
                  config.soundFiles[k].playEvents[i],
                  this.onSoundPlayEvent.bind(this, config.soundFiles[k]),
                );
              }
            }
          }
          if (config.soundFiles[k].stopEvents) {
            const stopLength = config.soundFiles[k].stopEvents.length;
            if (stopLength > 0) {
              for (let i = 0; i < stopLength; i++) {
                if (SlotEvents[config.soundFiles[k].stopEvents[i]]) {
                  EventHandler.addEventListener(
                    SlotEvents[config.soundFiles[k].stopEvents[i]],
                    this.onSoundStopEvent.bind(this, config.soundFiles[k]),
                  );
                } else {
                  EventHandler.addEventListener(
                    config.soundFiles[k].stopEvents[i],
                    this.onSoundStopEvent.bind(this, config.soundFiles[k]),
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
    } else {
      SoundFactory.playSound(sObj);
    }
  }

  onSoundStopEvent(sObj: any): void {
    SoundFactory.stopSound(sObj);
  }
}

import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';

export class MenuComp extends ResponsiveChildrenView {
  // private guideRect: any;
  private homeBtn: any;
  private ambientSoundOn: any;
  private ambientSoundOff: any;
  private sfxSoundOn: any;
  private sfxSoundOff: any;
  private historyBtn: any;
  private infoBtn: any;
  private menuBg: any;

  constructor(config: any) {
    super(config);
    console.log('MenuComp created');
    this.guideRect = this.elementsList['guideRect'];
    this.menuBg = this.elementsList['menubg'];

    this.homeBtn = this.elementsList['homeBtn'];
    this.ambientSoundOn = this.elementsList['ambientSoundOn'];
    this.ambientSoundOff = this.elementsList['ambientSoundOff'];
    //this.ambientSoundOff.visible = false;
    this.sfxSoundOn = this.elementsList['sfxSoundOn'];
    this.sfxSoundOff = this.elementsList['sfxSoundOff'];
    //this.sfxSoundOff.visible = false;
    this.historyBtn = this.elementsList['historyBtn'];
    this.infoBtn = this.elementsList['infoBtn'];

    /*this.homeBtn.enabled = true;
    this.ambientSoundOn.enabled = true;
    this.ambientSoundOff.enabled = true;
    this.sfxSoundOn.enabled = true;
    this.sfxSoundOff.enabled = true;
    this.historyBtn.enabled = true;
    this.infoBtn.enabled = true;
    this.repositionButtons();*/

    EventHandler.addEventListener(SlotEvents.MENU_COMP_AMBIENT_SOUND_TOGGLED, this.onAmbientToggled.bind(this));
    EventHandler.addEventListener(SlotEvents.MENU_COMP_SFX_SOUND_TOGGLED, this.onSfxToggled.bind(this));

    EventHandler.addEventListener(SlotEvents.HIDE_MENU, this.hideMenu.bind(this));
    EventHandler.addEventListener(SlotEvents.MENU_CLICKED, this.onMenuClicked.bind(this));
  }
  protected hideMenu(): void {}
  protected onMenuClicked(event: any): void {}

  private onAmbientToggled(isOn: boolean): void {
    this.ambientSoundOn.visible = isOn;
    this.ambientSoundOff.visible = !isOn;
  }

  private onSfxToggled(isOn: boolean): void {
    this.sfxSoundOn.visible = isOn;
    this.sfxSoundOff.visible = !isOn;
  }

  protected repositionButtons(): void {
    const hasHomeUrl = appModel.getHomeURL() && appModel.getHomeURL().length > 0;
    this.homeBtn.visible = hasHomeUrl;

    const buttonGroups = [
      ...(hasHomeUrl ? [{ buttons: [this.homeBtn] }] : []),
      { buttons: [this.ambientSoundOn, this.ambientSoundOff] },
      { buttons: [this.sfxSoundOn, this.sfxSoundOff] },
      { buttons: [this.infoBtn] },
      { buttons: [this.historyBtn] },
    ];

    if (!this.menuBg || buttonGroups.length === 0) return;

    const containerWidth = this.menuBg.width * 0.7;
    const padding = (this.menuBg.width - containerWidth) / 2;
    const gap = buttonGroups.length > 1 ? containerWidth / (buttonGroups.length - 1) : 0;

    buttonGroups.forEach((group, index) => {
      const x = padding + gap * index;
      group.buttons.forEach((button) => {
        button.x = x;
      });
    });
  }
}

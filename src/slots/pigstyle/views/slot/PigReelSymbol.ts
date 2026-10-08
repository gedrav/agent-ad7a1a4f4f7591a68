import { Texture } from 'pixi.js';
import ReelSymbolSpine from '@core/views/slotmachine/ReelSymbolSpine';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { UIUtil } from '@core/utils/UIUtilService';
import { appModel } from '@core/models/services/AppModelService';

export default class PigReelSymbol extends ReelSymbolSpine {
  protected multiplier: PixSpine;

  protected createSymbol(): void {
    this.destroySymbol();

    this.symbol = UIUtil.getSpriteFromTexture(this.resolveTexture());
    this.symbol.label = 'SYMBOL';
    this.symbol.anchor.set(0.5, 0.5);
    this.addChild(this.symbol);

    this.handleGameProp();
  }

  public setRewardData(multiplier: number): void {
    this.clearRewardData();
    if (multiplier < 2 || !appModel.secondaryAssetsLoaded) {
      return;
    }
    this.multiplier = UIUtil.getElement(this.configData.data.multiplierSpine);
    this.multiplier.playAnimation({ state: `X${multiplier}_idle`, loop: false });
    this.addChild(this.multiplier);
    this.positionMultiplier();
  }

  public clearRewardData(): void {
    this.multiplier?.destroy();
    this.multiplier = null;
  }

  protected positionMultiplier(): void {
    if (!this.multiplier) {
      return;
    }
    this.multiplier.scale.set(this.symbol.scale.x * this.configData.data.multiplierScale);
    this.multiplier.x = 0;
    this.multiplier.y = 0;
  }

  public setNewSymbol(data: any, reelno: number): void {
    super.setNewSymbol(data, reelno);
    this.clearRewardData();
  }

  public setNormalTexture(): void {
    super.setNormalTexture();
    this.clearRewardData();
  }

  protected resolveTexture(): Texture {
    const data = this.configData.data;
    return UIUtil.getTexture(this.withBlur(data.sized ? `${data.name}${data.rowCount}` : data.name));
  }

  protected withBlur(name: string): string {
    return this.isBlurred ? `${name}_blur` : name;
  }

  protected playSpineAnimation(state: string, loop: boolean): boolean {
    const played = super.playSpineAnimation(this.resolveAnimName(state), loop);
    if (played) {
      this.hidePlate();
    }
    return played;
  }

  protected hidePlate(): void {
    const plate = this.configData.data.hidePlate;
    if (!plate) {
      return;
    }
    this.spine.spineAnim.skeleton.findSlot(plate)?.setAttachment(null);
    this.spine.update(0);
  }

  protected resolveAnimName(state: string): string {
    return state;
  }
}

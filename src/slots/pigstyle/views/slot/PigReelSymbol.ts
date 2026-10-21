import { Texture } from 'pixi.js';
import ReelSymbolSpine from '@core/views/slotmachine/ReelSymbolSpine';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { UIUtil } from '@core/utils/UIUtilService';
import { appModel } from '@core/models/services/AppModelService';

export default class PigReelSymbol extends ReelSymbolSpine {
  declare protected tile: PixSprite;
  protected multiplier: PixSpine;

  protected createSymbol(): void {
    this.destroySymbol();

    this.tile = UIUtil.getSpriteFromTexture(this.resolveTileTexture());
    this.tile.label = 'TILE';
    this.tile.anchor.set(0, 0);
    this.addChild(this.tile);

    this.symbol = UIUtil.getSpriteFromTexture(this.resolveTexture());
    this.symbol.label = 'SYMBOL';
    this.symbol.anchor.set(0.5, 0.5);
    this.addChild(this.symbol);

    this.fitSymbolToTile();
    this.handleGameProp();
  }

  protected sortZIndex(): void {
    if (this.symbol?.parent !== this) return;

    let targetIndex = this.getChildIndex(this.symbol);

    if (this.spine?.parent === this) {
      targetIndex++;
      this.addChildAt(this.spine, targetIndex);
    }

    if (this.multiplier?.parent === this) {
      targetIndex++;
      this.addChildAt(this.multiplier, targetIndex);
    }
  }

  public setRewardData(multiplier: number): void {
    this.clearRewardData();
    if (multiplier < 2 || !appModel.secondaryAssetsLoaded) {
      return;
    }
    this.multiplier = UIUtil.getElement(this.configData.data.multiplierSpine);
    this.multiplier.playAnimation({ state: `x${multiplier}_idle`, loop: false });
    this.addChild(this.multiplier);
    this.positionMultiplier();
    this.sortZIndex();
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
    this.multiplier.x = this.tile ? this.tile.width / 2 : 0;
    this.multiplier.y = this.tile ? this.tile.height / 2 : 0;
  }

  public destroySymbol(): void {
    super.destroySymbol();
    this.tile?.destroy();
    this.tile = null;
  }

  protected destroySpine(): void {
    super.destroySpine();
    this.fitSymbolToTile();
  }

  protected createExtraElements(): void {
    super.createExtraElements();
    this.centreSpine();
    this.sortZIndex();
  }

  public setNewSymbol(data: any, reelno: number): void {
    super.setNewSymbol(data, reelno);
    this.clearRewardData();
    this.refreshTile();
  }

  public setBlurredTexture(): void {
    super.setBlurredTexture();
    this.refreshTile();
  }

  public setNormalTexture(): void {
    super.setNormalTexture();
    this.clearRewardData();
    this.refreshTile();
  }

  public resetSymbol(): void {
    super.resetSymbol();
    this.restoreMultiplierBrightness();
  }

  protected resolveTexture(): Texture {
    const data = this.configData.data;
    return UIUtil.getTexture(this.withBlur(data.sized ? `${data.name}${data.rowCount}` : data.name));
  }

  protected resolveTileTexture(): Texture {
    const data = this.configData.data;
    return UIUtil.getTexture(this.withBlur(`${data.tileImage}${data.rowCount}`));
  }

  public setTileImage(tileImage: string): void {
    this.configData.data.tileImage = tileImage;
    this.refreshTile();
  }

  protected refreshTile(): void {
    if (!this.tile) return;
    this.tile.texture = this.resolveTileTexture();
    this.fitSymbolToTile();
    this.centreSpine();
    this.positionMultiplier();
  }

  protected getConfigValue(configKey: string, defaultValue: number = 0): number {
    const data = this.configData.data[configKey];
    if (data === undefined) {
      return defaultValue;
    }
    if (typeof data === 'number') {
      return data;
    }
    const rowCount = this.configData.data.rowCount;
    return data[rowCount] ?? data.default ?? defaultValue;
  }

  protected fitSymbolToTile(): void {
    if (!this.symbol || !this.tile) return;
    this.symbol.scale.set(1);

    const scaleFactor = Math.min(this.tile.height / this.symbol.height, this.tile.width / this.symbol.width);
    const customScale = this.getConfigValue('fitScale', 1);

    this.symbol.scale.set(scaleFactor * customScale);

    const offsetX = this.getConfigValue('fitOffsetX', 0);
    const offsetY = this.getConfigValue('fitOffsetY', 0);

    this.symbol.x = this.tile.width / 2 + offsetX;
    this.symbol.y = this.tile.height / 2 + offsetY;
  }

  protected centreSpine(): void {
    this.fitSpineToTile();
  }

  protected withBlur(name: string): string {
    return this.isBlurred ? `${name}_blur` : name;
  }

  public showFaded(): void {
    super.showFaded();
    if (this.multiplier) {
      const source: any = this.spine || this.symbol;
      if (source) {
        this.multiplier.alpha = source.alpha;
        if (source.tint !== undefined) {
          (this.multiplier as any).tint = source.tint;
        }
      } else {
        this.multiplier.alpha = 0.5;
        (this.multiplier as any).tint = 0x555555;
      }
    }
  }

  public showWinning(onComplete?: () => void, loop: boolean = false): void {
    super.showWinning(onComplete, loop);
    this.restoreMultiplierBrightness();
  }

  protected restoreMultiplierBrightness(): void {
    if (this.multiplier) {
      this.multiplier.alpha = 1;
      if ((this.multiplier as any).tint !== undefined) {
        (this.multiplier as any).tint = 0xffffff;
      }
    }
  }

  public cleanUpSymbolWin(): void {
    super.cleanUpSymbolWin();
    this.restoreMultiplierBrightness();
  }

  protected playSpineAnimation(state: string, loop: boolean): boolean {
    const played = super.playSpineAnimation(this.resolveAnimName(state), loop);
    if (played) {
      this.hidePlate();
      this.fitSpineToTile();

      if (this.multiplier?.parent === this && this.spine?.parent === this) {
        const spineIndex = this.getChildIndex(this.spine);
        this.addChildAt(this.multiplier, spineIndex + 1);
      }
    }
    return played;
  }

  protected fitSpineToTile(): void {
    if (!this.spine || !this.tile) return;

    const offsetX = this.getConfigValue('animOffsetX', 0);
    const offsetY = this.getConfigValue('animOffsetY', 0);

    this.spine.x = this.tile.width / 2 + offsetX;
    this.spine.y = this.tile.height / 2 + offsetY;

    const customScale = this.getConfigValue('animFitScale', this.configData.data.animScale ?? 1);

    if (this.configData.data.sized) {
      this.spine.scale.set(customScale);
    } else {
      const bounds = this.spine.getLocalBounds();
      if (bounds.width && bounds.height) {
        const scaleFactor = Math.min(this.tile.height / bounds.height, this.tile.width / bounds.width);
        this.spine.scale.set(scaleFactor * customScale);
      }
    }
  }

  protected hidePlate(): void {
    const plate = this.configData.data.hidePlate;
    if (!plate || !this.spine) {
      return;
    }
    const spine: any = this.spine;
    spine.spineAnim?.skeleton?.findSlot(plate)?.setAttachment(null);
    this.spine.update(0);
  }

  protected resolveAnimName(state: string): string {
    return state;
  }
}

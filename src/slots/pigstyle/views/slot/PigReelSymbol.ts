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

  public setRewardData(multiplier: number): void {
    this.clearRewardData();
    if (multiplier < 2 || !appModel.secondaryAssetsLoaded) {
      return;
    }
    this.multiplier = UIUtil.getElement(this.configData.data.multiplierSpine);
    this.multiplier.playAnimation({ state: `x${multiplier}_idle`, loop: false });
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
    this.refreshTile();
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

  // --- NEW: Unified helper to read scales AND positions from config ---
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

    // 1. Static Symbol Scaling
    const scaleFactor = Math.min(this.tile.height / this.symbol.height, this.tile.width / this.symbol.width);
    const customScale = this.getConfigValue('fitScale', 1);

    this.symbol.scale.set(scaleFactor * customScale);

    // 2. Static Symbol Positioning (Centered + Config Offsets)
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

  protected playSpineAnimation(state: string, loop: boolean): boolean {
    const played = super.playSpineAnimation(this.resolveAnimName(state), loop);
    if (played) {
      this.hidePlate();
      this.fitSpineToTile();
    }
    return played;
  }

  protected fitSpineToTile(): void {
    if (!this.spine || !this.tile) return;

    // 1. Spine Positioning (Centered + Config Offsets)
    const offsetX = this.getConfigValue('animOffsetX', 0);
    const offsetY = this.getConfigValue('animOffsetY', 0);

    this.spine.x = this.tile.width / 2 + offsetX;
    this.spine.y = this.tile.height / 2 + offsetY;

    // 2. Spine Scaling
    // Reads animFitScale. If missing, falls back to the base animScale from your old config, defaulting to 1
    const customScale = this.getConfigValue('animFitScale', this.configData.data.animScale ?? 1);

    if (this.configData.data.sized) {
      // Sized symbols (like 'AA') are already authored for the tile size, just apply the exact scale config
      this.spine.scale.set(customScale);
    } else {
      // Unsized symbols fit to bounds first, then scale
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

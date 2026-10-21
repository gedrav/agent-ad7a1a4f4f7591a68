import { Container } from 'pixi.js';
import { StandardView } from '@core/pixiwrapper/StandardView';
import { PixText } from '@core/pixiwrapper/PixText';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { Util } from '@core/utils/UtilService';
import { UIUtil } from '@core/utils/UIUtilService';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';

interface PayoutRow {
  key: string;
  value: string;
}

interface SymbolSize {
  width: number;
  height: number;
}

interface SizeLayout {
  rowHeight: number;
  valueGap: number;
  bgPaddingX: number;
  bgPaddingY: number;
  symbolGap: number;
}

interface PaytableBounds {
  reservedSize?: SymbolSize;
  maxSize?: SymbolSize;
}

const NO_RESERVED_SIZE: SymbolSize = { width: 0, height: 0 };
const NO_MAX_SIZE: SymbolSize = { width: Infinity, height: Infinity };
const MIN_FONT_SIZE = 16;

export class PaytableComp extends StandardView {
  private readonly bg: PixSprite;
  private readonly rowsContainer: Container = new Container();
  private currentSymbol: string | null = null;
  private activeLayout: SizeLayout = { rowHeight: 65, valueGap: 70, bgPaddingX: 40, bgPaddingY: 30, symbolGap: 40 };

  constructor(config: any) {
    super(config);
    this.bg = this.elementsList['bg'];
    this.addChild(this.rowsContainer);
    this.visible = false;

    EventHandler.addEventListener(SlotEvents.UPDATE_TOTALBET, this.refreshValues.bind(this));
  }

  public getSymbolGap(): number {
    return this.activeLayout.symbolGap;
  }

  public getXPadding(): number {
    return this.configData.xPadding ?? 0;
  }

  public getYPadding(): number {
    return this.configData.yPadding ?? 0;
  }

  public showComp(
    symbolName: string,
    symbolAtLeft: boolean,
    bgSizeKey?: string | number,
    bounds: PaytableBounds = {},
  ): void {
    const reservedSize = bounds.reservedSize ?? NO_RESERVED_SIZE;
    const maxSize = bounds.maxSize ?? NO_MAX_SIZE;

    this.currentSymbol = symbolName;
    this.clearRows();
    this.activeLayout = this.resolveLayout(bgSizeKey);
    this.setBackground(bgSizeKey);

    const rows = this.buildPayoutRows(symbolName);
    if (rows.length > 0) {
      EventHandler.dispatchEvent(SlotEvents.PLAY_GENERIC_SYMB_PAYOUT_SOUND);
      this.renderRows(rows, reservedSize, maxSize);
      this.layout(symbolAtLeft, reservedSize, maxSize);
      return;
    }

    const content = this.resolveFallbackContent(symbolName);
    if (content) {
      EventHandler.dispatchEvent(SlotEvents.PLAY_GENERIC_SYMB_PAYOUT_SOUND);
      this.renderContent(content, reservedSize, maxSize);
      this.layout(symbolAtLeft, reservedSize, maxSize);
      return;
    }

    this.visible = false;
    EventHandler.dispatchEvent(SlotEvents.HIDE_SYMBOL_PAYOUT);
  }

  private resolveLayout(sizeKey?: string | number): SizeLayout {
    const bySize = this.configData.layoutBySize ?? {};
    const override = bySize[sizeKey as any] ?? bySize.default ?? {};
    const flat = this.configData;

    return {
      rowHeight: override.rowHeight ?? flat.rowHeight ?? 65,
      valueGap: override.valueGap ?? flat.valueGap ?? 70,
      bgPaddingX: override.bgPaddingX ?? flat.bgPaddingX ?? 40,
      bgPaddingY: override.bgPaddingY ?? flat.bgPaddingY ?? 30,
      symbolGap: override.symbolGap ?? override.bgPaddingX ?? flat.symbolGap ?? flat.bgPaddingX ?? 40,
    };
  }

  private resolveFallbackContent(symbolName: string): string {
    const direct = Util.getContent(`${symbolName}payoutContent`);
    if (direct) return direct;

    const fallbackKeys = this.configData.fallbackContent ?? {};
    const fallbackKey = fallbackKeys[symbolName] ?? fallbackKeys.default;
    if (!fallbackKey) return '';

    return Util.getContent(fallbackKey) || fallbackKey;
  }

  private setBackground(sizeKey?: string | number): void {
    const bgMap = this.configData.bgBySize;
    const imageName = bgMap?.[sizeKey] ?? bgMap?.default;
    if (imageName) {
      this.bg.texture = UIUtil.getTexture(imageName);
    }
    this.bg.scale.set(this.configData.bgBaseScale ?? 1);
  }

  private refreshValues(): void {
    if (!this.visible || !this.currentSymbol) return;
    const rows = this.buildPayoutRows(this.currentSymbol);
    if (!rows.length) return;

    const valueTexts = this.rowsContainer.children.filter((child: any) => child.name === 'paytableValue') as PixText[];
    rows.forEach((row, i) => {
      if (valueTexts[i]) valueTexts[i].text = row.value;
    });
  }

  private buildPayoutRows(symbolName: string): PayoutRow[] {
    const data = appModel.getPaytableData()?.[symbolName];
    const rows: PayoutRow[] = [];
    if (!data) return rows;

    for (let i = 0; i < data.length; i++) {
      if (data[i] > 0) {
        rows.push({ key: `${i + 1} :`, value: Util.formatCurrency(appModel.getSymbolPayoutValue(data[i])) });
      }
    }
    return rows;
  }

  private availableContentSize(reservedSize: SymbolSize, maxSize: SymbolSize): SymbolSize {
    const { bgPaddingX: padX, bgPaddingY: padY, symbolGap: gap } = this.activeLayout;
    return {
      width: maxSize.width - reservedSize.width - gap - padX * 2,
      height: maxSize.height - padY * 2,
    };
  }

  private renderRows(rows: PayoutRow[], reservedSize: SymbolSize, maxSize: SymbolSize): void {
    const { rowHeight, valueGap } = this.activeLayout;
    const available = this.availableContentSize(reservedSize, maxSize);

    const totalHeight = rows.length * rowHeight;
    const scale = Math.min(1, available.height / totalHeight);
    const effectiveRowHeight = rowHeight * scale;
    const effectiveValueGap = valueGap * scale;

    const keyTexts = rows.map((row) =>
      UIUtil.getText({
        name: 'paytableKey',
        contentText: row.key,
        style: this.scaledStyle(this.configData.keyTextStyle, scale),
      }),
    );
    const valueTexts = rows.map((row) =>
      UIUtil.getText({
        name: 'paytableValue',
        contentText: row.value,
        style: this.scaledStyle(this.configData.valueTextStyle, scale),
      }),
    );

    const keyColumnWidth = Math.max(...keyTexts.map((t) => t.width));

    rows.forEach((_, i) => {
      const keyText = keyTexts[i];
      keyText.anchor.set(1, 0);
      keyText.x = keyColumnWidth;
      keyText.y = i * effectiveRowHeight;
      this.rowsContainer.addChild(keyText);

      const valueText = valueTexts[i];
      valueText.x = keyColumnWidth + effectiveValueGap;
      valueText.y = i * effectiveRowHeight;
      this.rowsContainer.addChild(valueText);
    });
  }

  private renderContent(content: string, reservedSize: SymbolSize, maxSize: SymbolSize): void {
    const { bgPaddingX: padX, bgPaddingY: padY, symbolGap: gap } = this.activeLayout;
    const comfortableHeight = this.bg.height - padY * 2;
    const maxWidth = maxSize.width - reservedSize.width - gap - padX * 2;
    const maxHeight = maxSize.height - padY * 2;
    const startWidth = Math.min(this.configData.contentTextStyle?.wordWrapWidth ?? maxWidth, maxWidth);

    const text = UIUtil.getText({
      name: 'paytableContent',
      contentText: content,
      style: { ...this.configData.contentTextStyle, wordWrapWidth: startWidth },
    });
    this.rowsContainer.addChild(text);
    this.fitTextToBox(text, startWidth, maxWidth, comfortableHeight, maxHeight);
  }

  private fitTextToBox(
    text: PixText,
    startWidth: number,
    maxWidth: number,
    comfortableHeight: number,
    maxHeight: number,
  ): void {
    let width = startWidth;
    const widthStep = Math.max(20, (maxWidth - startWidth) / 6);
    while (text.height > comfortableHeight && width < maxWidth) {
      width = Math.min(maxWidth, width + widthStep);
      text.style.wordWrapWidth = width;
    }

    let fontSize = text.style.fontSize;
    while (text.height > maxHeight && fontSize > MIN_FONT_SIZE) {
      fontSize -= 2;
      text.style.fontSize = fontSize;
    }
  }

  private scaledStyle(style: any, scale: number): any {
    if (scale >= 1 || !style?.fontSize) return style;
    return { ...style, fontSize: Math.max(MIN_FONT_SIZE, Math.round(style.fontSize * scale)) };
  }

  private clearRows(): void {
    this.rowsContainer.removeChildren().forEach((child) => child.destroy());
  }

  private layout(symbolAtLeft: boolean, reservedSize: SymbolSize, maxSize: SymbolSize): void {
    this.visible = true;

    const { bgPaddingX: padX, bgPaddingY: padY, symbolGap: gap } = this.activeLayout;

    const baseWidth = this.bg.width;
    const baseHeight = this.bg.height;
    const contentWidth = this.rowsContainer.width;
    const contentHeight = this.rowsContainer.height;

    const neededWidth = reservedSize.width + gap + contentWidth + padX * 2;
    const neededHeight = Math.max(reservedSize.height, contentHeight) + padY * 2;

    this.bg.width = Math.min(maxSize.width, Math.max(baseWidth, neededWidth));
    this.bg.height = Math.min(maxSize.height, Math.max(baseHeight, neededHeight));

    this.rowsContainer.x = symbolAtLeft
      ? padX + reservedSize.width + gap
      : this.bg.width - padX - reservedSize.width - gap - contentWidth;
    this.rowsContainer.y = (this.bg.height - contentHeight) / 2;
  }
}

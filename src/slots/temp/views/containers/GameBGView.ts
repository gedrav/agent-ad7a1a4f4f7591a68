import { BGView } from '@core/views/bg/BGView';

// Orientation is handled entirely by GameBGConfig's layoutData. There is deliberately no skin
// switch on resize here: this game's bg spine ships a single 'default' skin, setSkin() throws on
// an unknown name, and resizeView runs inside the APP_RESIZE listener - so asking for a 'Portrait'
// skin threw before super.resizeView() and stopped every listener after this one from resizing at
// all. If per-orientation skins are ever added to bg.json, the switch can come back.
export class GameBGView extends BGView {}

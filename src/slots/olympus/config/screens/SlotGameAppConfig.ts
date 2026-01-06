import { GAME_BG_CONFIG } from '@game/config/screens/GameBGConfig';
import { SLOT_MACHINE_CONFIG } from '@game/config/screens/SlotMachineConfig';
import { CONTROL_PANEL_CONFIG } from '@core/config/ControlPanelConfig';
import { MODAL_VIEW_CONFIG } from '@core/config/ModalConfig';
import { BET_PANEL_CONFIG } from '@core/config/BetPanelConfig';
import { AUTOPLAY_CONFIG } from '@core/config/AutoPlayConfig';
import { BUY_BONUS_CONFIG } from '@core/config/BuyBonusConfig';
import { FS_POPUP_CONFIG } from '@game/config/screens/FSPopupConfig';
import { MESSAGE_POPUP_CONFIG } from '@core/config/MessagePopupConfig';

export const SLOT_GAME_APP_CONFIG: any = {
  name: 'SLOT_GAME_APP_CONFIG',
  Elements: [
    GAME_BG_CONFIG,
    SLOT_MACHINE_CONFIG,
    CONTROL_PANEL_CONFIG,
    MODAL_VIEW_CONFIG,
    BET_PANEL_CONFIG,
    BUY_BONUS_CONFIG,
    AUTOPLAY_CONFIG,
    FS_POPUP_CONFIG,
    MESSAGE_POPUP_CONFIG,
  ],
};

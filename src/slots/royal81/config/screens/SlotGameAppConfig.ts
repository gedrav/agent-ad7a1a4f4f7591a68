import { GAME_BG_CONFIG } from '@game/config/screens/GameBGConfig';
import { SLOT_MACHINE_CONFIG } from '@game/config/screens/SlotMachineConfig';
import { FS_POPUP_CONFIG } from '@game/config/screens/FSPopupConfig';
import { createControlPanelConfig } from '@brand/config/ControlPanelConfig';
import { MODAL_VIEW_CONFIG } from '@brand/config/ModalConfig';
import { BET_PANEL_CONFIG } from '@brand/config/BetPanelConfig';
import { BUY_BONUS_CONFIG } from '@brand/config/BuyBonusConfig';
import { AUTOPLAY_CONFIG } from '@brand/config/AutoPlayConfig';
import { MESSAGE_POPUP_CONFIG } from '@brand/config/MessagePopupConfig';
import { MENU_CONFIG } from '@brand/config/MenuConfig';
import { MENU_CONFIG_MOBILE } from '@brand/config/MenuConfigMobile';
import { BUY_BONUS_CONFIG_MOBILE } from '@brand/config/BuyBonusConfigMobile';
import { FREESPIN_INFO_COMP_CONFIG } from '@game/config/screens/FreespinInfoCompConfig';

export const SLOT_GAME_APP_CONFIG: any = {
  name: 'SLOT_GAME_APP_CONFIG',
  Elements: [
    GAME_BG_CONFIG,
    SLOT_MACHINE_CONFIG,
    createControlPanelConfig(FREESPIN_INFO_COMP_CONFIG),
    MODAL_VIEW_CONFIG,
    MENU_CONFIG,
    MENU_CONFIG_MOBILE,
    BET_PANEL_CONFIG,
    BUY_BONUS_CONFIG,
    BUY_BONUS_CONFIG_MOBILE,
    AUTOPLAY_CONFIG,
    MESSAGE_POPUP_CONFIG,
  ],
};

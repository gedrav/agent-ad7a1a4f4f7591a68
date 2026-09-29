import { GAME_BG_CONFIG } from '@game/config/screens/GameBGConfig';
import { SLOT_MACHINE_CONFIG } from '@game/config/screens/SlotMachineConfig';
import { createControlPanelConfig } from '@brand/config/ControlPanelConfig';
import { MODAL_VIEW_CONFIG } from '@brand/config/ModalConfig';
import { BET_PANEL_CONFIG } from '@brand/config/BetPanelConfig';
import { BUY_BONUS_CONFIG } from '@brand/config/BuyBonusConfig';
import { AUTOPLAY_CONFIG } from '@brand/config/AutoPlayConfig';
import { MESSAGE_POPUP_CONFIG } from '@brand/config/MessagePopupConfig';
import { MENU_CONFIG } from '@brand/config/MenuConfig';
import { MENU_CONFIG_MOBILE } from '@brand/config/MenuConfigMobile';
import { MINEDASH_FS_POPUP_CONFIG } from './MineDashFSPopupConfig';
import { SECONDARY_WAITING_SCREEN_CONFIG } from '@brand/config/SecondaryWaitingScreenConfig';
import { PROMOFS_POPUP_CONFIG } from '@brand/config/PromoFSPopupConfig';

export const SLOT_GAME_APP_CONFIG: any = {
  name: 'SLOT_GAME_APP_CONFIG',
  Elements: [
    GAME_BG_CONFIG,
    SLOT_MACHINE_CONFIG,
    createControlPanelConfig(null),
    MODAL_VIEW_CONFIG,
    MENU_CONFIG,
    MENU_CONFIG_MOBILE,
    BET_PANEL_CONFIG,
    BUY_BONUS_CONFIG,
    AUTOPLAY_CONFIG,
    MINEDASH_FS_POPUP_CONFIG,
    MESSAGE_POPUP_CONFIG,
    SECONDARY_WAITING_SCREEN_CONFIG,
    PROMOFS_POPUP_CONFIG,
  ],
};

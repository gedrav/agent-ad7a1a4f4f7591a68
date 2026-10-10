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
import { SECONDARY_WAITING_SCREEN_CONFIG } from '@brand/config/SecondaryWaitingScreenConfig';
import { PROMOFS_POPUP_CONFIG } from '@brand/config/PromoFSPopupConfig';
import { JP_HIT_NOTIFICATION_CONFIG } from '@brand/config/JPHItNotificationConfig';
import { TRANSITION_CONFIG } from './TransitionConfig';
import { BUY_BONUS_SCREEN_CONFIG } from './BuyBonusScreenConfig';
import { RESPIN_INTRO_CONFIG } from './RespinIntroConfig';
import { JCBetPanelView } from '@slots/jokercharge/views/popups/JCBetPanelView';

// brandlib's bet panel, with buttons that follow the bets the line count allows - see JCBetPanelView.
const JC_BET_PANEL_CONFIG = { ...BET_PANEL_CONFIG, class: JCBetPanelView };

export const SLOT_GAME_APP_CONFIG: any = {
  name: 'SLOT_GAME_APP_CONFIG',
  Elements: [
    GAME_BG_CONFIG,
    SLOT_MACHINE_CONFIG,
    // Before TRANSITION_CONFIG so the transition animation plays over the top of the intro.
    RESPIN_INTRO_CONFIG,
    BUY_BONUS_SCREEN_CONFIG,
    TRANSITION_CONFIG,
    createControlPanelConfig(null),
    MODAL_VIEW_CONFIG,
    MENU_CONFIG,
    MENU_CONFIG_MOBILE,
    JC_BET_PANEL_CONFIG,
    BUY_BONUS_CONFIG,
    AUTOPLAY_CONFIG,
    MESSAGE_POPUP_CONFIG,
    SECONDARY_WAITING_SCREEN_CONFIG,
    PROMOFS_POPUP_CONFIG,
    JP_HIT_NOTIFICATION_CONFIG,
  ],
};

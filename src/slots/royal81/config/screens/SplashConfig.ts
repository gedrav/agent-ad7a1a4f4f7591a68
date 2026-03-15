import { SplashStartCommand } from '@core/commands/action/SplashStartCommand';
import { UIConfig } from '@game/config/UIConfig';
import { SplashView } from '@brand/views/splash/SplashView';
import { SplashItemComp } from '@brand/views/splash/SplashItemComp';
import { UIUtil } from '@core/utils/UIUtilService';
import { CoreUIConfig } from '@brand/config/CoreUIConfig';
import { SoundStateChangeCommand } from '@core/commands/action/SoundStateChangeCommand';
import { ChangeTotalBetCommand } from '@core/commands/action/ChangeTotalBetCommand';
import { Point } from 'pixi.js';
import { MenuButton } from '@brand/views/comps/MenuButton';
import { HomeClickedCommand } from '@core/commands/action/HomeClickedCommand';
import { SplashButton } from '@brand/views/comps/SplashButton';
export const SPLASH_CONFIG: any = {
  name: 'splashView',
  type: 'Comp',
  class: SplashView,
  itemsDesktopScale: 0.5,
  contents: [
    {
      name: 'item1',
      type: 'Comp',
      class: SplashItemComp,
      image: 'screen1',
      content: 'splash1',
      textY: 620,
      textStyle: {
        name: 'contentTxt',
        type: 'Text',
        destroy: true,
        style: { fontFamily: 'commonFont', fontWeight: 700, fill: 0x000000, fontSize: 60, anchor: { x: 0.5, y: 0.5 } },
      },
    },
    {
      name: 'item2',
      type: 'Comp',
      class: SplashItemComp,
      image: 'screen2',
      content: 'splash2',
      textY: 620,
      textStyle: {
        name: 'contentTxt',
        type: 'Text',
        destroy: true,
        style: { fontFamily: 'commonFont', fontWeight: 700, fill: 0x000000, fontSize: 60, anchor: { x: 0.5, y: 0.5 } },
      },
    },
  ],
  Elements: [
    {
      name: 'maingameBG',
      type: 'Sprite',
      image: 'maingameBG',
      layoutData: {
        Desktop: { hAlign: 'center', vAlign: 'middle', fitToScreen: true },
        Portrait: { hAlign: 'center', vAlign: 'middle', fitToScreen: true },
        Landscape: { hAlign: 'center', vAlign: 'middle', fitToScreen: true },
      },
    },
    {
      name: 'coverRect',
      type: 'Graphics',
      width: 200,
      height: 200,
      color: 0xffffff,
      alpha: 0.5,
      layoutData: {
        Desktop: { hAlign: 'center', vAlign: 'middle', fitToScreen: true },
        Portrait: { hAlign: 'center', vAlign: 'middle', fitToScreen: true },
        Landscape: { hAlign: 'center', vAlign: 'middle', fitToScreen: true },
      },
    },
    { name: 'guideRect', type: 'Graphics', width: 200, height: 200, color: 0xff0000, alpha: 0 },

    {
      name: 'brandLogo',
      type: 'Sprite',
      image: 'brandLogo',
      anchor: { x: 0.5, y: 0.5 },
      layoutData: {
        Desktop: {
          widthPerc: 0.06,
          heightPerc: 0.06,
          hAlign: 'left',
          vAlign: 'top',
          hPaddingPerc: 0.005,
          vPaddingPerc: 0.01,
          maxScale: 1,
        },
        Landscape: {
          widthPerc: 0.1,
          heightPerc: 0.14,
          hAlign: 'left',
          vAlign: 'top',
          hPaddingPerc: 0.01,
          vPaddingPerc: 0.01,
          maxScale: 1,
        },
        Portrait: {
          widthPerc: 0.2,
          heightPerc: 0.08,
          hAlign: 'left',
          vAlign: 'top',
          hPaddingPerc: 0.02,
          vPaddingPerc: 0.01,
          maxScale: 1,
        },
      },
    },
    {
      name: 'buttonsGuideRect',
      type: 'Graphics',
      width: 200,
      height: 200,
      color: 0x0000ff,
      alpha: 0,
      layoutData: {
        Desktop: {
          hAlign: 'center',
          vAlign: 'bottom',
          widthPercForce: 0.2,
          heightPercForce: 0.2,
          vPaddingPerc: -0.08,
        },
        Portrait: { hAlign: 'center', vAlign: 'bottom', widthPercForce: 0.8, heightPercForce: 0.28 },
        Landscape: {
          hAlign: 'right',
          vAlign: 'middle',
          hPaddingPerc: -0.02,
          widthPercForce: 0.3,
          heightPercForce: 0.8,
        },
      },
    },
    {
      name: 'gameTitle',
      type: 'Sprite',
      image: 'gamelogo',
      anchor: { x: 0.5, y: 0.5 },
      layoutData: {
        Desktop: { widthPerc: 0.5, heightPerc: 0.16, maxScale: 1, hAlign: 'center', vPosition: 0.14 },
        Portrait: {
          widthPerc: 0.7,
          heightPerc: 0.16,
          maxScale: 1,
          hAlign: 'center',
          vAlign: 'top',
          vPaddingPerc: 0.05,
        },
        Landscape: { refComponent: 'buttonsGuideRect', widthPerc: 1, maxScale: 1, hAlign: 'center', vPosition: 0.1 },
      },
    },
    {
      name: 'startBtn',
      type: 'GraphicsButton',
      anchor: { x: 0.5, y: 0.5 },
      action: {
        press: SplashStartCommand,
      },
      textConfig: {
        content: 'playGameText',
        style: { fontFamily: 'commonFont', fontSize: 36, fill: 0xffffff, fontWeight: 'bold' },
        anchor: { x: 0.5, y: 0.5 },
      },
      graphics: {
        width: 548,
        height: 88,
        radius: 16,
        color: 0x000000,
        hoverColor: 0x404040,
        pressedColor: 0x000000,
        disabledColor: 0xcccccc,
        animations: CoreUIConfig.buttonStates,
      },
      layoutData: {
        Desktop: {
          refComponent: 'buttonsGuideRect',
          widthPerc: 1,
          maxScale: 1,
          hAlign: 'center',
          vAlign: 'top',
        },
        Portrait: { refComponent: 'buttonsGuideRect', widthPerc: 1, maxScale: 1, hAlign: 'center', vAlign: 'top' },
        Landscape: { refComponent: 'buttonsGuideRect', widthPerc: 1, maxScale: 1, hAlign: 'center', vPosition: 0.4 },
      },
    },
    {
      name: 'soundSettingsContainer',
      type: 'Container',
      Elements: [
        {
          name: 'soundOnBtn',
          type: 'Comp',
          class: SplashButton,
          btnConfig: {
            action: {
              press: HomeClickedCommand,
            },
            options: {
              defaultView: 'transRect',
              hoverView: 'transRect',
              pressedView: 'transRect',
              disabledView: 'transRect',
              animations: CoreUIConfig.noScalebuttonStates,
              nineSliceSprite: [12, 12, 12, 12],
            },
          },
          icon: 'generalCPBtn',
          icon2: 'soundOnIcon',
          textConfig: {
            name: 'btnText',
            type: 'Text',
            destroy: true,
            x: 80,
            y: 10,
            content: 'turnOffSoundText',
            style: {
              fontFamily: 'commonFont',
              fontWeight: 400,
              fill: 0x000000,
              fontSize: 32,
              anchor: { x: 0, y: 0 },
            },
          },
        },
        {
          name: 'soundOffBtn',
          type: 'Comp',
          class: SplashButton,
          btnConfig: {
            action: {
              press: HomeClickedCommand,
            },
            options: {
              defaultView: 'transRect',
              hoverView: 'transRect',
              pressedView: 'transRect',
              disabledView: 'transRect',
              animations: CoreUIConfig.noScalebuttonStates,
              nineSliceSprite: [12, 12, 12, 12],
            },
          },
          icon: 'generalCPBtn',
          icon2: 'soundOffIcon',
          textConfig: {
            name: 'btnText',
            type: 'Text',
            destroy: true,
            x: 80,
            y: 10,
            content: 'turnOffSoundText',
            style: {
              fontFamily: 'commonFont',
              fontWeight: 400,
              fill: 0x000000,
              fontSize: 32,
              anchor: { x: 0, y: 0 },
            },
          },
          visible: false,
        },
      ],
      layoutData: {
        Desktop: { refComponent: 'buttonsGuideRect', widthPerc: 0.7, maxScale: 1, hAlign: 'center', vPosition: 0.4 },
        Portrait: { refComponent: 'buttonsGuideRect', widthPerc: 0.5, maxScale: 1, hAlign: 'center', vPosition: 0.4 },
        Landscape: { refComponent: 'buttonsGuideRect', widthPerc: 0.6, maxScale: 1, hAlign: 'center', vPosition: 0.5 },
      },
    },
    {
      name: 'dontShowMessage',
      type: 'Container',
      Elements: [
        {
          name: 'showOnBtn',
          type: 'Comp',
          class: SplashButton,
          btnConfig: {
            action: {
              press: HomeClickedCommand,
            },
            options: {
              defaultView: 'transRect',
              hoverView: 'transRect',
              pressedView: 'transRect',
              disabledView: 'transRect',
              animations: CoreUIConfig.noScalebuttonStates,
              nineSliceSprite: [12, 12, 12, 12],
            },
          },
          icon: 'checkBox',
          textConfig: {
            name: 'btnText',
            type: 'Text',
            destroy: true,
            x: 80,
            y: 10,
            content: 'dontShowMessage',
            style: {
              fontFamily: 'commonFont',
              fontWeight: 400,
              fill: 0x000000,
              fontSize: 32,
              anchor: { x: 0, y: 0 },
            },
          },
        },
        {
          name: 'showOffBtn',
          type: 'Comp',
          class: SplashButton,
          btnConfig: {
            action: {
              press: HomeClickedCommand,
            },
            options: {
              defaultView: 'transRect',
              hoverView: 'transRect',
              pressedView: 'transRect',
              disabledView: 'transRect',
              animations: CoreUIConfig.noScalebuttonStates,
              nineSliceSprite: [12, 12, 12, 12],
            },
          },
          icon: 'checkBoxSelected',
          textConfig: {
            name: 'btnText',
            type: 'Text',
            destroy: true,
            x: 80,
            y: 10,
            content: 'dontShowMessage',
            style: {
              fontFamily: 'commonFont',
              fontWeight: 400,
              fill: 0x000000,
              fontSize: 32,
              anchor: { x: 0, y: 0 },
            },
          },
          visible: false,
        },
      ],
      layoutData: {
        Desktop: { refComponent: 'buttonsGuideRect', widthPerc: 1, maxScale: 1, hAlign: 'center', vPosition: 0.7 },
        Portrait: { refComponent: 'buttonsGuideRect', widthPerc: 1, maxScale: 1, hAlign: 'center', vPosition: 0.7 },
        Landscape: { refComponent: 'buttonsGuideRect', widthPerc: 1, maxScale: 1, hAlign: 'center', vPosition: 0.7 },
      },
    },
  ],
};

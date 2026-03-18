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
        style: {
          fontFamily: 'commonFont',
          fontWeight: 700,
          fill: 0x000000,
          fontSize: 36,
          mFontSize: 50,
          anchor: { x: 0.5, y: 0.5 },
        },
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
        style: {
          fontFamily: 'commonFont',
          fontWeight: 700,
          fill: 0x000000,
          fontSize: 36,
          mFontSize: 50,
          anchor: { x: 0.5, y: 0.5 },
        },
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
      name: 'controlsContainer',
      type: 'Container',
      Elements: [
        {
          name: 'guideRect',
          type: 'Graphics',
          width: 548,
          height: 360,
          color: 0x0000ff,
          alpha: 0,
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
            style: { fontFamily: 'commonFont', fontSize: 32, fill: 0xffffff, fontWeight: 'bold' },
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
          x: 274,
          y: 44,
        },
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
          layoutData: {
            Desktop: { refComponent: 'guideRect', hAlign: 'center', vPosition: 0.4 },
            Landscape: { refComponent: 'guideRect', hAlign: 'left', vPosition: 0.4 },
            Portrait: { refComponent: 'guideRect', hAlign: 'center', vPosition: 0.4 },
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
            content: 'turnOnSoundText',
            style: {
              fontFamily: 'commonFont',
              fontWeight: 400,
              fill: 0x000000,
              fontSize: 32,
              anchor: { x: 0, y: 0 },
            },
          },
          visible: false,
          layoutData: {
            Desktop: { refComponent: 'guideRect', hAlign: 'center', vPosition: 0.4 },
            Landscape: { refComponent: 'guideRect', hAlign: 'left', vPosition: 0.4 },
            Portrait: { refComponent: 'guideRect', hAlign: 'center', vPosition: 0.4 },
          },
        },
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
              wordWrap: true,
              wordWrapWidth: 520,
              anchor: { x: 0, y: 0 },
            },
          },
          layoutData: {
            Desktop: { refComponent: 'guideRect', hAlign: 'center', vPosition: 0.7 },
            Landscape: { refComponent: 'guideRect', hAlign: 'left', vPosition: 0.7 },
            Portrait: { refComponent: 'guideRect', hAlign: 'center', vPosition: 0.7 },
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
              wordWrap: true,
              wordWrapWidth: 520,
              anchor: { x: 0, y: 0 },
            },
          },
          visible: false,
          layoutData: {
            Desktop: { refComponent: 'guideRect', hAlign: 'center', vPosition: 0.7 },
            Landscape: { refComponent: 'guideRect', hAlign: 'left', vPosition: 0.7 },
            Portrait: { refComponent: 'guideRect', hAlign: 'center', vPosition: 0.7 },
          },
        },
      ],
      layoutData: {
        Desktop: {
          hAlign: 'center',
          vAlign: 'bottom',
          widthPerc: 0.22,
          heightPerc: 0.28,
          vPaddingPerc: -0.04,
          minScale: 0.3,
        },
        Portrait: {
          hAlign: 'center',
          vAlign: 'bottom',
          widthPerc: 0.8,
          heightPerc: 0.24,
          vPaddingPerc: -0.02,
        },
        Landscape: {
          hAlign: 'right',
          vAlign: 'middle',
          vPaddingPerc: 0.1,
          hPaddingPerc: -0.02,
          widthPerc: 0.3,
          heightPerc: 0.8,
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
        Landscape: {
          refComponent: 'controlsContainer',
          widthPerc: 1,
          heightPerc: 0.8,
          maxScale: 1,
          hAlign: 'center',
          vAlign: 'topUp',
          vPaddingPerc: -0.1,
        },
      },
    },
  ],
};

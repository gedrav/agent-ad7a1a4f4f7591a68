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
  itemsDesktopScale: 1,
  contents: [
    {
      name: 'item1',
      type: 'Comp',
      class: SplashItemComp,
      image: 'screen1',
      content: 'splash1',
      textY: 560,
      textStyle: {
        name: 'contentTxt',
        type: 'Text',
        destroy: true,
        style: {
          fontFamily: 'gameFont1',
          fontWeight: 700,
          fill: [0xffed54, 0xf5a100],
          stroke: 0x000000,
          strokeThickness: 2,
          fontSize: 50,
          mFontSize: 50,
          anchor: { x: 0.5, y: 0.5 },
          dropShadow: {
            angle: 0.5235987755982988,
            blur: 4, // use 0 or a positive value in v8
            color: '0x000000',
            distance: 4,
            alpha: 1,
          },
        },
      },
    },
    {
      name: 'item2',
      type: 'Comp',
      class: SplashItemComp,
      image: 'screen2',
      content: 'splash2',
      textY: 560,
      textStyle: {
        name: 'contentTxt',
        type: 'Text',
        destroy: true,
        style: {
          fontFamily: 'gameFont1',
          fontWeight: 700,
          fill: [0xffed54, 0xf5a100],
          stroke: 0x000000,
          strokeThickness: 2,
          fontSize: 50,
          mFontSize: 50,
          anchor: { x: 0.5, y: 0.5 },
          dropShadow: {
            angle: 0.5235987755982988,
            blur: 4, // use 0 or a positive value in v8
            color: '0x000000',
            distance: 4,
            alpha: 1,
          },
        },
      },
    },
    {
      name: 'item3',
      type: 'Comp',
      class: SplashItemComp,
      image: 'screen3',
      content: 'splash3',
      textY: 560,
      textStyle: {
        name: 'contentTxt',
        type: 'Text',
        destroy: true,
        style: {
          fontFamily: 'gameFont1',
          fontWeight: 700,
          fill: [0xffed54, 0xf5a100],
          stroke: 0x000000,
          strokeThickness: 2,
          fontSize: 50,
          mFontSize: 50,
          anchor: { x: 0.5, y: 0.5 },
          dropShadow: {
            angle: 0.5235987755982988,
            blur: 4, // use 0 or a positive value in v8
            color: '0x000000',
            distance: 4,
            alpha: 1,
          },
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
      alpha: 0.25,
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
      type: 'ResponsiveChildrenContainer',
      Elements: [
        {
          name: 'guideRect',
          type: 'Graphics',
          width: 548,
          height: 280,
          color: 0x0000ff,
          alpha: 0,
        },
        {
          name: 'startBtn',
          type: 'Button',
          anchor: { x: 0.5, y: 0.5 },
          action: {
            press: SplashStartCommand,
          },
          options: {
            defaultView: 'splashBtn',
            hoverView: 'splashBtn',
            pressedView: 'splashBtn',
            disabledView: 'splashBtn',
            animations: CoreUIConfig.noScalebuttonStates,
            textOffset: new Point(0, 8),
          },
          textConfig: {
            content: 'playGameText',
            style: { fontFamily: 'gameFont1', fontSize: 50, fill: [0xffed54, 0xf5a100], fontWeight: 'bold' },
            anchor: { x: 0.5, y: 0.5 },
          },
          x: 274,
          y: 85,
          layoutData: {
            Desktop: { refComponent: 'guideRect', vAlign: 'top', widthPerc: 1, heightPerc: 0.5, maxScale: 1 },
          },
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
            Desktop: { refComponent: 'guideRect', hAlign: 'center', vPosition: 0.45 },
            Landscape: { refComponent: 'guideRect', hAlign: 'left', vPosition: 0.5 },
            Portrait: { refComponent: 'guideRect', hAlign: 'center', vPosition: 0.5 },
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
            Desktop: { refComponent: 'guideRect', hAlign: 'center', vPosition: 0.45 },
            Landscape: { refComponent: 'guideRect', hAlign: 'left', vPosition: 0.5 },
            Portrait: { refComponent: 'guideRect', hAlign: 'center', vPosition: 0.5 },
          },
        },
        {
          name: 'showIntroOnBtn',
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
            Landscape: { refComponent: 'guideRect', hAlign: 'left', vPosition: 0.7, hPadding: -5.5 },
            Portrait: { refComponent: 'guideRect', hAlign: 'center', vPosition: 0.7 },
          },
        },
        {
          name: 'showIntroOffBtn',
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
          icon: 'generalCPSelectedBtn',
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
          widthPerc: 0.3,
          heightPerc: 0.28,
          vPaddingPerc: -0.04,
          minScale: 0.3,
          maxScale: 1,
        },
        Portrait: {
          hAlign: 'center',
          vAlign: 'bottom',
          widthPerc: 0.8,
          heightPerc: 0.24,
          vPaddingPerc: -0.06,
        },
        Landscape: {
          hAlign: 'right',
          vAlign: 'middle',
          vPaddingPerc: 0.19,
          hPaddingPerc: -0.04,
          widthPerc: 0.3,
          heightPerc: 1,
        },
      },
    },
    {
      name: 'gameTitle',
      type: 'Sprite',
      image: 'gamelogo',
      anchor: { x: 0.5, y: 0.5 },
      layoutData: {
        Desktop: { widthPerc: 0.5, heightPerc: 0.13, maxScale: 1, hAlign: 'center', vPosition: 0.12 },
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
          vPaddingPerc: -0.4,
        },
      },
    },
  ],
};

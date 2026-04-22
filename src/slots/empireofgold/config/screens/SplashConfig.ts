import { SplashStartCommand } from '@core/commands/action/SplashStartCommand';
import { SplashView } from '@brand/views/splash/SplashView';
import { SplashItemComp } from '@brand/views/splash/SplashItemComp';
import { CoreUIConfig } from '@brand/config/CoreUIConfig';
import { Point } from 'pixi.js';
import { SplashButton } from '@brand/views/comps/SplashButton';
import { AutoPlayNoOfSpinsBtnCommand } from '@core/commands/action/AutoPlayNoOfSpinsBtnCommand';
import { PixToggleButton } from '@core/pixiwrapper/PixToggleButton';

const fontMLProps = { sk: { fontSize: 45 } };

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
      textY: 650,
      textAreaHeight: 240,
      textStyle: {
        name: 'contentTxt',
        type: 'Text',
        destroy: true,
        fontMLProps: fontMLProps,
        style: {
          fontFamily: 'gameFont1',
          fontWeight: 700,
          breakWords: true,
          fill: [0xffed54, 0xf5a100],
          stroke: 0x000000,
          strokeThickness: 2,
          fontSize: 50,
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
      textY: 650,
      textAreaHeight: 240,
      textStyle: {
        name: 'contentTxt',
        type: 'Text',
        destroy: true,
        style: {
          fontFamily: 'gameFont1',
          fontWeight: 700,
          breakWords: true,
          fill: [0xffed54, 0xf5a100],
          stroke: 0x000000,
          strokeThickness: 2,
          fontSize: 50,
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
      textY: 650,
      textAreaHeight: 240,
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
      image: 'splashbg',
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
          widthPerc: 0.08,
          heightPerc: 0.08,
          hAlign: 'left',
          vAlign: 'top',
          hPaddingPerc: 0.01,
          vPaddingPerc: 0.01,
          maxScale: 1,
        },
        Portrait: {
          widthPerc: 0.12,
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
      name: 'soundBtn',
      type: 'PixToggleButton',
      soundEvent: 'PLAY_GENERIC_BUTTON_SOUND',
      scale: 1,
      options: {
        defaultView: 'soundOnBtn',
        hoverView: 'soundOnBtn',
        pressedView: 'soundOnBtn',
        disabledView: 'soundOnBtn',
        animations: CoreUIConfig.buttonStates,
      },
      selectedOptions: {
        defaultView: 'soundOffBtn',
        hoverView: 'soundOffBtn',
        pressedView: 'soundOffBtn',
        disabledView: 'soundOffBtn',
        animations: CoreUIConfig.buttonStates,
      },
      layoutData: {
        Desktop: { hAlign: 'right', vAlign: 'top', hPaddingPerc: -0.005, vPaddingPerc: 0.01, scale: 0.6 },
        Landscape: { hAlign: 'right', vAlign: 'top', hPaddingPerc: -0.01, vPaddingPerc: 0.01, scale: 0.5 },
        Portrait: { hAlign: 'right', vAlign: 'top', hPaddingPerc: -0.02, vPaddingPerc: 0.01, scale: 0.5 },
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
          height: 220,
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
          soundEvent: 'PLAY_GENERIC_BUTTON_SOUND',
          options: {
            defaultView: 'splashBtn',
            hoverView: 'splashBtn',
            pressedView: 'splashBtn',
            disabledView: 'splashBtn',
            animations: CoreUIConfig.noScalebuttonStates,
            textOffset: new Point(0, 6),
          },
          textConfig: {
            content: 'playGameText',
            style: {
              fontFamily: 'gameFont1',
              fontWeight: 700,
              fill: [0xffed54, 0xf5a100],
              stroke: 0x000000,
              strokeThickness: 2,
              fontSize: 40,
              mFontSize: 40,
              anchor: { x: 0.5, y: 0.5 },
              dropShadow: {
                angle: 0.5235987755982988,
                blur: 4, // use 0 or a positive value in v8
                color: '0x000000',
                distance: 3,
                alpha: 1,
              },
            },
            anchor: { x: 0.5, y: 0.5 },
            fontMLProps: { lt: { fontSize: 36 } },
          },
          x: 274,
          y: 85,
          layoutData: {
            Desktop: { refComponent: 'guideRect', vAlign: 'top', widthPerc: 1, heightPerc: 0.7, maxScale: 1 },
          },
        },
        {
          name: 'showIntroBtn',
          type: 'Comp',
          class: SplashButton,
          soundEvent: 'PLAY_GENERIC_BUTTON_SOUND',
          btnConfig: {
            type: 'PixToggleButton',
            scale: 1,
            action: {
              press: AutoPlayNoOfSpinsBtnCommand,
            },
            options: {
              defaultView: 'generalCPBtn',
              hoverView: 'generalCPBtn',
              pressedView: 'generalCPBtn',
              disabledView: 'generalCPBtn',
              animations: CoreUIConfig.buttonStates,
            },
            selectedOptions: {
              defaultView: 'generalCPSelectedBtn',
              hoverView: 'generalCPSelectedBtn',
              pressedView: 'generalCPSelectedBtn',
              disabledView: 'generalCPSelectedBtn',
              animations: CoreUIConfig.buttonStates,
            },
          },
          textConfig: {
            name: 'btnText',
            type: 'Text',
            destroy: true,
            x: 80,
            y: 0,
            content: 'dontShowMessage',
            style: {
              fontFamily: 'commonFont',
              fontWeight: 400,
              fill: 0x000000,
              fontSize: 40,
              anchor: { x: 0, y: 0.5 },
            },
          },
          layoutData: {
            Desktop: { refComponent: 'guideRect', hAlign: 'center', vAlign: 'bottom', vPaddingPerc: -0.05, scale: 0.6 },
          },
        },
      ],
      layoutData: {
        Desktop: {
          hAlign: 'center',
          vAlign: 'bottom',
          widthPerc: 0.5,
          heightPerc: 0.28,
          vPaddingPerc: -0.01,
          maxScale: 1,
        },
        Portrait: {
          hAlign: 'center',
          vAlign: 'bottom',
          widthPerc: 0.8,
          heightPerc: 0.2,
          vPaddingPerc: -0.01,
          maxScale: 1,
        },
        Landscape: {
          hAlign: 'center',
          vAlign: 'bottom',
          vPaddingPerc: -0.02,
          hPaddingPerc: 0,
          widthPerc: 0.36,
          heightPerc: 0.22,
        },
      },
    },
    {
      name: 'gameTitle',
      type: 'Sprite',
      image: 'empireLogo',
      anchor: { x: 0.5, y: 0.5 },
      layoutData: {
        Desktop: { widthPerc: 0.5, heightPerc: 0.1, maxScale: 1, hAlign: 'center', vPosition: 0.06 },
        Portrait: {
          widthPerc: 0.6,
          heightPerc: 0.12,
          maxScale: 1,
          hAlign: 'center',
          vAlign: 'top',
          vPaddingPerc: 0.05,
        },
        Landscape: {
          widthPerc: 0.36,
          heightPerc: 0.12,
          maxScale: 1,
          hAlign: 'center',
          vAlign: 'top',
          vPaddingPerc: 0.02,
        },
      },
    },
  ],
};

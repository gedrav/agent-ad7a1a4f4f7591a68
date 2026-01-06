import { SplashView } from '@core/views/splash/SplashView';
import { SplashStartCommand } from '@core/commands/action/SplashStartCommand';
import { UIConfig } from '@game/config/UIConfig';
import { SplashItemComp } from '@core/views/splash/SplashItemComp';
export const SPLASH_CONFIG: any = {
  name: 'splashView',
  type: 'Comp',
  class: SplashView,
  contents: [
    {
      name: 'item1',
      type: 'Comp',
      class: SplashItemComp,
      image: 'screen1',
      content: 'splash1',
      textY: 710,
      textStyle: {
        name: 'contentTxt',
        type: 'Text',
        destroy: true,
        style: { fontFamily: 'gameFont1', fill: 0xffffff, fontSize: 60, anchor: { x: 0, y: 0.5 } },
      },
    },
    {
      name: 'item2',
      type: 'Comp',
      class: SplashItemComp,
      image: 'screen2',
      content: 'splash2',
      textY: 710,
      textStyle: {
        name: 'contentTxt',
        type: 'Text',
        destroy: true,
        style: { fontFamily: 'gameFont1', fill: 0xffffff, fontSize: 60, anchor: { x: 0, y: 0.5 } },
      },
    },
    {
      name: 'item3',
      type: 'Comp',
      class: SplashItemComp,
      image: 'screen3',
      content: 'splash3',
      textY: 680,
      textStyle: {
        name: 'contentTxt',
        type: 'Text',
        destroy: true,
        style: { fontFamily: 'gameFont1', fill: 0xffffff, fontSize: 60, anchor: { x: 0, y: 0.5 } },
      },
    },
  ],
  Elements: [
    { name: 'guideRect', type: 'Graphics', width: 200, height: 200, color: 0xff0000, alpha: 1 },
    {
      name: 'splashBG',
      type: 'Spine',
      spineName: 'bg_day',
      defaultSkin: 'default',
      defaultState: 'animation',
      boundingBox: { width: 1550, height: 1550 },
      loop: true,
      layoutData: {
        Desktop: { hAlign: 'center', vAlign: 'middle', fitToScreen: true },
        Portrait: { hAlign: 'center', vAlign: 'middle', fitToScreen: true },
        Landscape: { hAlign: 'center', vAlign: 'middle', fitToScreen: true },
      },
    },
    {
      name: 'gameTitle',
      type: 'Sprite',
      image: 'gamelogo_splash',
      layoutData: {
        Portrait: { widthPerc: 0.7, maxScale: 1, hAlign: 'center', vAlign: 'top', vPaddingPerc: 0.1 },
        Landscape: {
          widthPerc: 0.5,
          heightPerc: 0.1,
          maxScale: 1,
          hAlign: 'center',
          vAlign: 'top',
          vPaddingPerc: 0.02,
        },
      },
    },
    {
      name: 'brandLogo',
      type: 'Sprite',
      image: 'brandLogo',
      anchor: { x: 0, y: 0 },
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
      name: 'loadingBtnContainer',
      type: 'Container',
      layoutData: {
        Desktop: { widthPerc: 0.5, heightPerc: 0.5, vAlign: 'middle', maxScale: 1 },
        Landscape: { widthPerc: 0.5, heightPerc: 0.1, vAlign: 'middle', maxScale: 1 },
        Portrait: { widthPerc: 0.5, heightPerc: 0.5, vAlign: 'middle', maxScale: 1 },
      },
      Elements: [
        {
          name: 'loaderbg',
          type: 'Sprite',
          image: 'startButton',
          anchor: { x: 0.5, y: 0.5 },
          y: 1,
        },
        {
          name: 'loaderfill',
          type: 'Sprite',
          image: 'startButton',
          anchor: { x: 0.5, y: 0.5 },
          y: 1,
        },
        {
          name: 'startBtn',
          type: 'Button',
          anchor: { x: 0.5, y: 0.5 },
          action: {
            press: SplashStartCommand,
          },
          options: {
            defaultView: 'startButton',
            hoverView: 'startButton',
            pressedView: 'startButton',
            disabledView: 'startButton',
            animations: UIConfig.buttonStates,
          },
        },
        { name: 'maskRect', type: 'Graphics', width: 532, height: 95, x: -266, y: -48, alpha: 1, color: 0xff0000 },
        {
          name: 'loadingText',
          type: 'Text',
          style: { fontFamily: 'gameFont1', fontSize: 60, fill: 0xffffff, trim: true },
          anchor: { x: 0.5, y: 0.5 },
        },
      ],
    },
  ],
};

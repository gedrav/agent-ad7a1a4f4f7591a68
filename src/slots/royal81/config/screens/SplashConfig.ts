import { SplashStartCommand } from '@core/commands/action/SplashStartCommand';
import { UIConfig } from '@game/config/UIConfig';
import { SplashView } from '@brand/views/splash/SplashView';
import { SplashItemComp } from '@brand/views/splash/SplashItemComp';
import { UIUtil } from '@core/utils/UIUtilService';
import { CoreUIConfig } from '@brand/config/CoreUIConfig';
import { SoundStateChangeCommand } from '@core/commands/action/SoundStateChangeCommand';
import { ChangeTotalBetCommand } from '@core/commands/action/ChangeTotalBetCommand';
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
      textY: 620,
      textStyle: {
        name: 'contentTxt',
        type: 'Text',
        destroy: true,
        style: { fontFamily: 'commonFont', fontWeight: 700, fill: 0xffffff, fontSize: 60, anchor: { x: 0.5, y: 0.5 } },
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
        style: { fontFamily: 'commonFont', fontWeight: 700, fill: 0xffffff, fontSize: 60, anchor: { x: 0.5, y: 0.5 } },
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
    { name: 'guideRect', type: 'Graphics', width: 200, height: 200, color: 0xff0000, alpha: 1 },
    { name: 'playButtonGuideRect', type: 'Graphics', width: 200, height: 200, color: 0xffc000, alpha: 1 },
    {
      name: 'gameTitle',
      type: 'Sprite',
      image: 'gamelogo',
      anchor: { x: 0.5, y: 0.5 },
      layoutData: {
        Desktop: { widthPerc: 0.5, heightPerc: 0.16, maxScale: 1, hAlign: 'center', vPosition: 0.14 },
        Portrait: { widthPerc: 0.7, maxScale: 1, hAlign: 'center', vAlign: 'top', vPaddingPerc: 0.1 },
        Landscape: { widthPerc: 0.5, maxScale: 1, hAlign: 'center', vPosition: 0.14 },
      },
    },
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
    },
    {
      name: 'soundSettingsContainer',
      type: 'Container',
      Elements: [
        {
          name: 'soundOnBtn',
          type: 'IconButton',
          data: false,
          x: 32,
          y: 32,
          options: {
            defaultView: 'generalCPBtn',
            hoverView: 'generalCPBtn',
            pressedView: 'generalCPBtn',
            disabledView: 'generalCPBtn',
            icon: 'soundOnIcon',
            animations: CoreUIConfig.buttonStates,
          },
        },
        {
          name: 'soundOffBtn',
          type: 'IconButton',
          data: true,
          x: 32,
          y: 32,
          options: {
            defaultView: 'generalCPBtn',
            hoverView: 'generalCPBtn',
            pressedView: 'generalCPBtn',
            disabledView: 'generalCPBtn',
            icon: 'soundOffIcon',
            animations: CoreUIConfig.buttonStates,
          },
          visible: false,
        },
        {
          name: 'soundStateText',
          type: 'Text',
          destroy: true,
          x: 80,
          y: 10,
          content: 'turnOffSoundText',
          style: {
            fontFamily: 'commonFont',
            fontWeight: 700,
            fill: 0x000000,
            fontSize: 32,
            anchor: { x: 0, y: 0 },
          },
        },
      ],
    },
    {
      name: 'dontShowMessage',
      type: 'PixToggleButton',
      scale: 1,
      options: {
        defaultView: 'checkBox',
        hoverView: 'checkBox',
        pressedView: 'checkBox',
        disabledView: 'checkBox',
        animations: CoreUIConfig.buttonStates,
      },
      selectedOptions: {
        defaultView: 'checkBoxSelected',
        hoverView: 'checkBoxSelected',
        pressedView: 'checkBoxSelected',
        disabledView: 'checkBoxSelected',
      },
      Elements: [
        {
          name: 'btn1Text',
          type: 'Text',
          y: -20,
          x: 30,
          content: 'dontShowMessage',
          style: {
            fontFamily: 'commonFont',
            fontSize: 32,
            fontWeight: 700,
            nonSelectedStateColor: 0x000000,
            selectedStateColor: 0x000000,
          },
        },
      ],
    },
  ],
};

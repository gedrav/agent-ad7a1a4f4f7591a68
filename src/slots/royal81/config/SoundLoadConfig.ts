export const GAME_SOUND_CONFIG = {
  basePath: 'gameassets/',
  commonSoundPath: '../common/',
  properties: {
    VOLUME: 1,
    MUTE: false,
    FADE_TIME: 1000,
  },
  soundFiles: [
    // --- Base game / feature BGM (mutually exclusive via stop events) ---
    {
      name: 'musMainBGM',
      type: 'game',
      soundType: 'ambient',
      loop: true,
      playEvents: ['START_MAINGAME_BG_MUSIC'],
      stopEvents: [
        'STOP_MAINGAME_BG_MUSIC',
        'START_BONUS_BG_MUSIC',
        'START_FREESPIN_BG_MUSIC',
        'START_FS_BG_MUSIC',
        'PLAY_BIGWIN_SPECIAL_SOUND',
        'PLAY_MEGAWIN_SPECIAL_SOUND',
        'PLAY_GIGANTICWIN_SPECIAL_SOUND',
        'PLAY_UNBELIEVABLEWIN_SPECIAL_SOUND',
      ],
      volume: 0.4,
      fadeOutDuration: 1000,
    },
    {
      name: 'musFeatureBGM',
      type: 'game',
      soundType: 'ambient',
      loop: true,
      playEvents: ['START_FREESPIN_BG_MUSIC', 'START_FS_BG_MUSIC'],
      stopEvents: [
        'FREESPIN_BG_MUSIC_TERM',
        'STOP_FREESPIN_BG_MUSIC',
        'START_MAINGAME_BG_MUSIC',
        'PLAY_BIGWIN_SPECIAL_SOUND',
        'PLAY_MEGAWIN_SPECIAL_SOUND',
        'PLAY_GIGANTICWIN_SPECIAL_SOUND',
        'PLAY_UNBELIEVABLEWIN_SPECIAL_SOUND',
      ],
      volume: 0.4,
      fadeOutDuration: 1000,
    },
    // {
    //   name: 'musFeatureTermBGM',
    //   type: 'game',
    //   soundType: 'ambient',
    //   loop: false,
    //   playEvents: ['FREESPIN_BG_MUSIC_TERM'],
    //   stopEvents: ['START_MAINGAME_BG_MUSIC'],
    //   volume: 0.4,
    //   fadeOutDuration: 1000,
    // },

    // --- Buttons ---
    {
      name: 'genericButtonSound',
      type: 'game',
      loop: false,
      playEvents: ['PLAY_GENERIC_BUTTON_SOUND'],
      volume: 0.6,
      fadeOutDuration: 1000,
    },
    // {
    //   name: 'historyAndRulesBtnSound',
    //   type: 'common',
    //   loop: false,
    //   playEvents: ['PLAY_HISTORY_AND_RULES_BTN_SOUND'],
    //   volume: 0.6,
    //   fadeOutDuration: 1000,
    // },
    {
      name: 'spinClicked',
      type: 'game',
      loop: false,
      playEvents: ['SPIN_CLICKED'],
      volume: 0.6,
      fadeOutDuration: 1000,
    },
    {
      name: 'stopSpinClicked',
      type: 'game',
      loop: false,
      playEvents: ['STOP_SPIN_CLICKED', 'REELSTRIP_SPIN_JERK'],
      volume: 0.6,
      fadeOutDuration: 1000,
    },
    // --- Reels / cascades core ---
    {
      name: 'startSlotSpin',
      type: 'game',
      loop: false,
      playEvents: ['START_SLOT_SPIN'],
      stopEvents: ['STOP_REEL_IMMEDIATELY', 'FINAL_SYMBOL_SETTLED', 'STOP_SPIN_CLICKED'],
      volume: 0.6,
      fadeOutDuration: 100,
    },

    {
      name: 'turboSlotSpin',
      type: 'game',
      loop: false,
      playEvents: ['TURBO_START_SLOT_SPIN'],
      stopEvents: ['STOP_REEL_IMMEDIATELY', 'FINAL_SYMBOL_SETTLED', 'STOP_SPIN_CLICKED'],
      volume: 0.6,
      fadeOutDuration: 100,
    },

    // --- Scatter landing (param-based variants) ---
    // {
    //   name: 'scatterLoadingSound1',
    //   type: 'game',
    //   loop: false,
    //   playEvents: ['PLAY_SCATTER_LANDING_SOUND'],
    //   // matchParam: 1,
    //   volume: 0.6,
    //   fadeOutDuration: 100,
    // },

    // --- Wild blast (1–3 wilds) ---
    {
      name: 'wild1Sfx',
      type: 'game',
      loop: false,
      playEvents: ['PLAY_WILD_BLAST_1'],
      volume: 0.6,
      fadeOutDuration: 100,
    },
    {
      name: 'wild2Sfx',
      type: 'game',
      loop: false,
      playEvents: ['PLAY_WILD_BLAST_2'],
      volume: 0.6,
      fadeOutDuration: 100,
    },
    {
      name: 'wild3Sfx',
      type: 'game',
      loop: false,
      playEvents: ['PLAY_WILD_BLAST_3'],
      volume: 0.6,
      fadeOutDuration: 100,
    },

    // --- Symbol appear after blast ---
    {
      name: 'hignVlaue1',
      type: 'game',
      loop: false,
      playEvents: ['PLAY_SYMBOL_APPEAR_H1'],
      volume: 0.6,
      fadeOutDuration: 100,
    },
    {
      name: 'hignVlaue2',
      type: 'game',
      loop: false,
      playEvents: ['PLAY_SYMBOL_APPEAR_H2'],
      volume: 0.6,
      fadeOutDuration: 100,
    },
    {
      name: 'hignVlaue3',
      type: 'game',
      loop: false,
      playEvents: ['PLAY_SYMBOL_APPEAR_H3'],
      volume: 0.6,
      fadeOutDuration: 100,
    },
    {
      name: 'hignVlaue4',
      type: 'game',
      loop: false,
      playEvents: ['PLAY_SYMBOL_APPEAR_H4'],
      volume: 0.6,
      fadeOutDuration: 100,
    },
    {
      name: 'lowValueSymbol',
      type: 'game',
      loop: false,
      playEvents: ['PLAY_SYMBOL_APPEAR_L'],
      volume: 0.6,
      fadeOutDuration: 100,
    },

    // --- Big/Mega/Gigantic/Unbelievable Win loops + intros ---
    {
      name: 'bigWinIntro',
      type: 'game',
      loop: false,
      playEvents: ['PLAY_BIGWIN_SPECIAL_SOUND'],
      stopEvents: ['STOP_BIGWIN_SPECIAL_SOUND', 'PLAY_BIG_WIN_COUNTUP_END_SOUND', 'STOP_BIGWIN_SOUND', 'CLEAR_ROUND'],
      volume: 0.6,
    },
    {
      name: 'megaIntro',
      type: 'game',
      loop: true,
      playEvents: ['PLAY_MEGAWIN_SPECIAL_SOUND'],
      stopEvents: ['STOP_MEGAWIN_SOUND', 'PLAY_BIG_WIN_COUNTUP_END_SOUND', 'CLEAR_ROUND'],
      volume: 0.6,
    },
    {
      name: 'giganticIntro',
      type: 'game',
      loop: false,
      playEvents: ['PLAY_GIGANTICWIN_SPECIAL_SOUND'],
      stopEvents: ['PLAY_BIG_WIN_COUNTUP_END_SOUND', 'STOP_GIGANTICWIN_SOUND', 'CLEAR_ROUND'],
      volume: 0.6,
    },
    {
      name: 'unbelievableIntro',
      type: 'game',
      loop: false,
      playEvents: ['PLAY_UNBELIEVABLEWIN_SPECIAL_SOUND'],
      stopEvents: ['PLAY_BIG_WIN_COUNTUP_END_SOUND', 'CLEAR_ROUND'],
      volume: 0.6,
    },

    // --- Celebration term variations (param-based; unique names) ---
    {
      name: 'winTerm',
      type: 'game',
      loop: false,
      playEvents: ['PLAY_TERM_SOUND'],
      volume: 0.6,
    },
    // {
    //   name: 'celebrationTerm1',
    //   type: 'game',
    //   loop: false,
    //   playEvents: ['PLAY_TERM_SOUND'],
    //   matchParam: 2,
    //   volume: 0.6,
    // },
    // {
    //   name: 'celebrationTerm2',
    //   type: 'game',
    //   loop: false,
    //   playEvents: ['PLAY_TERM_SOUND'],
    //   matchParam: 3,
    //   volume: 0.6,
    // },
    // {
    //   name: 'celebrationTerm3',
    //   type: 'game',
    //   loop: false,
    //   playEvents: ['PLAY_TERM_SOUND'],
    //   matchParam: 4,
    //   volume: 0.6,
    // },

    // --- Cascade / vanish ---
    // {
    //   name: 'symbolsVanish',
    //   type: 'game',
    //   loop: false,
    //   playEvents: ['PLAY_SYMBOL_DISAPPEAR_SOUND'],
    //   volume: 0.6,
    // },

    // intro and outro sounds for feature trigger and FS entry
    // {
    //   name: 'introPopup',
    //   type: 'game',
    //   loop: false,
    //   playEvents: ['INTRO_SOUND_MESSAGE_POPUP', 'GENERIC_UI_POPUP'],
    //   volume: 0.6,
    // },
    // {
    //   name: 'outroPopup',
    //   type: 'game',
    //   loop: false,
    //   playEvents: ['OUTRO_SOUND_MESSAGE_POPUP'],
    //   volume: 0.6,
    // },

    // --- Feature trigger ---
    // {
    //   name: 'featureBell',
    //   type: 'game',
    //   loop: false,
    //   playEvents: ['PLAY_FREESPIN_TRIGGERED_SOUND'],
    //   volume: 0.6,
    // },

    // --- Transitions / idle ---
    // {
    //   name: 'doorTransition',
    //   type: 'game',
    //   loop: false,
    //   playEvents: ['PLAY_TRANSITION_ANIM_SOUND'],
    //   volume: 0.6,
    //   fadeOutDuration: 1000,
    // },
    // {
    //   name: 'symbolIdle',
    //   loop: false,
    //   playEvents: ['PLAY_IDLE_ANIMATION'],
    //   volume: 0.6,
    //   fadeOutDuration: 1000,
    // },

    // --- Intro popup selection ---
    // {
    //   name: 'bannerIn',
    //   type: 'game',
    //   loop: false,
    //   playEvents: ['FEATURE_OPTION_CLICKED'],
    //   volume: 0.6,
    // },

    // --- Multiplier meter ---
    // {
    //   name: 'multiplierToMeter',
    //   type: 'game',
    //   loop: false,
    //   playEvents: ['PLAY_MULTI_VALUE_SHOOT_UP_SOUND'],
    //   volume: 0.6,
    // },

    // --- Line wins (param-based) ---
    // {
    //   name: 'winLine1',
    //   loop: false,
    //   playEvents: ['PLAY_LINEWIN_SOUND'],
    //   matchParam: 1,
    //   volume: 0.6,
    //   fadeOutDuration: 1000,
    // },
    // {
    //   name: 'winLine2',
    //   loop: false,
    //   playEvents: ['PLAY_LINEWIN_SOUND'],
    //   matchParam: 2,
    //   volume: 0.6,
    //   fadeOutDuration: 1000,
    // },
    // {
    //   name: 'winLine3',
    //   loop: false,
    //   playEvents: ['PLAY_LINEWIN_SOUND'],
    //   matchParam: 3,
    //   volume: 0.6,
    //   fadeOutDuration: 1000,
    // },
    // {
    //   name: 'winLine4',
    //   loop: false,
    //   playEvents: ['PLAY_LINEWIN_SOUND'],
    //   matchParam: 4,
    //   volume: 0.6,
    //   fadeOutDuration: 1000,
    // },

    // --- Win counter ---
    {
      name: 'rollup',
      type: 'game',
      loop: true,
      playEvents: ['PLAY_ALL_WIN_SOUND_BIGWIN'],
      stopEvents: ['CLEAR_ALL_WIN', 'PLAY_BIG_WIN_COUNTUP_END_SOUND', 'STOP_ALL_WIN_SOUND_BIGWIN', 'CLEAR_ROUND'],
      volume: 0.6,
      fadeOutDuration: 100,
    },
    {
      name: 'rollupTerm',
      type: 'game',
      loop: false,
      playEvents: ['NORMAL_WIN_COUNTUP_DONE', 'PLAY_FS_WIN_COUNTUP_END_SOUND', 'PLAY_BIG_WIN_COUNTUP_END_SOUND_NOW'],
      volume: 0.6,
      fadeOutDuration: 100,
    },

    // --- Reel stops (normalized params 0..5) ---
    {
      name: 'reelStop',
      type: 'game',
      loop: false,
      playEvents: [
        'REELSTRIP_SPIN_JERK',
        'REELSTRIP_FREESPIN_JERK',
        'PLAY_LAST_BASEGAME_STOPSPIN_SOUND',
        'PLASY_LAST_FS_STOP_SOUND',
      ],
      stopEvents: ['STOP_SPIN_CLICKED'],
      volume: 0.6,
      fadeOutDuration: 100,
    },

    // --- Anticipation / cascade ---
    // {
    //   name: 'anticipation',
    //   type: 'game',
    //   loop: false,
    //   playEvents: ['PLAY_ANTICIPATION_ANIM_SOUND'],
    //   volume: 0.6,
    //   fadeOutDuration: 1000,
    // },
    // {
    //   name: 'cascadeDrop',
    //   type: 'game',
    //   loop: false,
    //   playEvents: ['PLAY_SYMB_DROP_AFTER_SCATTER_ANTICIPATION'],
    //   volume: 0.6,
    //   fadeOutDuration: 1000,
    // },

    // --- Betting ---
    // {
    //   name: 'betUp',
    //   type: 'common',
    //   loop: false,
    //   playEvents: ['PLAY_BET_SOUND'],
    //   volume: 0.6,
    //   fadeOutDuration: 0,
    // },
  ],
};

const init = {
  success: true,

  statusCode: 200,

  message: 'Spin completed successfully',

  data: {
    gameId: 'jokercharge',

    roundId: '6d70d5c6-00ba-4093-9a41-b52cbabbc475',

    closed: false,

    playerInfo: {
      playerId: '6a951955ebdf795bff6868d8',

      balance: 12065549.586666685,
    },

    result: {
      grid: [
        ['sticky cor', 'cor-2x', 'Blanks'],

        ['Blanks', 'cor-5x', 'sticky mystery jackpot'],

        ['cor-5x', 'cor-3x', 'sticky mystery jackpot'],
      ],

      bet: 10,

      totalWin: 0,

      baseWin: 0,

      nextFeature: 'FG',

      pendingFeature: 3,

      featureResults: [
        {
          featureType: 'FG',

          holdField: [
            {
              position: [
                0,

                1,
              ],

              symbol: 'cor-2x',

              value: 20,
            },

            {
              position: [
                1,

                1,
              ],

              symbol: 'cor-5x',

              value: 50,
            },

            {
              position: [
                2,

                1,
              ],

              symbol: 'cor-3x',

              value: 30,
            },

            {
              position: [
                0,

                0,
              ],

              symbol: 'sticky cor',
            },

            {
              position: [
                1,

                2,
              ],

              symbol: 'sticky mystery jackpot',
            },

            {
              position: [
                2,

                0,
              ],

              symbol: 'cor-5x',

              value: 50,
            },

            {
              position: [
                2,

                2,
              ],

              symbol: 'sticky mystery jackpot',
            },
          ],

          triggerAnimation: {
            metamorphic: true,

            addCount: 1,
          },

          totalWin: 0,

          currentCount: 0,

          closed: false,
        },
      ],
    },
  },
};
const spin = {
  success: true,

  statusCode: 200,

  message: 'Init completed successfully',

  data: {
    unfinishedInfo: null,

    gameInfo: {
      gameId: 'jokercharge',

      devMode: true,

      payTable: {},

      gameData: {
        layout: {
          rows: 3,

          columns: 3,
        },

        symbols: {},

        features: {
          respinCount: 3,
        },

        maxWin: 5000,

        baseBet: 1,

        bbBaseBet: 1,

        symbolValues: {
          'GRAND JACKPOT': 500,

          'cor-1x': 1,

          'cor-2x': 2,

          'cor-3x': 3,

          'cor-4x': 4,

          'cor-5x': 5,

          mini: 10,

          minor: 20,

          major: 50,
        },
      },
    },

    playerInfo: {
      playerId: '6a951955ebdf795bff6868d8',

      currencyCode: 'EUR',

      maxPayout: null,

      balance: 12065559.586666685,

      language: 'en',

      maxBet: null,

      bbMaxBet: null,

      minBet: 0,

      defaultBet: 0,

      bbMaxWin: null,

      allowCheat: true,

      possibleBets: [
        0.1,

        0.2,

        0.4,

        0.5,

        0.8,

        1,

        2,

        2.5,

        4,

        5,

        7.5,

        10,

        20,

        50,

        100,

        200,

        250,

        400,

        500,

        600,

        750,

        1000,

        1250,

        1500,

        1750,

        2000,

        2250,

        2500,

        2750,

        3000,

        3250,

        3500,

        3750,

        4000,

        4250,

        4500,

        4750,

        5000,
      ],

      buyFeature: true,

      homeURL: 'https://feg-lobby-gaming-studio-shared.apps.ocp02-shared.t.dc1.cz.ipa.ifortuna.cz',

      depositUrl: null,

      bbBetMultiplierSettings: {
        FG1: 100,
      },
    },

    betType: null,

    preferences: {
      sound: true,

      showIntro: false,
    },

    opCnf: {
      spinDuration: 2000,

      showGambleWarning: true,

      showElapsedTime: true,

      showNetLoss: false,

      showMaxBet: false,

      showMaxWin: false,

      showHourlyLoss: false,

      responsibleGaming: true,

      isAutoAvailable: true,

      isTurboAvailable: true,

      isBBAvailable: true,

      allowFullAnteBet: false,

      autoSpinSpendingLimit: false,

      showDisclosureText: true,

      showRTP: true,
    },

    rtp: {},

    epoch: 1,
  },
};

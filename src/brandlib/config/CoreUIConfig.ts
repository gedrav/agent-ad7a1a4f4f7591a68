export const CoreUIConfig: any = {
  buttonStates: {
    default: { props: { scale: { x: 1, y: 1 }, tint: 0xffffff, alpha: 1, duration: 5 } },
    hover: { props: { scale: { x: 1, y: 1 }, tint: 0xcccccc, alpha: 1, duration: 5 } },
    pressed: { props: { scale: { x: 0.96, y: 0.96 }, tint: 0xcccccc, alpha: 1, duration: 5 } },
    disabled1: { props: { scale: { x: 1, y: 1 }, tint: 0xffffff, alpha: 1, duration: 5 } },
  },
  noScalebuttonStates: {
    default: { props: { scale: { x: 1, y: 1 }, tint: 0xffffff, alpha: 1, duration: 5 } },
    hover: { props: { scale: { x: 1, y: 1 }, tint: 0xcccccc, alpha: 1, duration: 5 } },
    pressed: { props: { scale: { x: 1, y: 1 }, tint: 0xcccccc, alpha: 1, duration: 5 } },
    disabled: { props: { scale: { x: 1, y: 1 }, tint: 0xffffff, alpha: 1, duration: 5 } },
  },
  spinButtonStates: {
    default: { props: { scale: { x: 1, y: 1 }, tint: 0xffffff, alpha: 1, duration: 5 } },
    hover: { props: { scale: { x: 1, y: 1 }, tint: 0xcccccc, duration: 5 } },
    pressed: { props: { scale: { x: 0.96, y: 0.96 }, tint: 0xcccccc, duration: 5 } },
    disabled: { props: { scale: { x: 1, y: 1 }, tint: 0xffffff, alpha: 1, duration: 5 } },
  },
};

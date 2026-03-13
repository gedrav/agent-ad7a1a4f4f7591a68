export const CoreUIConfig: any = {
  buttonStates: {
    default: { props: { scale: { x: 1, y: 1 }, tint: 0xffffff, alpha: 1, duration: 25 } },
    hover: { props: { scale: { x: 1, y: 1 }, tint: 0x88afff, alpha: 1, duration: 25 } },
    pressed: { props: { scale: { x: 0.96, y: 0.96 }, tint: 0x88afff, alpha: 1, duration: 25 } },
    disabled: { props: { scale: { x: 1, y: 1 }, tint: 0x55575c, alpha: 0.8, duration: 25 } },
  },
  noScalebuttonStates: {
    default: { props: { scale: { x: 1, y: 1 }, tint: 0xffffff, alpha: 1, duration: 25 } },
    hover: { props: { scale: { x: 1, y: 1 }, tint: 0x88afff, alpha: 1, duration: 25 } },
    pressed: { props: { scale: { x: 1, y: 1 }, tint: 0x88afff, alpha: 1, duration: 25 } },
    disabled: { props: { scale: { x: 1, y: 1 }, tint: 0x55575c, alpha: 0.8, duration: 25 } },
  },
  spinButtonStates: {
    default: { props: { scale: { x: 1, y: 1 }, tint: 0xffffff, alpha: 1, duration: 25 } },
    hover: { props: { scale: { x: 1, y: 1 }, tint: 0x88afff, duration: 25 } },
    pressed: { props: { scale: { x: 0.96, y: 0.96 }, tint: 0x88afff, duration: 25 } },
    disabled: { props: { scale: { x: 1, y: 1 }, tint: 0x55575c, alpha: 0.8, duration: 25 } },
  },
};

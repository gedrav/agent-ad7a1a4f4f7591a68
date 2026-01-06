export const CoreUIConfig: any = {
  buttonStates: {
    default: { props: { scale: { x: 1, y: 1 }, tint: 0xffffff, alpha: 1, duration: 25 } },
    hover: { props: { scale: { x: 1, y: 1 }, tint: 0x9cafff, alpha: 1, duration: 25 } },
    pressed: { props: { scale: { x: 0.96, y: 0.96 }, tint: 0x708cff, alpha: 1, duration: 25 } },
    disabled: { props: { scale: { x: 1, y: 1 }, faded: true, duration: 25 } },
  },
  spinButtonStates: {
    default: { props: { scale: { x: 1, y: 1 }, tint: 0xffffff }, duration: 25 },
    hover: { props: { scale: { x: 1, y: 1 }, tint: 0x9cafff, duration: 25 } },
    pressed: { props: { scale: { x: 0.96, y: 0.96 }, tint: 0x708cff, duration: 25 } },
    disabled: { props: { scale: { x: 1, y: 1 }, faded: true, duration: 25 } },
  },
};

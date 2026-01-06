export type CallbackFnType = (data: any) => void;

declare global {
  interface Window {
    initPixi: (view: { view: string }) => void;
    unmountScreen: CallbackFnType;
    gameExtension: CallbackFnType;
  }

  const __SHOW_STATS__: boolean;
}

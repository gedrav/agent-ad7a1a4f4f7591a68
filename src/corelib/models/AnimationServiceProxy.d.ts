declare class AnimationServiceProxy {
  protected speed: number;
  protected animationMap: {
    [key: string]: any;
  };
  protected animationSequence: {
    [key: string]: any;
  };
  protected callbackSequence: {
    [key: string]: any;
  };
  protected currentId: string;
  constructor();
  animateTween(element: any, duration: number, props: any, kill?: boolean): any;
  animateFromTo(element: any, duration: number, props1: any, props2: any, kill?: boolean): any;
  animateBezier(element: any, duration: number, props: any, bezier: any): any;
  animateSpine(element: any, state: string, loop: boolean, speed?: number, trackIndex?: number, delay?: number): void;
  destroyTimeline(id: string): void;
  addSpineToTimeline(id: string, elements: any, props: any, delays: any): void;
  playTimeline(id: string, callback: () => void): void;
  playNextTimelineAnim(id: string): void;
  killTweensOf(element: any): void;
}
export declare const AnimationProxy: AnimationServiceProxy;
export {};

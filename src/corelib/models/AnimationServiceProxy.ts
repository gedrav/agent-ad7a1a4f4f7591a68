import { gsap } from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';

class AnimationServiceProxy {
  protected speed: number;
  protected animationMap: { [key: string]: any };
  protected animationSequence: { [key: string]: any };
  protected callbackSequence: { [key: string]: any };
  protected currentId: string;

  constructor() {
    this.speed = 1;
    this.animationMap = [];
    this.animationSequence = {};
    this.callbackSequence = {};
    //gsap.ticker.lagSmoothing(1000, 16);
    gsap.registerPlugin(PixiPlugin);
  }

  public fadeIn(element, duration, callback = null, alpha = 1) {
    element.visible = true;
    element.alpha = 0;
    this.animateTween(element, { duration: duration, alpha: alpha, onComplete: callback });
  }
  public fadeOut(element, duration, callback = null) {
    this.animateTween(element, { duration: duration, alpha: 0, onComplete: callback });
  }

  public animateTween(element: any, props: any, kill = true): gsap.core.Tween {
    if (kill) {
      gsap.killTweensOf(element);
    }
    props.duration = props.duration / this.speed;
    return gsap.to(element, props);
  }
  public animateFromTo(element: any, duration: number, props1: any, props2: any, kill = true): any {
    if (kill) {
      gsap.killTweensOf(element);
    }
    return gsap.fromTo(element, duration / this.speed, props1, props2);
  }
  public animateBezier(element: any, duration: number, props: any, bezier: any): any {
    const values = [];
    const dist = Math.abs(props.y - element.y) / bezier.curves;
    let currentDist = dist;
    for (let k = 0; k < bezier.curves; k++) {
      if (k % 2 == 0) {
        values.push({ x: element.x - bezier.width, y: element.y - currentDist });
      } else {
        values.push({ x: element.x + bezier.width, y: element.y - currentDist });
      }
      currentDist += dist;
    }
    values.push({ x: props.x ? props.x : element.x, y: props.y ? props.y : element.y });
    props.bezier = { curviness: 2, type: 'thru', values: values };
    props.duration = duration / this.speed;
    return gsap.to(element, props);
  }

  killTweensOf(element: any): void {
    gsap.killTweensOf(element);
  }
}

export const AnimationProxy = new AnimationServiceProxy();

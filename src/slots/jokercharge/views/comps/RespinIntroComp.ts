import { Rectangle } from 'pixi.js';
import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { JCEvents } from '@slots/jokercharge/events/JCEvents';

export interface RespinIntroData {
  // Fires once the player taps to dismiss - see RespinIntroState.
  onConfirm?: () => void;
}

// Where an element rests once the layout has placed it, so the open can start somewhere else and
// put it back. Read off the elements rather than the config: the comp is scaled to fit the screen,
// and these are the values that scaling leaves behind.
interface RestState {
  x: number;
  y: number;
  alpha: number;
  scaleX: number;
  scaleY: number;
}

// In the order they land: left column then right, top row then bottom.
const BADGE_NAMES = ['chargeSym', 'multiSym', 'superChargeSym', 'superMultiSym'];
const ANIMATED_NAMES = [
  'introGroup',
  'title',
  'heading',
  ...BADGE_NAMES,
  'chargeCaption',
  'multiCaption',
  'tapToContinue',
];

const GROUP_OPEN_DURATION = 0.4;
const GROUP_OPEN_FROM_SCALE = 0.82;
const GROUP_OPEN_EASE = 'back.out(1.3)';

const TITLE_OPEN_DURATION = 0.35;
const TITLE_OPEN_DELAY = 0.12;
const TITLE_OPEN_EASE = 'back.out(1.6)';
const TITLE_DROP = 60;
// The slow breath the title keeps up while the screen waits on the player.
const TITLE_IDLE_DURATION = 1.6;
const TITLE_IDLE_SCALE = 1.05;

const TEXT_RISE_DURATION = 0.3;
const TEXT_RISE = 26;
const HEADING_DELAY = 0.22;
const CAPTION_DELAY = 0.68;

const BADGE_DURATION = 0.34;
const BADGE_FIRST_DELAY = 0.3;
const BADGE_STAGGER = 0.09;
const BADGE_EASE = 'back.out(2.2)';

const TAP_DELAY = 0.82;
// The zoom that says the screen is waiting rather than stuck.
const TAP_PULSE_DURATION = 0.7;
const TAP_PULSE_SCALE = 1.12;

// The "BONUS GAME" info screen. Lives at app level (see SlotGameAppConfig) so it covers the whole
// game, and carries its own dim rather than using corelib's ModalView.
export class RespinIntroComp extends ResponsiveChildrenView {
  private onConfirm: (() => void) | null = null;
  // Captured on the first open. Nothing in here carries layoutData of its own, so the layout
  // engine leaves these local transforms alone and one capture holds for every later open.
  private readonly rest: Map<string, RestState> = new Map();

  constructor(config: any) {
    super(config);
    this.visible = false;
    this.eventMode = 'static';
    // A Container is only hit where its children are, but a tap anywhere on screen should count.
    this.hitArea = new Rectangle(-5000, -5000, 10000, 10000);
    this.on('pointertap', this.onTapped, this);
    this.centerGroupPivot();
    EventHandler.addEventListener(JCEvents.SHOW_RESPIN_INTRO, this.show.bind(this));
  }

  // The group scales as it opens, and a Container scales about its own origin - which is the top
  // left of the screen's guide. Moving the pivot to the middle of the guide, and the group by the
  // same amount, leaves everything where it was but makes it grow from its centre.
  private centerGroupPivot(): void {
    const group = this.element('introGroup');
    const guide = this.element('guideRect');
    if (!group || !guide) return;
    group.pivot.set(guide.width / 2, guide.height / 2);
    group.position.set(group.pivot.x, group.pivot.y);
  }

  public show(data?: RespinIntroData): void {
    this.onConfirm = data?.onConfirm ?? null;
    this.visible = true;
    this.captureRest();
    this.playOpen();
  }

  public hide(): void {
    // Killed rather than left to finish: the looping ones never would, and a tween still running
    // against a hidden screen is a tween running against the next feature's.
    this.resetToRest();
    this.visible = false;
  }

  private element(name: string): any {
    return this.elementsList?.[name];
  }

  private captureRest(): void {
    if (this.rest.size) return;
    ANIMATED_NAMES.forEach((name) => {
      const element = this.element(name);
      if (!element) return;
      this.rest.set(name, {
        x: element.x,
        y: element.y,
        alpha: element.alpha,
        scaleX: element.scale.x,
        scaleY: element.scale.y,
      });
    });
  }

  // Every open starts from the same place, however the last one ended. scale is its own tween
  // target, so killing the element alone would leave a pulse running on a screen nobody can see.
  private resetToRest(): void {
    ANIMATED_NAMES.forEach((name) => {
      const element = this.element(name);
      const rest = this.rest.get(name);
      if (!element || !rest) return;
      AnimationProxy.killTweensOf(element);
      AnimationProxy.killTweensOf(element.scale);
      element.position.set(rest.x, rest.y);
      element.alpha = rest.alpha;
      element.scale.set(rest.scaleX, rest.scaleY);
    });
  }

  private playOpen(): void {
    this.resetToRest();
    this.openGroup();
    this.openTitle();
    this.riseText('heading', HEADING_DELAY);
    this.popBadges();
    this.riseText('chargeCaption', CAPTION_DELAY);
    this.riseText('multiCaption', CAPTION_DELAY);
    this.openTap();
  }

  private openGroup(): void {
    const group = this.element('introGroup');
    const rest = this.rest.get('introGroup');
    if (!group || !rest) return;
    group.alpha = 0;
    group.scale.set(rest.scaleX * GROUP_OPEN_FROM_SCALE, rest.scaleY * GROUP_OPEN_FROM_SCALE);
    AnimationProxy.animateTween(group, { duration: GROUP_OPEN_DURATION, alpha: rest.alpha });
    AnimationProxy.animateTween(group.scale, {
      duration: GROUP_OPEN_DURATION,
      x: rest.scaleX,
      y: rest.scaleY,
      ease: GROUP_OPEN_EASE,
    });
  }

  // Drops in from above, then keeps breathing until the player taps.
  private openTitle(): void {
    const title = this.element('title');
    const rest = this.rest.get('title');
    if (!title || !rest) return;
    title.alpha = 0;
    title.y = rest.y - TITLE_DROP;
    AnimationProxy.animateTween(title, {
      duration: TITLE_OPEN_DURATION,
      delay: TITLE_OPEN_DELAY,
      alpha: rest.alpha,
      y: rest.y,
      ease: TITLE_OPEN_EASE,
    });
    AnimationProxy.animateTween(title.scale, {
      duration: TITLE_IDLE_DURATION,
      delay: TITLE_OPEN_DELAY + TITLE_OPEN_DURATION,
      x: rest.scaleX * TITLE_IDLE_SCALE,
      y: rest.scaleY * TITLE_IDLE_SCALE,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    });
  }

  private riseText(name: string, delay: number): void {
    const element = this.element(name);
    const rest = this.rest.get(name);
    if (!element || !rest) return;
    element.alpha = 0;
    element.y = rest.y + TEXT_RISE;
    AnimationProxy.animateTween(element, {
      duration: TEXT_RISE_DURATION,
      delay,
      alpha: rest.alpha,
      y: rest.y,
    });
  }

  // One after another rather than together, so the four features read as four things.
  private popBadges(): void {
    BADGE_NAMES.forEach((name, index) => {
      const badge = this.element(name);
      const rest = this.rest.get(name);
      if (!badge || !rest) return;
      badge.scale.set(0);
      AnimationProxy.animateTween(badge.scale, {
        duration: BADGE_DURATION,
        delay: BADGE_FIRST_DELAY + index * BADGE_STAGGER,
        x: rest.scaleX,
        y: rest.scaleY,
        ease: BADGE_EASE,
      });
    });
  }

  // Fades in last, then zooms in and out on a loop for as long as the screen is up.
  private openTap(): void {
    const tap = this.element('tapToContinue');
    const rest = this.rest.get('tapToContinue');
    if (!tap || !rest) return;
    tap.alpha = 0;
    AnimationProxy.animateTween(tap, { duration: TEXT_RISE_DURATION, delay: TAP_DELAY, alpha: rest.alpha });
    AnimationProxy.animateTween(tap.scale, {
      duration: TAP_PULSE_DURATION,
      delay: TAP_DELAY,
      x: rest.scaleX * TAP_PULSE_SCALE,
      y: rest.scaleY * TAP_PULSE_SCALE,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    });
  }

  private onTapped(): void {
    if (!this.visible) return;
    this.hide();
    // Cleared before firing so a double tap can't advance the state machine twice.
    const confirm = this.onConfirm;
    this.onConfirm = null;
    confirm?.();
  }
}

export class Clock {
  static wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Whether the SECONDARY bundle - the respin feature's art - is in, and the views that use it have
// built it.
//
// appModel.secondaryAssetsLoaded can't answer this here: gameApp forces it true at start-up, because
// corelib only builds a symbol's animation spine behind that flag. And the bundle being loaded isn't
// enough either: corelib announces it 100ms later, and that announcement is when the views build
// their feature art. gameApp sets this as the first listener on that announcement, and nothing
// can check it until every view has handled the same event.
let secondaryReady = false;

export function setSecondaryAssetsReady(): void {
  secondaryReady = true;
}

export function isSecondaryAssetsReady(): boolean {
  return secondaryReady;
}

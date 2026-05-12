import CascadeReelSymbol from '@brand/views/slot/CascadeReelSymbol';
import { Util } from '@core/utils/UtilService';

export default class EOGNCCascadeReelSymbol extends CascadeReelSymbol {
  public async showAppearingAnim(data: any, column: number, callback: () => void): Promise<void> {
    this.setNewSymbol(data, column);
    this.playSpineAnimation(this.configData.data.appearAnim, false);
    await Util.addDelays(1000); // added as a safeguard for playing appear anim fully
    callback();
  }
}

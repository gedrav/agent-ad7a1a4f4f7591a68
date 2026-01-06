import { ActionCommand } from '@core/commands/core/ActionCommand';
import { appModel } from '@core/models/services/AppModelService';

class LightningSpinChangeToggleBtnCmd extends ActionCommand {
  public execute(data?: any, sender?: any) {
    super.execute(data, sender);
    sender.setSelected(!sender.isSelected);
    appModel.lightningStopOnBonus = sender.isSelected;
  }
}

export const LightningSpinChangeToggleBtnCommand = new LightningSpinChangeToggleBtnCmd();

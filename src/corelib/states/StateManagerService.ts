import { StateCommand } from '@core/commands/core/StateCommand';

class StateManagerService {
  get currentState(): StateCommand {
    return this._currentState;
  }

  set currentState(value: StateCommand) {
    this._currentState = value;
  }
  get stateIndex(): number {
    return this._stateIndex;
  }

  set stateIndex(value: number) {
    this._stateIndex = value;
  }
  get states(): any[] {
    return this._states;
  }

  set states(value: any[]) {
    this._states = value;
  }

  private _stateIndex: number;
  private _states: any[];
  private _currentState: any;

  public setStates(statesData: any[]) {
    this.stateIndex = 0;
    this.states = statesData;
  }
  public initiate(): void {
    this.currentState = this.states[this.stateIndex];
    this._currentState.state.execute();
  }

  public doNextStep(data: any = null): void {
    this._currentState.state.doNextStep(data);
  }
  public executeAgain(data: any = null): void {
    this._currentState.state.execute(data);
  }

  public goToState(stateName: string, data: any = null) {
    this._currentState.state.destroy();
    this.stateIndex = this.getStateIndex(stateName);
    this.currentState = this.states[this.stateIndex];
    this._currentState.state.execute(data);
  }

  public next(): void {
    this._currentState.state.destroy();
    if (this.stateIndex >= this.states.length - 1) {
      this.stateIndex = 0;
    } else {
      this.stateIndex++;
    }
    this.currentState = this.states[this.stateIndex];
    this._currentState.state.execute();
  }

  protected getStateIndex(name: string): number {
    if (this.states && this.states.length > 0) {
      const len = this.states.length;
      for (let i = 0; i < len; i++) {
        if (this.states[i].name === name) {
          return i;
        }
      }
      return 0;
    }
  }
}

export const StateManager = new StateManagerService();

import { Role } from "./role";
import {
  NormalState,
  PetrochemicaState,
  PoisonedState,
  CheerupState,
} from "./state";

export abstract class OnePunchHandler {
  private _next: OnePunchHandler | null;
  protected abstract harm: number;

  constructor(next: OnePunchHandler | null) {
    this._next = next;
  }

  public handleUseSkill(target: Role, attacker: Role) {
    if (this.match(target)) {
      this.doHandle(target, attacker);
    } else {
      this._next?.handleUseSkill(target, attacker);
    }
    return;
  }

  protected abstract match(target: Role): boolean;

  protected doHandle(target: Role, attacker: Role) {
    attacker.attack([target], this.harm);
    return;
  }
}

export class HpMoreTargetOnePunchHandler extends OnePunchHandler {
  protected harm: number = 300;

  protected match(target: Role) {
    if (target.hp >= 500) {
      return true;
    }
    return false;
  }
}

export class PetrochemicaOrPoisonedTargetOnePunchHandler extends OnePunchHandler {
  protected harm: number = 80;

  protected match(target: Role) {
    if (
      target.state instanceof PetrochemicaState ||
      target.state instanceof PoisonedState
    ) {
      return true;
    }

    return false;
  }

  protected doHandle(target: Role, attacker: Role) {
    for (let i = 0; i < 3; i++) {
      super.doHandle(target, attacker);
    }
  }
}

export class CheerupTargetOnePunchHandler extends OnePunchHandler {
  protected harm: number = 100;

  protected match(target: Role) {
    if (target.state instanceof CheerupState) {
      return true;
    }
    return false;
  }

  protected doHandle(target: Role, attacker: Role) {
    super.doHandle(target, attacker);
    target.changeState(new NormalState(target));
  }
}

export class NormalTargetOnePunchHandler extends OnePunchHandler {
  protected harm: number = 100;

  protected match(target: Role) {
    if (target.state instanceof NormalState) {
      return true;
    }
    return false;
  }
}

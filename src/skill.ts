import { Role, Slime } from "./role";
import { PetrochemicaState, PoisonedState, CheerupState } from "./state";
import {
  OnePunchHandler,
  HpMoreTargetOnePunchHandler,
  PetrochemicaOrPoisonedTargetOnePunchHandler,
  CheerupTargetOnePunchHandler,
  NormalTargetOnePunchHandler,
} from "./one_punch_handler";

export interface SkillStrategy {
  useSkill(): Promise<void>;
  getName(): string;
  getMp(): number;
}

export abstract class SkillAbstractStrategy implements SkillStrategy {
  protected abstract name: string;
  protected abstract mp: number;
  protected abstract harm: number;
  protected role: Role;

  constructor(role: Role) {
    this.role = role;
  }

  public async useSkill() {
    const potential_target = this.getPotentialTarget();
    const target_amount = this.getTargetNumber();
    const target = await this.role.chooseTarget(
      potential_target,
      target_amount
    );

    this.role.addMp(-this.mp);
    this.action(target);
  }

  protected getPotentialTarget() {
    return this.role.troop.getAllEnemy();
  }

  protected getTargetNumber() {
    return 1;
  }

  protected action(target: Role[]) {
    this.consoleUseSkill(target);
    this.role.attack(target, this.harm);
    return;
  }

  protected consoleUseSkill(target: Role[]) {
    const target_name = target.map((target) => target.showName);
    console.log(
      `${this.role.name} 對 ${target_name.join(",")} 使用了 ${this.name}`
    );
    return;
  }

  public getName() {
    return this.name;
  }

  public getMp() {
    return this.mp;
  }
}

export class NormalAttackStrategy extends SkillAbstractStrategy {
  protected name: string = "普通攻擊";
  protected mp: number = 0;
  protected harm: number;

  constructor(role: Role) {
    super(role);
    this.harm = this.role.str;
  }

  protected action(target: Role[]) {
    const target_name = target.map((target) => target.showName);
    console.log(`${this.role.name} 攻擊 ${target_name.join(",")}。`);
    this.role.attack(target, this.harm);
    return;
  }
}

export class WaterballStrategy extends SkillAbstractStrategy {
  protected name: string = "水球";
  protected mp: number = 50;
  protected harm: number = 120;
}

export class FireballStrategy extends SkillAbstractStrategy {
  protected name: string = "火球";
  protected mp: number = 50;
  protected harm: number = 50;

  protected getTargetNumber() {
    return this.role.troop.getAllEnemy().length;
  }
}

export class SelfHealingStrategy extends SkillAbstractStrategy {
  protected name: string = "自我治療";
  protected mp: number = 50;
  protected harm: number = -150;

  protected getPotentialTarget() {
    return [this.role];
  }

  protected action(target: Role[]) {
    console.log(`${this.role.name} 使用了 ${this.name}。`);
    target[0].addHp(-this.harm);
    return;
  }
}

export class PetrochemicalStrategy extends SkillAbstractStrategy {
  protected name: string = "石化";
  protected mp: number = 100;
  protected harm: number = 0;

  protected action(target: Role[]) {
    this.consoleUseSkill(target);

    target.forEach((target_role) => {
      const state_round = this.role.troop.id > target_role.troop.id ? 1 : 0;
      target_role.changeState(new PetrochemicaState(target_role, state_round));
    });
    return;
  }
}

export class PoisonStrategy extends SkillAbstractStrategy {
  protected name: string = "下毒";
  protected mp: number = 80;
  protected harm: number = 0;

  protected action(target: Role[]) {
    this.consoleUseSkill(target);

    target.forEach((target_role) => {
      const state_round = this.role.troop.id > target_role.troop.id ? 1 : 0;
      target_role.changeState(new PoisonedState(target_role, state_round));
    });

    return;
  }
}

export class SummonStrategy extends SkillAbstractStrategy {
  protected name: string = "召喚";
  protected mp: number = 150;
  protected harm: number = 0;

  protected getPotentialTarget() {
    const result: Role[] = [];
    return result;
  }

  protected getTargetNumber() {
    return 0;
  }

  protected action(target: Role[]) {
    console.log(`${this.role.name} 使用了 ${this.name}。`);
    new Slime("Slime", this.role.troop, this.role);
    return;
  }
}

export class SelfExplosionStrategy extends SkillAbstractStrategy {
  protected name: string = "自爆";
  protected mp: number = 200;
  protected harm: number = 150;

  protected getPotentialTarget() {
    const result: Role[] = [];
    result.push(
      ...this.role.troop.getAlly(this.role),
      ...this.role.troop.getAllEnemy()
    );

    return result;
  }

  protected getTargetNumber() {
    return this.getPotentialTarget().length;
  }

  protected action(target: Role[]) {
    super.action(target);
    this.role.addHp(-this.role.hp);
    return;
  }
}

export class CheerupStrategy extends SkillAbstractStrategy {
  protected name: string = "鼓舞";
  protected mp: number = 100;
  protected harm: number = 0;

  protected getPotentialTarget() {
    return this.role.troop.getAlly(this.role);
  }

  protected getTargetNumber() {
    return 3;
  }

  protected action(target: Role[]) {
    this.consoleUseSkill(target);

    target.forEach((target_role) => {
      const state_round = this.role.troop.id > target_role.troop.id ? 1 : 0;
      target_role.changeState(new CheerupState(target_role, state_round));
    });

    return;
  }
}

export class CurseStrategy extends SkillAbstractStrategy {
  protected name: string = "詛咒";
  protected mp: number = 100;
  protected harm: number = 0;

  protected action(target: Role[]) {
    this.consoleUseSkill(target);
    target.forEach((target_role) => {
      target_role.addCurser(this.role);
    });
    return;
  }
}

export class OnePunchStrategy extends SkillAbstractStrategy {
  protected name: string = "一拳攻擊";
  protected mp: number = 180;
  protected harm: number = 0;
  private handler: OnePunchHandler = new HpMoreTargetOnePunchHandler(
    new PetrochemicaOrPoisonedTargetOnePunchHandler(
      new CheerupTargetOnePunchHandler(new NormalTargetOnePunchHandler(null))
    )
  );

  protected action(target: Role[]) {
    this.consoleUseSkill(target);
    target.forEach((target_role) => {
      this.handler.handleUseSkill(target_role, this.role);
    });
    return;
  }
}

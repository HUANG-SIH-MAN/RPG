import { Role } from "./role";
import { PetrochemicaState, PoisonedState } from "./state";

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
    const target_name = target.map((target) => target.showName);
    console.log(
      `${this.role.name} 對 ${target_name.join(",")} 使用了 ${this.name}`
    );
    this.role.attack(target, this.harm);
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
    console.log(`${this.role.name} 使用了 自我治療。`);
    target[0].addHp(-this.harm);
    return;
  }
}

export class PetrochemicalStrategy extends SkillAbstractStrategy {
  protected name: string = "石化";
  protected mp: number = 100;
  protected harm: number = 0;

  protected action(target: Role[]) {
    const target_name = target.map((target) => target.showName);
    console.log(
      `${this.role.name} 對 ${target_name.join(",")} 使用了 ${this.name}`
    );

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
    const target_name = target.map((target) => target.showName);
    console.log(
      `${this.role.name} 對 ${target_name.join(",")} 使用了 ${this.name}`
    );

    target.forEach((target_role) => {
      const state_round = this.role.troop.id > target_role.troop.id ? 1 : 0;
      target_role.changeState(new PoisonedState(target_role, state_round));
    });

    return;
  }
}

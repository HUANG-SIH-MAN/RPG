import { Role } from "./role";

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
    this.attack(target);
    this.afterAttack(target);
  }

  protected getPotentialTarget() {
    return this.role.troop.getAllEnemy();
  }

  protected getTargetNumber() {
    return 1;
  }

  protected abstract attack(target: Role[]): void;
  protected afterAttack(target: Role[]) {
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

  protected attack(target: Role[]) {
    const target_name = target.map((target) => target.showName);
    console.log(`${this.role.name} 攻擊 ${target_name.join(",")}。`);
    this.role.attack(target, this.harm);
    return;
  }
}

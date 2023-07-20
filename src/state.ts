import { Role } from "./role";

export abstract class State {
  protected abstract _name: string;
  protected role: Role;
  protected abstract affect_round: number;
  protected state_round: number;

  constructor(role: Role, state_round: number = 1) {
    this.role = role;
    this.state_round = state_round;
  }

  public startRound() {
    this.state_round++;
    if (this.state_round > this.affect_round) {
      this.role.changeState(new NormalState(this.role));
    }

    this.consoleRoleInfo();
    return;
  }

  public async action() {
    const skill = await this.role.getActionChoose();
    await skill.useSkill();
    return;
  }

  public attack(target: Role[], harm: number) {
    target.forEach((target_role) => {
      console.log(
        `${this.role.showName} 對 ${target_role.showName} 造成 ${harm} 點傷害。`
      );
      target_role.beAttacked(harm);
    });

    return;
  }

  protected consoleRoleInfo() {
    console.log(
      `輪到 ${this.role.showName} (HP: ${this.role.hp}, MP: ${this.role.mp}, STR: ${this.role.str}, State: ${this.role.state.name})。`
    );
    return;
  }

  get name() {
    return this._name;
  }
}

export class NormalState extends State {
  protected _name: string = "正常";
  protected affect_round: number = 999;
}

export class PetrochemicaState extends State {
  protected _name: string = "石化";
  protected affect_round: number = 3;

  async action() {
    return;
  }
}

export class PoisonedState extends State {
  protected _name: string = "中毒";
  protected affect_round: number = 3;
  private harm: number = 30;

  public startRound() {
    this.state_round++;

    if (this.state_round > this.affect_round) {
      this.role.changeState(new NormalState(this.role));
      this.consoleRoleInfo();
      return;
    }

    this.consoleRoleInfo();
    this.role.addHp(-this.harm);
    if (this.role.hp <= 0) {
      this.action = async () => {};
    }

    return;
  }
}

export class CheerupState extends State {
  protected _name: string = "受到鼓舞";
  protected affect_round: number = 3;
  private add_harm: number = 50;

  public attack(target: Role[], harm: number) {
    const total_harm = harm + this.add_harm;
    super.attack(target, total_harm);
    return;
  }
}

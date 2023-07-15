import { Role } from "./role";

export abstract class State {
  protected abstract _name: string;
  protected role: Role;

  constructor(role: Role) {
    this.role = role;
  }

  public startRound() {
    console.log(
      `輪到 ${this.role.showName} (HP: ${this.role.hp}, MP: ${this.role.mp}, STR: ${this.role.str}, State: ${this.role.state.name})。`
    );
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

  get name() {
    return this._name;
  }
}

export class NormalState extends State {
  protected _name: string = "正常";
}

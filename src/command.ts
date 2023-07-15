import { SkillStrategy } from "./skill";

export class ActionCommand {
  private command_map: { [key: number]: SkillStrategy } = {};

  public setCommand(command: number, skill: SkillStrategy) {
    this.command_map[command] = skill;
    return;
  }

  public getSkill(command: number) {
    return this.command_map[command];
  }

  public getSkillChoose() {
    let choose = "";
    Object.keys(this.command_map).forEach((key) => {
      choose += `(${key}) ${this.command_map[Number(key)].getName()} `;
    });

    return choose;
  }

  public getSkillAmount() {
    return Object.keys(this.command_map).length;
  }
}

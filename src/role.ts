import { State, NormalState } from "./state";
import { Troop } from "./game";
import {
  SkillStrategy,
  NormalAttackStrategy,
  WaterballStrategy,
  FireballStrategy,
  SelfHealingStrategy,
  PetrochemicalStrategy,
  PoisonStrategy,
  SummonStrategy,
  SelfExplosionStrategy,
  CheerupStrategy,
  CurseStrategy,
  OnePunchStrategy,
} from "./skill";
import { ActionCommand } from "./command";
import readline from "./readline";

export abstract class Role {
  private _name: string;
  protected _hp: number;
  protected _mp: number;
  protected _str: number;
  private _state: State;
  private _troop: Troop;
  protected command: ActionCommand;
  private cursers: Set<Role> = new Set();

  abstract getActionChoose(): Promise<SkillStrategy>;
  abstract chooseTarget(
    potential_target: Role[],
    target_amount: number
  ): Promise<Role[]>;

  constructor(name: string, troop: Troop) {
    this._name = name;
    this._hp = Math.floor(Math.random() * 1000) + 300;
    this._mp = Math.floor(Math.random() * 500) + 200;
    this._str = Math.floor(Math.random() * 50) + 10;
    this._state = new NormalState(this);
    this.command = new ActionCommand();
    this.setActionCommand();
    this._troop = troop;
    this._troop.addRole(this);
  }

  protected setActionCommand() {
    this.command.setCommand(0, new NormalAttackStrategy(this));
    this.command.setCommand(1, new WaterballStrategy(this));
    this.command.setCommand(2, new FireballStrategy(this));
    this.command.setCommand(3, new SelfHealingStrategy(this));
    this.command.setCommand(4, new PetrochemicalStrategy(this));
    this.command.setCommand(5, new PoisonStrategy(this));
    this.command.setCommand(6, new SummonStrategy(this));
    this.command.setCommand(7, new SelfExplosionStrategy(this));
    this.command.setCommand(8, new CheerupStrategy(this));
    this.command.setCommand(9, new CurseStrategy(this));
    this.command.setCommand(10, new OnePunchStrategy(this));
  }

  public startRround() {
    this._state.startRound();
    return;
  }

  public async action() {
    await this._state.action();
    return;
  }

  public addMp(mp: number) {
    this._mp += mp;
    if (this._mp < 0) {
      throw Error("mp can't small than 0");
    }
    return;
  }

  public attack(target: Role[], harm: number) {
    this.state.attack(target, harm);
    return;
  }

  public beAttacked(harm: number) {
    this.addHp(-harm);
    return;
  }

  public addHp(hp: number) {
    this._hp += hp;

    if (this._hp <= 0) {
      this.die();
    }

    return;
  }

  public addCurser(curser: Role) {
    this.cursers.add(curser);
    return;
  }

  protected die() {
    console.log(`${this.showName} 死亡。`);

    this.cursers.forEach((curser) => {
      if (curser.hp > 0) {
        curser.addHp(this._mp);
      }
    });
  }

  public changeState(state: State) {
    this._state = state;
  }

  get name() {
    return this._name;
  }

  get hp() {
    return this._hp;
  }

  get mp() {
    return this._mp;
  }

  get str() {
    return this._str;
  }

  get troop() {
    return this._troop;
  }

  get state() {
    return this._state;
  }

  get showName() {
    return `[${this._troop.id}]${this._name}`;
  }
}

export class Hero extends Role {
  public async getActionChoose(): Promise<SkillStrategy> {
    const choose = this.command.getSkillChoose();
    const action = await readline.heroAction(choose);
    const skill = this.command.getSkill(action);

    if (!skill) {
      console.log("輸入錯誤，請重新選擇技能");
      return await this.getActionChoose();
    }

    if (skill.getMp() > this.mp) {
      console.log("你缺乏 MP，不能進行此行動。");
      return await this.getActionChoose();
    }
    return skill;
  }

  public async chooseTarget(
    potential_target: Role[],
    target_amount: number
  ): Promise<Role[]> {
    if (potential_target.length <= target_amount) {
      return potential_target;
    }

    let choose = "";
    potential_target.forEach((role, index) => {
      choose += `(${index}) ${role.showName} `;
    });

    const target_index = await readline.chooseTarget(choose, target_amount);

    const result: Role[] = [];
    target_index.forEach((index) => {
      const target = potential_target[index];
      if (target) {
        result.push(target);
      }
    });

    if (result.length !== target_amount) {
      console.log("目標選擇錯誤，請重新選擇！");
      return await this.chooseTarget(potential_target, target_amount);
    }

    return result;
  }
}

export class AI extends Role {
  private seed: number = 0;

  public async getActionChoose(): Promise<SkillStrategy> {
    const action = this.seed % this.command.getSkillAmount();
    const skill = this.command.getSkill(action);
    this.seed++;
    if (skill.getMp() > this.mp) {
      return await this.getActionChoose();
    }
    return skill;
  }

  public async chooseTarget(potential_target: Role[], target_amount: number) {
    if (potential_target.length <= target_amount) {
      return potential_target;
    }

    const start = this.seed % target_amount;
    const result = potential_target.slice(start, start + target_amount);

    if (result.length !== target_amount) {
      result.push(...potential_target.slice(0, target_amount - result.length));
    }

    this.seed++;
    return result;
  }
}

export class Slime extends AI {
  private owner: Role;

  constructor(name: string, troop: Troop, owner: Role) {
    super(name, troop);
    this._hp = 100;
    this._mp = 0;
    this._str = 50;
    this.owner = owner;
    this.setActionCommand();
  }

  protected setActionCommand() {
    this.command.setCommand(0, new NormalAttackStrategy(this));
  }

  protected die() {
    super.die();
    if (this.owner.hp > 0) {
      this.owner.addHp(30);
    }
    return;
  }
}

// conflicting forces -> problem -> pattern-> solution

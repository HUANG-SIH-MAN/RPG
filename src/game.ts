import { Role, Hero, AI } from "./role";

export class Game {
  private troops: Troop[] = [];
  private hero: Hero;

  constructor() {
    const troop_1 = new Troop("軍隊１", this);
    const troop_2 = new Troop("軍隊２", this);

    this.hero = new Hero("英雄", troop_1);
    new AI("AI 1號", troop_1);
    new AI("AI 2號", troop_1);
    new AI("AI 3號", troop_2);
    new AI("AI 4號", troop_2);
  }

  // FIXME: 史萊姆不會在當回合行動
  public async startRound(): Promise<void> {
    for (const troop of this.troops) {
      const alive_roles = troop.getAliveRole();
      for (const role of alive_roles) {
        role.startRround();
        await role.action();
        if (this.isGameOver()) {
          return;
        }
      }
    }
    return await this.startRound();
  }

  public getEnemyTroop(self_troop: Troop) {
    return this.troops.filter((troop) => troop !== self_troop);
  }

  public addTroop(troop: Troop) {
    this.troops.push(troop);
    return;
  }

  private isGameOver() {
    if (this.hero.hp <= 0) {
      console.log("你失敗了！");
      return true;
    }

    if (this.hero.troop.getAllEnemy().length === 0) {
      console.log("你獲勝了！");
      return true;
    }

    return false;
  }

  get troopAmount() {
    return this.troops.length;
  }
}

export class Troop {
  private _id: number;
  private _name: string;
  private roles: Role[] = [];
  private _game: Game;

  constructor(name: string, game: Game) {
    this._name = name;
    this._id = game.troopAmount + 1;
    this._game = game;
    game.addTroop(this);
  }

  public addRole(role: Role) {
    this.roles.push(role);
    return;
  }

  public getAliveRole() {
    return this.roles.filter((role) => role.hp > 0);
  }

  public getAlly(role: Role) {
    return this.getAliveRole().filter((ally) => ally !== role);
  }

  public getAllEnemy() {
    const result: Role[] = [];
    const enemy_troops = this._game.getEnemyTroop(this);
    enemy_troops.forEach((troop) => {
      result.push(...troop.getAliveRole());
    });
    return result;
  }

  get name() {
    return this._name;
  }

  get id() {
    return this._id;
  }

  get game() {
    return this._game;
  }
}

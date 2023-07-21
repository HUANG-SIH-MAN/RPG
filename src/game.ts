import { Role, Hero, AI } from "./role";

export class Game {
  private troops: Troop[] = [];
  private hero: Hero;

  constructor() {
    const troop_1 = new Troop("軍隊１", this);
    const troop_2 = new Troop("軍隊２", this);

    this.hero = new Hero("英雄", troop_1);
    new AI("AI 1號", troop_2);
    // new AI("AI 2號", troop_1);
    // new AI("AI 3號", troop_2);
    // new AI("AI 4號", troop_2);
  }

  public async startRound(): Promise<void> {
    let now_player: Role | null = this.getNextPlayer(null);

    while (now_player) {
      now_player.startRround();
      await now_player.action();

      if (this.isGameOver()) {
        return;
      }

      now_player = this.getNextPlayer(now_player);
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

  public getNextTroop(troop: Troop) {
    const index = this.troops.indexOf(troop);
    return this.troops[index + 1];
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

  private getNextPlayer(now_player: Role | null): Role | null {
    let next_player: Role | null;

    if (now_player) {
      next_player = now_player.troop.getNextPlayer(now_player);
    } else {
      next_player = this.troops[0]?.roles[0] || null;
    }

    if (next_player && next_player.hp <= 0) {
      return this.getNextPlayer(next_player);
    }

    return next_player;
  }

  get troopAmount() {
    return this.troops.length;
  }
}

export class Troop {
  private _id: number;
  private _name: string;
  private _roles: Role[] = [];
  private _game: Game;

  constructor(name: string, game: Game) {
    this._name = name;
    this._id = game.troopAmount + 1;
    this._game = game;
    game.addTroop(this);
  }

  public addRole(role: Role) {
    this._roles.push(role);
    return;
  }

  public getAliveRole() {
    return this._roles.filter((role) => role.hp > 0);
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

  public getNextPlayer(now_player: Role): Role | null {
    const alive_role = this.getAliveRole();
    const index = alive_role.indexOf(now_player);
    let next_player: Role | null = alive_role[index + 1];

    if (!next_player) {
      const troop = this._game.getNextTroop(this);
      next_player = troop?.getAliveRole()[0] || null;
    }

    return next_player;
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

  get roles() {
    return this._roles;
  }
}

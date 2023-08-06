import { Socket } from "net";
import { EventEmitter } from "stream";
import { GameBoard } from "../structures/GameBoard";
import { Player } from "../structures/Player";
import { GameSquareCoord } from "./server/game/GameBoard";

export class GameClient {
  client = new Socket();
  board = new GameBoard(10, 10);
  public emitter = new EventEmitter();

  constructor(private host: string, private port: number) {}

  async connect() {
    return new Promise<void>((resolve) => {
      this.client.on("data", (data) => {
        this.handleData(data);
      });

      this.client.connect(this.port, this.host, function () {
        console.log(`Connected to ${this.host}:${this.port}`);
        resolve();
      });
    });
  }

  async login(): Promise<Player> {
    await this.send({ action: "new-client" });

    return new Promise((resolve) => {
      this.emitter.on("loginSuccess", (player: Player) => {
        resolve(player);
      });
    });
  }

  async claimSquare(player: Player, coord: GameSquareCoord): Promise<void> {
    await this.send({ action: "claim-square", player, ...coord });
  }

  async unlockSquare(player: Player, coord: GameSquareCoord): Promise<void> {
    await this.send({ action: "unlock-square", player, ...coord });
  }

  async lockSquare(player: Player, coord: GameSquareCoord): Promise<void> {
    await this.send({ action: "lock-square", player, ...coord });
  }

  send(json: Record<string, unknown>): Promise<void> {
    const data = Buffer.from(JSON.stringify(json));

    return new Promise((resolve, reject) => {
      this.client.write(data, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private handleData(data: Buffer) {
    const jsonData = this.getJSON(data);

    for (const data of jsonData) {
      this.handleJSON(data);
    }
  }

  private handleJSON(jsonData: Record<string, any>) {
    console.log(jsonData);

    if (jsonData.type === "update") {
      switch (jsonData.action) {
        case "claim-square":
          this.emitter.emit(
            "boardChange",
            this.board.alterSquare({ x: jsonData.x, y: jsonData.y }, (s) => {
              s.claimFor(jsonData.player);
              return s;
            })
          );
          break;

        case "lock-square":
          this.emitter.emit(
            "boardChange",
            this.board.alterSquare({ x: jsonData.x, y: jsonData.y }, (s) => {
              s.lock(jsonData.player);
              return s;
            })
          );
          break;

        case "unlock-square":
          this.emitter.emit(
            "boardChange",
            this.board.alterSquare({ x: jsonData.x, y: jsonData.y }, (s) => {
              s.unlock(jsonData.player);
              return s;
            })
          );
          break;

        case "game-end":
          this.emitter.emit("gameEnd", jsonData.scores);
          break;

        case "game-start":
          this.emitter.emit("gameStart");
          break;
      }
    } else if (jsonData.type === "success") {
      if (jsonData.player) {
        this.emitter.emit("loginSuccess", jsonData.player);
      }
    }
  }

  private getJSON(data: Buffer): Array<Record<string, any>> {
    return data
      .toString()
      .split("\n")
      .filter((s) => !!s)
      .map((s) => {
        try {
          return JSON.parse(s);
        } catch {
          console.log(s);
          return {};
        }
      });
  }
}

import { Socket } from "net";
import { ClientAction } from "../game/ClientAction";
import { ClientController } from "../game/ClientController";
import { Player } from "../game/Player";
import { GameServer } from "./GameServer";

export class Client {
  private controller: ClientController;
  public player!: Player;

  constructor(private connection: Socket, server: GameServer) {
    this.controller = new ClientController(server);
  }

  public setPlayer(player: Player) {
    this.player = player;
  }

  public handleData(data: Buffer) {
    const decoded = this.decodeData(data);

    const response = this.controller.handle(decoded as ClientAction, this);

    this.connection.write(response);
  }

  public handleError(err: Error) {
    console.log(`Connection ${this.getRemoteAddress()} error: ${err.message}`);
  }

  public handleClose() {
    console.log(`Connection from ${this.getRemoteAddress()} closed`);
  }

  public getRemoteAddress(): string {
    return `${this.connection.remoteAddress}:${this.connection.remotePort}`;
  }

  public send(data: Buffer): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connection.write(data, (err) => {
        if (err) {
          reject(err);
        }

        resolve();
      });
    });
  }

  private decodeData(data: Buffer): Record<string, any> {
    try {
      return JSON.parse(data.toString());
    } catch (e: unknown) {
      if (e instanceof SyntaxError) {
        return {};
      } else throw e;
    }
  }
}

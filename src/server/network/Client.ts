import { Socket } from "net";
import { ClientAction } from "../game/ClientAction";
import { ClientController } from "../game/ClientController";
import { ServerPlayer } from "../game/ServerPlayer";
import { GameServer } from "./GameServer";

/** Handles requests from a player's client */
export class PlayerClientHandler {
  /** The controller performs actions based on the incoming packets */
  private controller: ClientController;
  /** The player to which the handler belongs */
  public player!: ServerPlayer;

  constructor(private connection: Socket, server: GameServer) {
    this.controller = new ClientController(server);
  }

  /** Stores the player for this client when one is generated */
  public setPlayer(player: ServerPlayer) {
    this.player = player;
  }

  /**
   * Decodes the data, and passes of the packet to the ClientController
   * @param data The incoming data from the socket
   */
  public handleData(data: Buffer) {
    const decoded = this.decodeData(data);

    for (const action of decoded) {
      const response = this.controller.handle(action as ClientAction, this);
      this.connection.write(response);
    }
  }

  /**
   * Handles socket network errors
   * @param err The incoming error from the socket
   */
  public handleError(err: Error) {
    console.log(`Connection ${this.getRemoteAddress()} error: ${err.message}`);
  }

  /**
   * Handles the closing of the socket
   */
  public handleClose() {
    console.log(`Connection from ${this.getRemoteAddress()} closed`);
  }

  /** Returns the remote address as a string for debugging */
  public getRemoteAddress(): string {
    return `${this.connection.remoteAddress}:${this.connection.remotePort}`;
  }

  /**
   * Writes data to the socket, addressed to the client
   * @param data The data to write to the socket
   */
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

  /**
   * Parse the string contained inside the packet as JSON data.
   * Note: this function splits the data on newlines in case two messages
   * are sent very close together and arrive as a single packet
   * @param data The incoming data from the socket
   */
  private decodeData(data: Buffer): Record<string, any>[] {
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

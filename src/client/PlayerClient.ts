import { Socket } from "net";
import { EventEmitter } from "stream";
import { GameSquareCoord } from "../server/game/ServerGameBoard";
import { GameBoard } from "./structures/GameBoard";
import { Player } from "./structures/Player";

/** An interface for the game logic to interact with the server */
export class PlayerClient {
  /** The socket to communicate through */
  socket = new Socket();
  /** Initialize a new 10x10 board for the player */
  board = new GameBoard(10, 10);
  /** Allows the GUI to respond to server game state updates */
  public emitter = new EventEmitter();

  constructor(private host: string, private port: number) {}

  /** Start the socket, and connect to the server */
  async connect() {
    return new Promise<void>((resolve) => {
      this.socket.on("data", (data) => {
        this.handleData(data);
      });

      this.socket.connect(this.port, this.host, function () {
        console.log(`Connected to ${this.host}:${this.port}`);
        resolve();
      });
    });
  }

  /** Log a user in, generating a client ID and color for that user */
  async login(): Promise<Player> {
    await this.send({ action: "new-client" });

    return new Promise((resolve) => {
      this.emitter.on("loginSuccess", (player: Player) => {
        resolve(player);
      });
    });
  }

  /**
   * Claims a square for a user
   * @param player The player attempting to claim the square
   * @param coord The game board coordinate for the square to claim
   */
  async claimSquare(player: Player, coord: GameSquareCoord): Promise<void> {
    await this.send({ action: "claim-square", player, ...coord });
  }

  /**
   * Unlocks a square for a user
   * @param player The player attempting to unlock the square
   * @param coord The game board coordinate for the square to lock
   */
  async unlockSquare(player: Player, coord: GameSquareCoord): Promise<void> {
    await this.send({ action: "unlock-square", player, ...coord });
  }

  /**
   * Locks a square for a user
   * @param player The player attempting to lock the square
   * @param coord The game board coordinate for the square to lock
   */
  async lockSquare(player: Player, coord: GameSquareCoord): Promise<void> {
    await this.send({ action: "lock-square", player, ...coord });
  }

  /**
   * Sends a json object to the server
   * @param json The object to send to the server
   */
  send(json: Record<string, unknown>): Promise<void> {
    const data = Buffer.from(JSON.stringify(json) + "\n");

    return new Promise((resolve, reject) => {
      this.socket.write(data, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * Decodes and handles JSON data from the server
   * @param data The incoming data from the socket
   */
  private handleData(data: Buffer) {
    const jsonData = this.getJSON(data);

    for (const data of jsonData) {
      this.handleJSON(data);
    }
  }

  /**
   * Performs actions based on the JSON payload sent by the server
   * @param jsonData The payload sent by the server
   */
  private handleJSON(jsonData: Record<string, any>) {
    // Packets with a type of "update" are notifying the client of a game state change
    if (jsonData.type === "update") {
      switch (jsonData.action) {
        // A square has been claimed by a user
        case "claim-square":
          this.emitter.emit(
            "boardChange",
            this.board.alterSquare({ x: jsonData.x, y: jsonData.y }, (s) => {
              s.claimFor(jsonData.player);
              return s;
            })
          );
          break;

        // A square has been locked by a user
        case "lock-square":
          this.emitter.emit(
            "boardChange",
            this.board.alterSquare({ x: jsonData.x, y: jsonData.y }, (s) => {
              s.lock(jsonData.player);
              return s;
            })
          );
          break;

        // A square has been unlocked by a user
        case "unlock-square":
          this.emitter.emit(
            "boardChange",
            this.board.alterSquare({ x: jsonData.x, y: jsonData.y }, (s) => {
              s.unlock(jsonData.player);
              return s;
            })
          );
          break;

        // The game has ended
        case "game-end":
          this.emitter.emit("gameEnd", jsonData.scores);
          break;

        // The game has started
        case "game-start":
          this.emitter.emit("gameStart");
          break;
      }

      // Packets with a type of "success" are responding to a message the client sent
    } else if (jsonData.type === "success") {
      if (jsonData.player) {
        this.emitter.emit("loginSuccess", jsonData.player);
      }
    }
  }

  /** Parse the string contained inside the packet as JSON data.
   * Note: this function splits the data on newlines in case two messages
   * are sent very close together and arrive as a single packet
   */
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

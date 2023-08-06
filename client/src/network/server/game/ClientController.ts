import { Client } from "../network/Client";
import { GameServer } from "../network/GameServer";
import {
  ClaimSquare,
  ClientAction,
  LockSquare,
  UnlockSquare,
} from "./ClientAction";

export class ClientController {
  constructor(private server: GameServer) {}

  handle(action: ClientAction, client: Client): Buffer {
    try {
      switch (action.action) {
        case "new-client":
          return this.handleNewClient(client);

        case "claim-square":
          return this.handleClaimSquare(action);

        case "lock-square":
          return this.handleLockSquare(action);

        case "unlock-square":
          return this.handleUnlockSquare(action);

        default:
          return this.error("Invalid client action");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        return this.error(error.message);
      } else {
        return this.error(`${error}`);
      }
    }
  }

  private handleNewClient(client: Client): Buffer {
    console.log(
      `New client connecting from ${client.getRemoteAddress()} under the name`
    );

    this.server.registerClient(client);

    if (this.server.allPlayersJoined()) {
      this.server.broadcast(this.update("game-start"));
    }

    return this.success(`Successfully connected new player`, {
      player: client.player,
    });
  }

  private handleClaimSquare(data: ClaimSquare): Buffer {
    console.log(
      `Square claimed at ${data.x}, ${data.y} for player ${data.player.id}`
    );

    this.server.board.claimSquare({ x: data.x, y: data.y }, data.player);

    this.server.broadcast(
      this.update("claim-square", {
        x: data.x,
        y: data.y,
        player: data.player,
      })
    );

    if (this.server.board.checkIfGameIsOver()) {
      this.server.broadcast(
        this.update("game-end", { scores: this.server.board.getScores() })
      );
    }

    return this.success("Square successfully claimed");
  }

  private handleLockSquare(data: LockSquare): Buffer {
    console.log(
      `Square locked at ${data.x}, ${data.y} for player ${data.player}`
    );

    this.server.board.lockSquare({ x: data.x, y: data.y }, data.player);

    this.server.broadcast(
      this.update("lock-square", {
        x: data.x,
        y: data.y,
        player: data.player,
      })
    );

    return this.success("Square successfully locked");
  }

  private handleUnlockSquare(data: UnlockSquare): Buffer {
    console.log(`Square unlocked at ${data.x}, ${data.y}`);

    this.server.board.unlockSquare({ x: data.x, y: data.y }, data.player);

    this.server.broadcast(
      this.update("unlock-square", {
        x: data.x,
        y: data.y,
        player: data.player,
      })
    );

    return this.success("Square successfully unlocked");
  }

  private error(message: string): Buffer {
    return this.encode({ type: "error", message });
  }

  private success(message: string, data: Record<string, any> = {}): Buffer {
    return this.encode({ type: "success", message, ...data });
  }

  private update(action: string, data: Record<string, any> = {}): Buffer {
    return this.encode({ type: "update", action, ...data });
  }

  private encode(json: Record<string, any>): Buffer {
    return Buffer.from(JSON.stringify(json) + "\n");
  }
}

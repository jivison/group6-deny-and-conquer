import { PlayerClientHandler } from "../network/Client";
import { GameServer } from "../network/GameServer";
import {
  ClaimSquare,
  ClientAction,
  LockSquare,
  UnlockSquare,
} from "./ClientAction";

/** Handles requests from the client */
export class ClientController {
  constructor(private server: GameServer) {}

  /** Handle an incoming request from a client */
  handle(action: ClientAction, client: PlayerClientHandler): Buffer {
    try {
      switch (action.action) {
        /** A client is trying to connect to the server */
        case "new-client":
          return this.handleNewClient(client);

        /** A client is trying to claim a square */
        case "claim-square":
          return this.handleClaimSquare(action);

        /** A client is trying to lock a square */
        case "lock-square":
          return this.handleLockSquare(action);

        /** A client is trying to unlock a square */
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

  /** Connect a new client to the server, creating a player for that user */
  private handleNewClient(client: PlayerClientHandler): Buffer {
    console.log(
      `New client connecting from ${client.getRemoteAddress()} under the name`
    );

    this.server.registerClient(client);

    // If all players have joined, message the clients to start the game
    if (this.server.allPlayersJoined()) {
      this.server.broadcast(this.update("game-start"));
    }

    return this.success(`Successfully connected new player`, {
      player: client.player,
    });
  }

  /**
   * Claim a square on behalf of a user
   * @param data The incoming claim-square packet
   */
  private handleClaimSquare(data: ClaimSquare): Buffer {
    console.log(
      `Square claimed at ${data.x}, ${data.y} for player ${data.player.id}`
    );

    // Update the internal state
    this.server.board.claimSquare({ x: data.x, y: data.y }, data.player);

    // Let the clients know a square has been claimed
    this.server.broadcast(
      this.update("claim-square", {
        x: data.x,
        y: data.y,
        player: data.player,
      })
    );

    // If the game is over, message the clients
    if (this.server.board.checkIfGameIsOver()) {
      this.server.broadcast(
        this.update("game-end", { scores: this.server.board.getScores() })
      );
    }

    return this.success("Square successfully claimed");
  }

  /**
   * Lock a square on behalf of a user
   * @param data The incoming lock-square packet
   */
  private handleLockSquare(data: LockSquare): Buffer {
    console.log(
      `Square locked at ${data.x}, ${data.y} for player ${data.player}`
    );

    // Update the internal state
    this.server.board.lockSquare({ x: data.x, y: data.y }, data.player);

    // Let the clients know a square has been locked
    this.server.broadcast(
      this.update("lock-square", {
        x: data.x,
        y: data.y,
        player: data.player,
      })
    );

    return this.success("Square successfully locked");
  }

  /**
   * Unlock a square on behalf of a user
   * @param data The incoming unlock-square packet
   */
  private handleUnlockSquare(data: UnlockSquare): Buffer {
    console.log(`Square unlocked at ${data.x}, ${data.y}`);

    // Update the internal state
    this.server.board.unlockSquare({ x: data.x, y: data.y }, data.player);

    // Let the clients know a square has been unlocked
    this.server.broadcast(
      this.update("unlock-square", {
        x: data.x,
        y: data.y,
        player: data.player,
      })
    );

    return this.success("Square successfully unlocked");
  }

  /** Respond to the client with an error message */
  private error(message: string): Buffer {
    return this.encode({ type: "error", message });
  }

  /** Respond to the client with an success message */
  private success(message: string, data: Record<string, any> = {}): Buffer {
    return this.encode({ type: "success", message, ...data });
  }

  /** Update clients with a message */
  private update(action: string, data: Record<string, any> = {}): Buffer {
    return this.encode({ type: "update", action, ...data });
  }

  /** Encode a json object as a string */
  private encode(json: Record<string, any>): Buffer {
    return Buffer.from(JSON.stringify(json) + "\n");
  }
}

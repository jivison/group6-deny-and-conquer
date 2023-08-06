import { ServerPlayer } from "./ServerPlayer";

/** Incoming packets from the client */
export type ClientAction = NewClient | ClaimSquare | LockSquare | UnlockSquare;

/** Any action that involves action on a game square */
interface SquareBasedAction {
  x: number;
  y: number;
  player: ServerPlayer;
}

export interface NewClient {
  action: "new-client";
}

export interface ClaimSquare extends SquareBasedAction {
  action: "claim-square";
}

export interface LockSquare extends SquareBasedAction {
  action: "lock-square";
}

export interface UnlockSquare extends SquareBasedAction {
  action: "unlock-square";
}

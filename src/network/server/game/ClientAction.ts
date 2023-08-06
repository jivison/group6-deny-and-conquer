import { Player } from "./Player";

export type ClientAction = NewClient | ClaimSquare | LockSquare | UnlockSquare;

interface SquareBasedAction {
  x: number;
  y: number;
  player: Player;
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

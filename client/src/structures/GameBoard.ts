import { GameSquareCoord } from "../network/server/game/GameBoard";
import { GameSquare } from "./GameSquare";
import { Player } from "./Player";

export class GameBoard {
  private squares: GameSquare[][];

  constructor(rows: number, cols: number) {
    this.squares = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => new GameSquare())
    );
  }

  getSquares(): GameSquare[][] {
    return this.squares;
  }

  alterSquare(
    coord: GameSquareCoord,
    alter: (square: GameSquare) => GameSquare
  ): GameSquare[][] {
    return this.getSquares().map((r, y) =>
      r.map((s, x) => {
        if (x === coord.x && y === coord.y) {
          return alter(s);
        } else {
          return s;
        }
      })
    );
  }

  claimSquare(coord: GameSquareCoord, player: Player): void {
    const square = this.getSquare(coord);

    square.claimFor(player);
  }

  lockSquare(coord: GameSquareCoord, player: Player): void {
    const square = this.getSquare(coord);

    square.lock(player);
  }

  unlockSquare(coord: GameSquareCoord, player: Player): void {
    const square = this.getSquare(coord);

    square.unlock(player);
  }

  public getSquare(coord: GameSquareCoord): GameSquare {
    const square = this.squares[coord.y]?.[coord.x];

    if (!square) {
      throw new Error(
        `Couldn't find the game square at ${coord.x}, ${coord.y}`
      );
    }

    return square;
  }
}

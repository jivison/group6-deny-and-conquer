import { GameSquare } from "./GameSquare";
import { Player } from "./Player";

export interface GameSquareCoord {
  x: number;
  y: number;
}

export class GameBoard {
  private squares: GameSquare[][];

  constructor(rows: number, cols: number) {
    this.squares = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => new GameSquare())
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

  checkIfGameIsOver(): boolean {
    return this.allSquares().every((s) => s.isClaimed());
  }

  getScores(): [player: Player, score: number][] {
    const players = {} as Record<number, Player>;

    const scoresObj = this.allSquares().reduce((acc, square) => {
      if (!acc[square.claimant().id]) {
        players[square.claimant().id] = square.claimant();
        acc[square.claimant().id] = 1;
      } else {
        acc[square.claimant().id] += 1;
      }

      return acc;
    }, {} as Record<number, number>);

    const scores = Object.entries(scoresObj).map(
      ([playerID, score]) =>
        [players[parseInt(playerID)], score] as [Player, number]
    );

    return scores.sort(([, a], [, b]) => b - a);
  }

  private allSquares(): GameSquare[] {
    return this.squares.flat();
  }

  private getSquare(coord: GameSquareCoord): GameSquare {
    const square = this.squares[coord.y]?.[coord.x];

    if (!square) {
      throw new Error(
        `Couldn't find the game square at ${coord.x}, ${coord.y}`
      );
    }

    return square;
  }
}

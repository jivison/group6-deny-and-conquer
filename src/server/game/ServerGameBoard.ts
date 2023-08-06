import { GameSquare } from "./GameSquare";
import { ServerPlayer } from "./ServerPlayer";

export interface GameSquareCoord {
  x: number;
  y: number;
}

/** Maintains the internal game board state, acting as the source of truth for the clients */
export class ServerGameBoard {
  private squares: GameSquare[][];

  /** Initialize the game board with `rows` rows and `cols` cols */
  constructor(rows: number, cols: number) {
    this.squares = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => new GameSquare())
    );
  }

  /** Update a square to be claimed by a user */
  claimSquare(coord: GameSquareCoord, player: ServerPlayer): void {
    const square = this.getSquare(coord);

    square.claimFor(player);
  }

  /** Update a square to be locked by a user */
  lockSquare(coord: GameSquareCoord, player: ServerPlayer): void {
    const square = this.getSquare(coord);

    square.lock(player);
  }

  /** Update a square to be unlocked */
  unlockSquare(coord: GameSquareCoord, player: ServerPlayer): void {
    const square = this.getSquare(coord);

    square.unlock(player);
  }

  checkIfGameIsOver(): boolean {
    return this.allSquares().every((s) => s.isClaimed());
  }

  /** Calculate the number of tiles each player has claimed */
  getScores(): [player: ServerPlayer, score: number][] {
    const players = {} as Record<number, ServerPlayer>;

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
        [players[parseInt(playerID)], score] as [ServerPlayer, number]
    );

    // Sort scores from high to low
    return scores.sort(([, a], [, b]) => b - a);
  }

  /** Returns a single dimensional array of all the squares */
  private allSquares(): GameSquare[] {
    return this.squares.flat();
  }

  /** Retrieve a game square from the board */
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

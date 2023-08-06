import { GameSquare } from "../../server/game/GameSquare";
import { PlayerClient } from "../PlayerClient";
import { Player } from "../structures/Player";
import { DrawableSquare } from "./DrawableSquare";

interface GameSquareDisplayProps {
  /** The square to display */
  square: GameSquare;
  /** The user's client */
  client: PlayerClient;
  /** The user's player */
  player: Player;
  /** The x coordinate of the square */
  x: number;
  /** The y coordinate of the square */
  y: number;
}

/** Displays a single game square on the board */
export function GameSquareDisplay({
  square,
  player,
  client,
  x,
  y,
}: GameSquareDisplayProps) {
  /** Lock the square when the user starts drawing */
  const onDrawStart = () => {
    client.lockSquare(player, { x, y });
  };

  /** Once the user has stopped drawing, check if the user has painted over half the square
   * If they have, claim the tile, otherwise, unlock it
   */
  const onDrawStop = (canvas: HTMLCanvasElement) => {
    const paintedAmount = canvas
      .getContext("2d")
      .getImageData(0, 0, canvas.width, canvas.height)
      .data.reduce((count, channel) => count + (channel !== 0 ? 1 : 0), 0);

    if (paintedAmount > (canvas.width * canvas.height) / 2) {
      client.claimSquare(player, { x, y });
      return true;
    } else {
      client.unlockSquare(player, { x, y });
      return false;
    }
  };

  return (
    <DrawableSquare
      key={`square-x${x}y${y}`}
      className={`square ${square.isLockedFor(player) ? "locked" : ""}`}
      drawColor={player.color}
      onDrawStop={onDrawStop}
      onDrawStart={onDrawStart}
      disabled={square.isLockedFor(player) || square.isClaimed()}
      fill={square.isClaimed() ? square.claimant().color : undefined}
      lineWidth={20}
    />
  );
}

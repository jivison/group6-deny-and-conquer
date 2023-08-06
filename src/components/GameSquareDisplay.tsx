import { GameClient } from "../network/GameClient";
import { GameSquare } from "../structures/GameSquare";
import { Player } from "../structures/Player";
import { DrawableSquare } from "./DrawableSquare";

export function GameSquareDisplay({
  square,
  player,
  client,
  x,
  y,
}: {
  square: GameSquare;
  client: GameClient;
  player: Player;
  x: number;
  y: number;
}) {
  const onDrawStart = () => {
    client.lockSquare(player, { x, y });
  };

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

// style={{ backgroundColor: square.claimant()?.color }}

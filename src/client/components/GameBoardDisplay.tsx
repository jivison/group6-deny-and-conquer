import { useState } from "react";
import { GameSquare } from "../../server/game/GameSquare";
import { PlayerClient } from "../PlayerClient";
import { Player } from "../structures/Player";
import "./GameBoardDisplay.css";
import { GameSquareDisplay } from "./GameSquareDisplay";

interface GameBoardDisplay {
  /** The user's client, used for dispatching and responding to events */
  client: PlayerClient;
  /** The user's player */
  player: Player;
}

export function GameBoardDisplay({ client, player }: GameBoardDisplay) {
  const [squares, setSquares] = useState(client.board.getSquares());

  client.emitter.on("boardChange", (newSquares: GameSquare[][]) => {
    setSquares(newSquares);
  });

  return (
    <div className="wrapper">
      <h1>
        Playing as{" "}
        <span style={{ color: player.color }}>Player {player.id + 1}</span>
      </h1>

      <div className="game-board">
        {squares.map((r, y) => (
          <>
            {r.map((s, x) => (
              <GameSquareDisplay
                key={`x${x}y${y}`}
                client={client}
                square={s}
                x={x}
                y={y}
                player={player}
              />
            ))}
          </>
        ))}
      </div>
    </div>
  );
}

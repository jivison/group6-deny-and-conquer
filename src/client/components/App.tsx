import { useState } from "react";
import { config } from "../../server/config";
import { GameServer } from "../../server/network/GameServer";
import { PlayerClient } from "../PlayerClient";
import { Player } from "../structures/Player";
import { GameBoardDisplay } from "./GameBoardDisplay";
import { ScoresPage } from "./ScoresPage";
import { StartPage } from "./StartPage";
import { WaitingPage } from "./WaitingPage";

/**
 * The application component, controls all logic and UI
 */
export function App() {
  const [playerClient, setPlayerClient] = useState<PlayerClient | undefined>(
    undefined
  );
  const [player, setPlayer] = useState<Player | undefined>(undefined);
  const [scores, setScores] = useState<[Player, number][] | undefined>(
    undefined
  );
  const [waiting, setWaiting] = useState(true);

  // Join a remote server
  const handleJoinServer = async (ipAddress: string) => {
    const gameClient = new PlayerClient(ipAddress, 3710);

    await gameClient.connect();

    gameClient.emitter.on("gameEnd", setScores);
    gameClient.emitter.on("gameStart", () => {
      setWaiting(false);
    });

    setPlayerClient(gameClient);

    setWaiting(true);

    const player = await gameClient.login();
    setPlayer(player);
  };

  // Start a local server
  const handleStartServer = async (numberOfPlayers: number) => {
    const server = new GameServer(numberOfPlayers);

    await server.start(config.host, config.port);

    handleJoinServer("127.0.0.1");
  };

  return (
    <div className="App">
      {/* Show the login page if the user has not joined or starter a server */}
      {!scores && !player && (
        <StartPage
          onJoinServer={handleJoinServer}
          onStartServer={handleStartServer}
        />
      )}

      {/* Show the waiting page if not all players have joined */}
      {!scores && player && waiting && <WaitingPage />}

      {/* Show the game board if all players have joined */}
      {!scores && player && !waiting && (
        <GameBoardDisplay client={playerClient} player={player} />
      )}

      {/* Show the final scores if the game is over */}
      {scores && <ScoresPage scores={scores} />}
    </div>
  );
}

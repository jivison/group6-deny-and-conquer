import { useState } from "react";
import { GameClient } from "../network/GameClient";
import { config } from "../network/server/config";
import { GameServer } from "../network/server/network/GameServer";
import { Player } from "../structures/Player";
import { GameBoardDisplay } from "./GameBoardDisplay";
import { LoginPage } from "./LoginPage";
import { ScoresPage } from "./ScoresPage";
import { WaitingPage } from "./WaitingPage";

export function App() {
  const [gameClient, setGameClient] = useState<GameClient | undefined>(
    undefined
  );
  const [player, setPlayer] = useState<Player | undefined>(undefined);
  const [scores, setScores] = useState<[Player, number][] | undefined>(
    undefined
  );
  const [waiting, setWaiting] = useState(true);

  const handleJoinServer = async (ipAddress: string) => {
    const gameClient = new GameClient(ipAddress, 3710);

    await gameClient.connect();

    gameClient.emitter.on("gameEnd", setScores);
    gameClient.emitter.on("gameStart", () => {
      console.log("Starting game...");

      setWaiting(false);
    });

    setGameClient(gameClient);

    setWaiting(true);

    const player = await gameClient.login();
    setPlayer(player);
  };

  const handleStartServer = async (numberOfPlayers: number) => {
    const server = new GameServer(numberOfPlayers);

    await server.start(config.host, config.port);

    handleJoinServer("127.0.0.1");
  };

  return (
    <div className="App">
      {!scores && !player && (
        <LoginPage
          onJoinServer={handleJoinServer}
          onStartServer={handleStartServer}
        />
      )}

      {!scores && player && waiting && <WaitingPage />}

      {!scores && player && !waiting && (
        <GameBoardDisplay client={gameClient} player={player} />
      )}

      {scores && <ScoresPage scores={scores} />}
    </div>
  );
}

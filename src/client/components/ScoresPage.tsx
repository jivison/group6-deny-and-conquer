import { ServerPlayer } from "../../server/game/ServerPlayer";

interface ScoresPageProps {
  /** The scores to display, sorted frm greatest to least */
  scores: [ServerPlayer, number][];
}

/** Displays the final scores of the game */
export function ScoresPage({ scores }: ScoresPageProps) {
  return (
    <div className="ScoresPage">
      <h1>Final Scores</h1>

      {scores.map(([player, score]) => (
        <p>
          <span style={{ color: player.color }}>Player {player.id + 1}</span>
          {" – "}
          {score}
        </p>
      ))}
    </div>
  );
}

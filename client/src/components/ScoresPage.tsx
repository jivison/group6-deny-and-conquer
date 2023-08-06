import { Player } from "../network/server/game/Player";

export function ScoresPage({ scores }: { scores: [Player, number][] }) {
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

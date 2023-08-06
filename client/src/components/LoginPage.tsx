import { useState } from "react";
import "./LoginPage.css";

const defaultIP = "127.0.0.1";

export function LoginPage({
  onJoinServer,
  onStartServer,
}: {
  onJoinServer: (ipAddress: string) => void;
  onStartServer: (numberOfPlayers: number) => void;
}) {
  const [ipAddress, setIpAddress] = useState(defaultIP);
  const [numberOfPlayers, setNumberOfPlayers] = useState(0);

  return (
    <div className="LoginPage">
      <h1>Deny & Conquer</h1>

      <div className="options-container">
        <form
          className="join-server"
          onSubmit={(e) => {
            e.preventDefault();
            onJoinServer(ipAddress);
          }}
        >
          <div>
            <label htmlFor="ipAddress">IP Address</label>
            <input
              type="text"
              defaultValue={defaultIP}
              onChange={(e) => setIpAddress(e.currentTarget.value)}
            />
          </div>

          <button type="submit">Login</button>
        </form>

        <h2 className="or">or</h2>

        <div className="start-server">
          <form
            className="join-server"
            onSubmit={(e) => {
              e.preventDefault();
              onStartServer(numberOfPlayers);
            }}
          >
            <div>
              <label htmlFor="numberOfPlayers">Number of players</label>
              <input
                style={{ width: "5em" }}
                type="number"
                min={1}
                max={5}
                onChange={(e) =>
                  setNumberOfPlayers(parseInt(e.currentTarget.value))
                }
              />
            </div>

            <button type="submit">Start local server</button>
          </form>
        </div>
      </div>
    </div>
  );
}

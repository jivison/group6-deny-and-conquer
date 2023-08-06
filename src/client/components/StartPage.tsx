import { useState } from "react";
import "./StartPage.css";

const defaultIP = "127.0.0.1";

interface StartPageProps {
  /**
   * Callback for when the user attempts to join a server
   * @param ipAddress The IP address of the server to attempt to join
   */
  onJoinServer: (ipAddress: string) => void;
  /**
   * Callback for when the user attempts to start a server
   * @param numberOfPlayers The number of players to start the server with
   */
  onStartServer: (numberOfPlayers: number) => void;
}

/** Displays the start page, allowing the user to start or join a server */
export function StartPage({ onJoinServer, onStartServer }: StartPageProps) {
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

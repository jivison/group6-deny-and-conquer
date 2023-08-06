import { Server, Socket, createServer } from "net";
import { ServerGameBoard } from "../game/ServerGameBoard";
import { ServerPlayer } from "../game/ServerPlayer";
import { PlayerClientHandler } from "./Client";

/** Represents a game server, which a player can start from their client */
export class GameServer {
  /** The node.js TCP Server object */
  private server: Server;
  /** A set of connected clients */
  private clients = new Set<PlayerClientHandler>();
  /** The internal game board associated with this server */
  public board = new ServerGameBoard(10, 10);

  /**
   * @param numberOfPlayers The number of expected players for this server.
   *                        The game will not start until that many players are connected.
   */
  constructor(private numberOfPlayers: number) {
    this.server = createServer();

    this.server.on("connection", (c) => {
      this.handleConnection(c);
    });
  }

  /** Start the server and listens for incoming connections */
  async start(host: string, port: number): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen(port, host, () => {
        console.log(`Server listening at ${this.getServerAddress()}`);
        resolve();
      });
    });
  }

  /**
   * Connect a new client to the server, and generate a player for that client
   * @param client The client attempting to connect to the server
   */
  public registerClient(client: PlayerClientHandler): void {
    const player = new ServerPlayer(this.clients.size);

    client.setPlayer(player);
    this.clients.add(client);
  }

  /**
   * Sends a packet to all connected clients
   * @param data The packet to send to all connected clients
   */
  public async broadcast(data: Buffer): Promise<void> {
    console.log(
      `Broadcasting ${data.toString().trim()} to ${this.clients.size} clients`
    );

    await Promise.all([...this.clients].map((c) => c.send(data)));
  }

  /** @returns true if all players have connected */
  public allPlayersJoined(): boolean {
    return this.clients.size === this.numberOfPlayers;
  }

  /**
   * Associates an incoming connection with a client handler
   * @param socket The socket for the client attempting to connect
   */
  private handleConnection(socket: Socket): void {
    const client = new PlayerClientHandler(socket, this);

    socket.on("data", client.handleData.bind(client));
    socket.on("close", client.handleClose.bind(client));
    socket.on("error", client.handleError.bind(client));
  }

  /**
   * @returns A string representing the server's address for debugging
   */
  private getServerAddress(): string {
    const address = this.server.address();

    if (typeof address === "string") {
      return address;
    } else if (!address) {
      return "";
    } else {
      return `${address.address}:${address.port} (${address.family})`;
    }
  }
}

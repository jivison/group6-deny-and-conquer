import { Server, Socket, createServer } from "net";
import { GameBoard } from "../game/GameBoard";
import { Player } from "../game/Player";
import { Client } from "./Client";

export class GameServer {
  private server: Server;
  private clients = new Set<Client>();
  public board = new GameBoard(10, 10);

  constructor(private numberOfPlayers: number) {
    this.server = createServer();

    this.server.on("connection", (c) => {
      this.handleConnection(c);
    });
  }

  async start(host: string, port: number): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen(port, host, () => {
        console.log(`Server listening at ${this.getServerAddress()}`);
        resolve();
      });
    });
  }

  public registerClient(client: Client): void {
    const player = new Player(this.clients.size);

    client.setPlayer(player);
    this.clients.add(client);
  }

  public async broadcast(data: Buffer): Promise<void> {
    console.log(
      `Broadcasting ${data.toString().trim()} to ${this.clients.size} clients`
    );

    await Promise.all([...this.clients].map((c) => c.send(data)));
  }

  public allPlayersJoined(): boolean {
    return this.clients.size === this.numberOfPlayers;
  }

  private handleConnection(c: Socket): void {
    const client = new Client(c, this);

    c.on("data", client.handleData.bind(client));
    c.on("close", client.handleClose.bind(client));
    c.on("error", client.handleError.bind(client));
  }

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

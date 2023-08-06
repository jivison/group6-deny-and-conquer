const colors: string[] = ["red", "green", "blue", "gold", "orange"];

/** Represents a player on the server side */
export class ServerPlayer {
  public color: string;

  constructor(public id: number) {
    this.color = colors[id];
  }
}

const colors: string[] = ["red", "green", "blue", "yellow", "orange"];

export class Player {
  public color: string;

  constructor(public id: number) {
    this.color = colors[id];
  }
}

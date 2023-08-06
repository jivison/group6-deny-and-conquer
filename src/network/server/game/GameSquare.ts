import { Player } from "./Player";

export class GameSquare {
  private claimedBy?: Player = undefined;
  private lockedBy?: Player = undefined;

  claimFor(player: Player) {
    if (this.claimedBy) {
      throw new Error("That square has already been claimed");
    } else if (this.isLockedFor(player)) {
      throw new Error("That square can't be claimed");
    }

    this.claimedBy = player;
  }

  public lock(player: Player): void {
    if (this.isLockedFor(player)) {
      throw new Error(
        `That square has already been locked by ${this.lockedBy}`
      );
    }

    this.lockedBy = player;
  }

  public unlock(player: Player): void {
    if (this.lockedBy?.id !== player.id) {
      throw new Error(
        `That player cannot unlock that square as it locked by ${this.lockedBy}`
      );
    }

    this.lockedBy = undefined;
  }

  public isLockedFor(player: Player): boolean {
    return this.lockedBy && this.lockedBy?.id !== player.id;
  }

  public isClaimed(): boolean {
    return !!this.claimedBy;
  }

  public claimant(): Player | undefined {
    return this.claimedBy;
  }
}

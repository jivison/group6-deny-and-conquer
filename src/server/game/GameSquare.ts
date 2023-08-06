import { ServerPlayer } from "./ServerPlayer";

/** Represent a square on the game board */
export class GameSquare {
  /** The player which claimed this square, if any */
  private claimedBy?: ServerPlayer = undefined;
  /** The player which locked this square, if any */
  private lockedBy?: ServerPlayer = undefined;

  /**
   * Claims this square for a player
   * @param player The player to claim for
   */
  claimFor(player: ServerPlayer) {
    if (this.claimedBy) {
      throw new Error("That square has already been claimed");
    } else if (this.isLockedFor(player)) {
      throw new Error("That square can't be claimed");
    }

    this.claimedBy = player;
  }

  /**
   * Locks this square for a player
   * @param player The player to lock for
   */
  public lock(player: ServerPlayer): void {
    if (this.isLockedFor(player)) {
      throw new Error(
        `That square has already been locked by ${this.lockedBy}`
      );
    }

    this.lockedBy = player;
  }

  /**
   * Unlocks a square for a player
   * @param player The player attempting to unlock the square
   */
  public unlock(player: ServerPlayer): void {
    if (this.lockedBy?.id !== player.id) {
      throw new Error(
        `That player cannot unlock that square as it locked by ${this.lockedBy}`
      );
    }

    this.lockedBy = undefined;
  }

  /**
   * Checks if a square is locked for a player
   * @param player The player checking if this square is locked
   * @returns
   */
  public isLockedFor(player: ServerPlayer): boolean {
    return this.lockedBy && this.lockedBy?.id !== player.id;
  }

  /** Returns true if this square has been claimed by any user */
  public isClaimed(): boolean {
    return !!this.claimedBy;
  }

  /** Returns the player who claimed this square, if any */
  public claimant(): ServerPlayer | undefined {
    return this.claimedBy;
  }
}

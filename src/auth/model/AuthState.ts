// Mental model:
// LOGGED_OUT → no session exists
// LOCKED → session exists, PIN required
// UNLOCKED → app usable

export type AuthState = "LOGGED_OUT" | "LOCKED" | "UNLOCKED";

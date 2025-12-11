export enum AppState {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  OPENING = 'OPENING',
  REVEALED = 'REVEALED',
}

export enum AppMode {
  ORACLE = 'ORACLE',
  GAME = 'GAME',
}

export interface Reading {
  title: string;
  prophecy: string;
}
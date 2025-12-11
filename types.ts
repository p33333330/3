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

export enum RevealType {
  BOOK = 'BOOK',
  ARTIFACT = 'ARTIFACT',
}

export interface Reading {
  title: string;
  prophecy: string;
}
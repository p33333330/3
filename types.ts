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
  ZODIAC_WHITE = 'ZODIAC_WHITE',
  ZODIAC_GOLD = 'ZODIAC_GOLD',
}

export interface Reading {
  title: string;
  prophecy: string;
}
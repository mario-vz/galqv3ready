export type Language = 'es' | 'gl';

export interface Translation {
  es: string;
  gl: string;
}

export interface Translations {
  [key: string]: Translation | Translations;
}

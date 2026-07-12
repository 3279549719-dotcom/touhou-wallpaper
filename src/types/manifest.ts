export interface Character {
  id: string;
  name: string;
  variants: number;
  files: string[];
}

export interface Manifest {
  version: number;
  source: string;
  missingIds: string[];
  characters: Character[];
}

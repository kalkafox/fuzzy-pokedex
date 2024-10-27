export interface Pokedex {
  id: number
  name: Name
  type: Type[]
  base?: Base
  species: string
  description: string
  evolution: Evolution
  profile: Profile
  image: Image
}

export interface Base {
  HP: number
  Attack: number
  Defense: number
  'Sp. Attack': number
  'Sp. Defense': number
  Speed: number
}

export interface Evolution {
  next?: Array<string[]>
  prev?: string[]
}

export interface Image {
  sprite: string
  thumbnail: string
  hires?: string
}

export interface Name {
  english: string
  japanese: string
  chinese: string
  french: string
}

export interface Profile {
  height: string
  weight: string
  egg?: Egg[]
  ability: Array<string[]>
  gender: Gender
}

export enum Egg {
  Amorphous = 'Amorphous',
  Bug = 'Bug',
  Ditto = 'Ditto',
  Dragon = 'Dragon',
  Fairy = 'Fairy',
  Field = 'Field',
  Flying = 'Flying',
  Grass = 'Grass',
  HumanLike = 'Human-Like',
  Mineral = 'Mineral',
  Monster = 'Monster',
  Undiscovered = 'Undiscovered',
  Water1 = 'Water 1',
  Water2 = 'Water 2',
  Water3 = 'Water 3',
}

export enum Gender {
  Genderless = 'Genderless',
  The001000 = '0.0:100.0',
  The0100 = '0:100',
  The1000 = '100:0',
  The100000 = '100.0:0.0',
  The125875 = '12.5:87.5',
  The250750 = '25.0:75.0',
  The2575 = '25:75',
  The500500 = '50.0:50.0',
  The5050 = '50:50',
  The7525 = '75:25',
  The875125 = '87.5:12.5',
}

export enum Type {
  Bug = 'Bug',
  Dark = 'Dark',
  Dragon = 'Dragon',
  Electric = 'Electric',
  Fairy = 'Fairy',
  Fighting = 'Fighting',
  Fire = 'Fire',
  Flying = 'Flying',
  Ghost = 'Ghost',
  Grass = 'Grass',
  Ground = 'Ground',
  Ice = 'Ice',
  Normal = 'Normal',
  Poison = 'Poison',
  Psychic = 'Psychic',
  Rock = 'Rock',
  Steel = 'Steel',
  Water = 'Water',
}

export interface EffectType {
  english: string
  chinese: string
  japanese: string
  effective: Type[]
  ineffective: Type[]
  no_effect: Type[]
}

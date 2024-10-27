import { Convert } from '@/lib/pokedex'
import { EffectType, Pokedex } from '@/types/pokedex'
import { atomWithQuery } from 'jotai-tanstack-query'
import ky from 'ky'

const urlPrefix =
  'https://raw.githubusercontent.com/Purukitto/pokemon-data.json/refs/heads/master/'

const urlSuffix = '.json'

const pokedexString = 'pokedex'
const typesString = 'types'

export const pokedexAtom = atomWithQuery<Pokedex[]>((_get) => ({
  queryKey: [pokedexString],
  queryFn: async () => {
    const res = await ky(`${urlPrefix}${pokedexString}${urlSuffix}`)

    const pokedex = Convert.toPokedex(await res.text())

    return pokedex
  },
}))

export const typesAtom = atomWithQuery<EffectType[]>((_get) => ({
  queryKey: [typesString],
  queryFn: async () => {
    const res = await ky(`${urlPrefix}${typesString}${urlSuffix}`)

    const types = Convert.toEffectType(await res.text())

    return types
  },
}))

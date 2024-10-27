import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { FastAverageColor, FastAverageColorResult } from 'fast-average-color'
import { useAtomValue } from 'jotai'
import { typesAtom } from '@/util/atom'
import { Pokedex } from '@/types/pokedex'

export function Pokemon({ pokemon }: { pokemon: Pokedex }) {
  const types = useAtomValue(typesAtom)
  const effectiveness = pokemon.type.reduce(
    (acc, type) => {
      // Find matching type data for each Pokémon type
      const typeData = types.data?.find((t) => t.english === type)

      if (typeData) {
        acc.effective[type] = typeData.effective
        acc.ineffective[type] = typeData.ineffective
        acc.noEffect[type] = typeData.no_effect
      }

      return acc
    },
    { effective: {}, ineffective: {}, noEffect: {} } as Record<
      string,
      Record<string, string[]>
    >,
  )

  const [color, setColor] = useState<FastAverageColorResult | null>(null)

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = pokemon.image.thumbnail

    img.onload = async () => {
      const fac = new FastAverageColor()

      const color = await fac.getColorAsync(img)

      setColor(color)
    }
  }, [pokemon.image.thumbnail])

  if (color === null) {
    return <></>
  }

  return (
    <div
      key={pokemon.id}
      style={{
        backgroundColor: color.rgba,
      }}
      onClick={() => {
        window.open(
          `https://www.serebii.net/pokemon/${pokemon.name.english.toLowerCase()}`,
          '_blank',
        )
      }}
      className={`rounded-lg shadow-md p-4 m-2 transition-colors w-full ${
        color.isLight ? 'text-neutral-900' : 'text-neutral-300'
      }`}>
      <div className='flex items-center'>
        <Icon
          className='h-28 w-28 absolute text-neutral-700 -ml-2'
          icon='mdi:pokeball'
        />
        <div className='bg-neutral-900/75 rounded-full'>
          <img
            src={pokemon.image.sprite}
            alt={pokemon.name.english}
            className='h-24 w-24 scale-100'
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        <h2 className='text-xl font-bold m-2'>
          <span className='font-bold'>#{pokemon.id}</span>{' '}
          {pokemon.name.english}
        </h2>

        {pokemon.type.map((type) => TypeComponent(type))}

        <img
          src={pokemon.image.thumbnail}
          alt={pokemon.name.english}
          className='h-24 w-24 right-0 absolute m-4'
        />
      </div>
      <p className='mt-2 text-xl font-bold'>{pokemon.species}</p>
      <p className='mt-2 italic'>{pokemon.description}</p>
      <p className='mt-4'>Height: {pokemon.profile.height}</p>
      <p className='mt-1'>Weight: {pokemon.profile.weight}</p>
      <div className='mt-4'>
        {pokemon.type.map((type) => (
          <div key={type} className='mt-4 '>
            <div className='text-xl font-bold'>{TypeComponent(type)}</div>
            <div className='flex items-center mt-2 gap-x-1 bg-neutral-800/80 p-2 rounded-lg'>
              <p className='font-bold'>
                {/* Effective: {effectiveness.effective[type]?.join(', ') || 'None'} */}
                <Icon
                  className='text-green-400 text-xl'
                  icon='material-symbols:check'
                />
              </p>
              {effectiveness.effective[type]?.length === 0
                ? TypeComponent('none')
                : effectiveness.effective[type]?.map((t) => TypeComponent(t))}
            </div>
            <div className='flex items-center mt-2 gap-x-1 bg-neutral-800/80 p-2 rounded-lg'>
              <p className='font-bold'>
                {/* Effective: {effectiveness.effective[type]?.join(', ') || 'None'} */}
                <Icon
                  className='text-red-400 text-xl'
                  icon='akar-icons:cross'
                />
              </p>
              {effectiveness.ineffective[type]?.length === 0
                ? TypeComponent('none')
                : effectiveness.ineffective[type]?.map((t) => TypeComponent(t))}
            </div>
            <div className='flex items-center mt-2 gap-x-1 bg-neutral-800/80 p-2 rounded-lg'>
              <p className='font-bold'>
                {/* Effective: {effectiveness.effective[type]?.join(', ') || 'None'} */}
                <Icon className='text-xl' icon='octicon:circle-slash-16' />
              </p>
              {effectiveness.noEffect[type]?.length === 0
                ? TypeComponent('none')
                : effectiveness.noEffect[type]?.map((t) => TypeComponent(t))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const colours: { [x: string]: string } = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
  none: '#a0a0a0',
}

function TypeComponent(t: string) {
  return (
    <span
      style={{ backgroundColor: colours[t.toLowerCase()] || '#000000' }}
      className='w-20 shadow-md text-center rounded-sm text-neutral-800 p-1 mr-1'>
      {t.toUpperCase()}
    </span>
  )
}

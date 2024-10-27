import { Pokedex } from './types/pokedex'
import { Autocomplete } from './components/autocomplete'
import { useAtomValue } from 'jotai'
import { pokedexAtom, typesAtom } from './util/atom'
import { Pokemon } from './components/pokemon'

function App() {
  const pokedex = useAtomValue(pokedexAtom)
  const types = useAtomValue(typesAtom)

  return (
    <>
      <div className='w-full p-8'>
        <Autocomplete
          openOnFocus={true}
          autofocus={true}
          placeholder={'Search for a Pokémon...'}
          getSources={({ query }: { query: string }) => [
            {
              sourceId: 'products',
              async getItems() {
                if (query.length === 0) {
                  const shuffledArray = [...(pokedex.data ?? [])] // Clone the array
                  for (let i = shuffledArray.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1))
                    ;[shuffledArray[i], shuffledArray[j]] = [
                      shuffledArray[j],
                      shuffledArray[i],
                    ]
                  }

                  return shuffledArray.slice(0, 50)
                }

                const terms = query.trim().toLowerCase().split(/\s+/)
                const excludeTerms = terms
                  .filter((term) => term.startsWith('-'))
                  .map((term) => term.slice(1))
                const includeTerms = terms.filter(
                  (term) =>
                    !term.startsWith('-') &&
                    !term.startsWith('e:') &&
                    !term.startsWith('i:'),
                )

                const effectiveTerms = terms
                  .filter((term) => term.startsWith('e:'))
                  .flatMap((term) => term.slice(2).split(','))
                  .map((term) => term.trim().toLowerCase())

                const ineffectiveTerms = terms
                  .filter((term) => term.startsWith('i:'))
                  .flatMap((term) => term.slice(2).split(','))
                  .map((term) => term.trim().toLowerCase())

                return pokedex.data
                  ?.filter((pokemon) => {
                    const nameMatches = includeTerms.some((term) =>
                      pokemon.name.english.toLowerCase().includes(term),
                    )

                    const typeMatches = includeTerms.some((term) =>
                      pokemon.type.some((type) =>
                        type.toLowerCase().includes(term),
                      ),
                    )

                    const excludesAny = excludeTerms.some(
                      (term) =>
                        pokemon.name.english.toLowerCase().includes(term) ||
                        pokemon.type.some((type) =>
                          type.toLowerCase().includes(term),
                        ),
                    )

                    // Check effectiveness based on Pokémon types
                    const effectivenessMatches = effectiveTerms.every((term) =>
                      pokemon.type.some((type) => {
                        const typeData = types.data?.find(
                          (t) => t.english.toLowerCase() === type.toLowerCase(),
                        )
                        return typeData
                          ? typeData.effective.some(
                              (effectiveType) =>
                                effectiveType.toLowerCase() === term,
                            )
                          : false
                      }),
                    )

                    const ineffectivenessMatches = ineffectiveTerms.every(
                      (term) =>
                        pokemon.type.some((type) => {
                          const typeData = types.data?.find(
                            (t) =>
                              t.english.toLowerCase() === type.toLowerCase(),
                          )
                          return typeData
                            ? typeData.ineffective.some(
                                (ineffectiveType) =>
                                  ineffectiveType.toLowerCase() === term,
                              )
                            : false
                        }),
                    )

                    return (
                      (nameMatches ||
                        typeMatches ||
                        effectiveTerms.length > 0 ||
                        ineffectiveTerms.length > 0) &&
                      !excludesAny &&
                      (effectiveTerms.length === 0 || effectivenessMatches) &&
                      (ineffectiveTerms.length === 0 || ineffectivenessMatches)
                    )
                  })
                  .slice(0, 50)
              },
              templates: {
                // @ts-ignore
                item({ item, components }: { item: Pokedex }) {
                  // @ts-ignore
                  return <Pokemon pokemon={item} />
                },
              },
            },
          ]}
        />
      </div>
    </>
  )
}

export default App

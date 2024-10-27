import { EffectType, Pokedex } from '@/types/pokedex'

// asserts the results of JSON.parse at runtime
export class Convert {
  public static toPokedex(json: string): Pokedex[] {
    return cast(JSON.parse(json), a(r('Pokedex')))
  }

  public static pokedexToJson(value: Pokedex[]): string {
    return JSON.stringify(uncast(value, a(r('Pokedex'))), null, 2)
  }

  public static toEffectType(json: string): EffectType[] {
    return JSON.parse(json)
  }

  public static effectTypeToJson(value: EffectType[]): string {
    return JSON.stringify(value)
  }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ''): never {
  const prettyTyp = prettyTypeName(typ)
  const parentText = parent ? ` on ${parent}` : ''
  const keyText = key ? ` for key "${key}"` : ''
  throw Error(
    `Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(
      val,
    )}`,
  )
}

function prettyTypeName(typ: any): string {
  if (Array.isArray(typ)) {
    if (typ.length === 2 && typ[0] === undefined) {
      return `an optional ${prettyTypeName(typ[1])}`
    } else {
      return `one of [${typ
        .map((a) => {
          return prettyTypeName(a)
        })
        .join(', ')}]`
    }
  } else if (typeof typ === 'object' && typ.literal !== undefined) {
    return typ.literal
  } else {
    return typeof typ
  }
}

function jsonToJSProps(typ: any): any {
  if (typ.jsonToJS === undefined) {
    const map: any = {}
    typ.props.forEach((p: any) => (map[p.json] = { key: p.js, typ: p.typ }))
    typ.jsonToJS = map
  }
  return typ.jsonToJS
}

function jsToJSONProps(typ: any): any {
  if (typ.jsToJSON === undefined) {
    const map: any = {}
    typ.props.forEach((p: any) => (map[p.js] = { key: p.json, typ: p.typ }))
    typ.jsToJSON = map
  }
  return typ.jsToJSON
}

function transform(
  val: any,
  typ: any,
  getProps: any,
  key: any = '',
  parent: any = '',
): any {
  function transformPrimitive(typ: string, val: any): any {
    if (typeof typ === typeof val) return val
    return invalidValue(typ, val, key, parent)
  }

  function transformUnion(typs: any[], val: any): any {
    // val must validate against one typ in typs
    const l = typs.length
    for (let i = 0; i < l; i++) {
      const typ = typs[i]
      try {
        return transform(val, typ, getProps)
      } catch (_) {}
    }
    return invalidValue(typs, val, key, parent)
  }

  function transformEnum(cases: string[], val: any): any {
    if (cases.indexOf(val) !== -1) return val
    return invalidValue(
      cases.map((a) => {
        return l(a)
      }),
      val,
      key,
      parent,
    )
  }

  function transformArray(typ: any, val: any): any {
    // val must be an array with no invalid elements
    if (!Array.isArray(val)) return invalidValue(l('array'), val, key, parent)
    return val.map((el) => transform(el, typ, getProps))
  }

  function transformDate(val: any): any {
    if (val === null) {
      return null
    }
    const d = new Date(val)
    if (isNaN(d.valueOf())) {
      return invalidValue(l('Date'), val, key, parent)
    }
    return d
  }

  function transformObject(
    props: { [k: string]: any },
    additional: any,
    val: any,
  ): any {
    if (val === null || typeof val !== 'object' || Array.isArray(val)) {
      return invalidValue(l(ref || 'object'), val, key, parent)
    }
    const result: any = {}
    Object.getOwnPropertyNames(props).forEach((key) => {
      const prop = props[key]
      const v = Object.prototype.hasOwnProperty.call(val, key)
        ? val[key]
        : undefined
      result[prop.key] = transform(v, prop.typ, getProps, key, ref)
    })
    Object.getOwnPropertyNames(val).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(props, key)) {
        result[key] = transform(val[key], additional, getProps, key, ref)
      }
    })
    return result
  }

  if (typ === 'any') return val
  if (typ === null) {
    if (val === null) return val
    return invalidValue(typ, val, key, parent)
  }
  if (typ === false) return invalidValue(typ, val, key, parent)
  let ref: any = undefined
  while (typeof typ === 'object' && typ.ref !== undefined) {
    ref = typ.ref
    typ = typeMap[typ.ref]
  }
  if (Array.isArray(typ)) return transformEnum(typ, val)
  if (typeof typ === 'object') {
    return typ.hasOwnProperty('unionMembers')
      ? transformUnion(typ.unionMembers, val)
      : typ.hasOwnProperty('arrayItems')
      ? transformArray(typ.arrayItems, val)
      : typ.hasOwnProperty('props')
      ? transformObject(getProps(typ), typ.additional, val)
      : invalidValue(typ, val, key, parent)
  }
  // Numbers can be parsed by Date but shouldn't be.
  if (typ === Date && typeof val !== 'number') return transformDate(val)
  return transformPrimitive(typ, val)
}

function cast<T>(val: any, typ: any): T {
  return transform(val, typ, jsonToJSProps)
}

function uncast<T>(val: T, typ: any): any {
  return transform(val, typ, jsToJSONProps)
}

function l(typ: any) {
  return { literal: typ }
}

function a(typ: any) {
  return { arrayItems: typ }
}

function u(...typs: any[]) {
  return { unionMembers: typs }
}

function o(props: any[], additional: any) {
  return { props, additional }
}

function r(name: string) {
  return { ref: name }
}

const typeMap: any = {
  Pokedex: o(
    [
      { json: 'id', js: 'id', typ: 0 },
      { json: 'name', js: 'name', typ: r('Name') },
      { json: 'type', js: 'type', typ: a(r('Type')) },
      { json: 'base', js: 'base', typ: u(undefined, r('Base')) },
      { json: 'species', js: 'species', typ: '' },
      { json: 'description', js: 'description', typ: '' },
      { json: 'evolution', js: 'evolution', typ: r('Evolution') },
      { json: 'profile', js: 'profile', typ: r('Profile') },
      { json: 'image', js: 'image', typ: r('Image') },
    ],
    false,
  ),
  Base: o(
    [
      { json: 'HP', js: 'HP', typ: 0 },
      { json: 'Attack', js: 'Attack', typ: 0 },
      { json: 'Defense', js: 'Defense', typ: 0 },
      { json: 'Sp. Attack', js: 'Sp. Attack', typ: 0 },
      { json: 'Sp. Defense', js: 'Sp. Defense', typ: 0 },
      { json: 'Speed', js: 'Speed', typ: 0 },
    ],
    false,
  ),
  Evolution: o(
    [
      { json: 'next', js: 'next', typ: u(undefined, a(a(''))) },
      { json: 'prev', js: 'prev', typ: u(undefined, a('')) },
    ],
    false,
  ),
  Image: o(
    [
      { json: 'sprite', js: 'sprite', typ: '' },
      { json: 'thumbnail', js: 'thumbnail', typ: '' },
      { json: 'hires', js: 'hires', typ: u(undefined, '') },
    ],
    false,
  ),
  Name: o(
    [
      { json: 'english', js: 'english', typ: '' },
      { json: 'japanese', js: 'japanese', typ: '' },
      { json: 'chinese', js: 'chinese', typ: '' },
      { json: 'french', js: 'french', typ: '' },
    ],
    false,
  ),
  Profile: o(
    [
      { json: 'height', js: 'height', typ: '' },
      { json: 'weight', js: 'weight', typ: '' },
      { json: 'egg', js: 'egg', typ: u(undefined, a(r('Egg'))) },
      { json: 'ability', js: 'ability', typ: a(a('')) },
      { json: 'gender', js: 'gender', typ: r('Gender') },
    ],
    false,
  ),
  Egg: [
    'Amorphous',
    'Bug',
    'Ditto',
    'Dragon',
    'Fairy',
    'Field',
    'Flying',
    'Grass',
    'Human-Like',
    'Mineral',
    'Monster',
    'Undiscovered',
    'Water 1',
    'Water 2',
    'Water 3',
  ],
  Gender: [
    'Genderless',
    '0.0:100.0',
    '0:100',
    '100:0',
    '100.0:0.0',
    '12.5:87.5',
    '25.0:75.0',
    '25:75',
    '50.0:50.0',
    '50:50',
    '75:25',
    '87.5:12.5',
  ],
  Type: [
    'Bug',
    'Dark',
    'Dragon',
    'Electric',
    'Fairy',
    'Fighting',
    'Fire',
    'Flying',
    'Ghost',
    'Grass',
    'Ground',
    'Ice',
    'Normal',
    'Poison',
    'Psychic',
    'Rock',
    'Steel',
    'Water',
  ],
}

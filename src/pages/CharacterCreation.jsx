import React, { useState, useMemo } from 'react'
import { supabase } from '../lib/supabase'

// ============ DADOS COMPLETOS (SRD + Expansões) ============

const DRACONIC_ANCESTRIES = [
  { name: 'Bronze', damage: 'Relâmpago', breath: 'Linha 5x30 pés (Dex)' },
  { name: 'Cobre', damage: 'Ácido', breath: 'Linha 5x30 pés (Dex)' },
  { name: 'Latão', damage: 'Fogo', breath: 'Linha 5x30 pés (Dex)' },
  { name: 'Prata', damage: 'Frio', breath: 'Cone 15 pés (Con)' },
  { name: 'Ouro', damage: 'Fogo', breath: 'Cone 15 pés (Dex)' },
  { name: 'Vermelho', damage: 'Fogo', breath: 'Cone 15 pés (Dex)' },
  { name: 'Azul', damage: 'Relâmpago', breath: 'Linha 5x30 pés (Dex)' },
  { name: 'Verde', damage: 'Veneno', breath: 'Cone 15 pés (Con)' },
  { name: 'Preto', damage: 'Ácido', breath: 'Linha 5x30 pés (Dex)' },
  { name: 'Branco', damage: 'Frio', breath: 'Cone 15 pés (Con)' }
]

const FIGHTING_STYLES = [
  'Arquearia (+2 ataque à distância)',
  'Combate com Armas Grandes (rerrola 1-2)',
  'Defesa (+1 CA)',
  'Duelo (+2 dano com 1 arma)',
  'Duas Armas (modificador no 2º ataque)',
  'Proteção (desvantagem em aliado)'
]

const RACES = {
  human: { name: 'Humano', bonuses: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 }, speed: 30, size: 'Médio', languages: ['Comum'], subraces: [], needsAncestry: false },
  elf: { name: 'Elfo', bonuses: { dex: 2 }, speed: 30, size: 'Médio', languages: ['Comum','Élfico'], subraces: ['high_elf','wood_elf','dark_elf'], needsAncestry: false },
  dwarf: { name: 'Anão', bonuses: { con: 2 }, speed: 25, size: 'Médio', languages: ['Comum','Anão'], subraces: ['hill_dwarf','mountain_dwarf'], needsAncestry: false },
  halfling: { name: 'Halfling', bonuses: { dex: 2 }, speed: 25, size: 'Pequeno', languages: ['Comum','Halfling'], subraces: ['lightfoot','stout'], needsAncestry: false },
  dragonborn: { name: 'Draconato', bonuses: { str: 2, cha: 1 }, speed: 30, size: 'Médio', languages: ['Comum','Dracônico'], subraces: [], needsAncestry: true },
  gnome: { name: 'Gnomo', bonuses: { int: 2 }, speed: 25, size: 'Pequeno', languages: ['Comum','Gnômico'], subraces: ['forest_gnome','rock_gnome'], needsAncestry: false },
  half_elf: { name: 'Meio-Elfo', bonuses: { cha: 2, dex: 1, con: 1 }, speed: 30, size: 'Médio', languages: ['Comum','Élfico'], subraces: [], needsAncestry: false },
  half_orc: { name: 'Meio-Orc', bonuses: { str: 2, con: 1 }, speed: 30, size: 'Médio', languages: ['Comum','Orc'], subraces: [], needsAncestry: false },
  tiefling: { name: 'Tiefling', bonuses: { int: 1, cha: 2 }, speed: 30, size: 'Médio', languages: ['Comum','Infernal'], subraces: [], needsAncestry: false },
  aasimar: { name: 'Aasimar', bonuses: { cha: 2, wis: 1 }, speed: 30, size: 'Médio', languages: ['Comum','Celestial'], subraces: [], needsAncestry: false },
  genasi: { name: 'Genasi', bonuses: { con: 2 }, speed: 30, size: 'Médio', languages: ['Comum','Primordial'], subraces: ['air_genasi','earth_genasi','fire_genasi','water_genasi'], needsAncestry: false },
  goliath: { name: 'Golias', bonuses: { str: 2, con: 1 }, speed: 30, size: 'Médio', languages: ['Comum','Gigante'], subraces: [], needsAncestry: false },
  tabaxi: { name: 'Tabaxi', bonuses: { dex: 2, cha: 1 }, speed: 30, size: 'Médio', languages: ['Comum'], subraces: [], needsAncestry: false },
  firbolg: { name: 'Firbolg', bonuses: { wis: 2, str: 1 }, speed: 30, size: 'Médio', languages: ['Comum','Élfico','Gigante'], subraces: [], needsAncestry: false }
}

const SUBRACES = {
  high_elf: { name: 'Alto Elfo', bonuses: { int: 1 } },
  wood_elf: { name: 'Elfo da Floresta', bonuses: { wis: 1 }, speed: 5 },
  dark_elf: { name: 'Drow', bonuses: { cha: 1 } },
  hill_dwarf: { name: 'Anão da Colina', bonuses: { wis: 1 } },
  mountain_dwarf: { name: 'Anão da Montanha', bonuses: { str: 2 } },
  lightfoot: { name: 'Pé-Leve', bonuses: { cha: 1 } },
  stout: { name: 'Robusto', bonuses: { con: 1 } },
  forest_gnome: { name: 'Gnomo da Floresta', bonuses: { dex: 1 } },
  rock_gnome: { name: 'Gnomo das Rochas', bonuses: { con: 1 } },
  air_genasi: { name: 'Genasi do Ar', bonuses: { dex: 1 } },
  earth_genasi: { name: 'Genasi da Terra', bonuses: { str: 1 } },
  fire_genasi: { name: 'Genasi do Fogo', bonuses: { int: 1 } },
  water_genasi: { name: 'Genasi da Água', bonuses: { wis: 1 } }
}

const CLASSES = {
  barbarian: {
    name: 'Bárbaro', hd: 12, primary: 'str', saves: ['str','con'],
    skills: ['Adestrar Animais','Atletismo','Intimidação','Natureza','Percepção','Sobrevivência'],
    skillCount: 2,
    subclasses: ['Berserker','Guerreiro Totêmico','Guardião Ancestral','Arauto da Tempestade','Zelote','Besta','Magia Selvagem'],
    features: {
      1: ['Fúria (2)','Defesa sem Armadura'],
      2: ['Ataque Imprudente','Sentido de Perigo'],
      3: ['Caminho Primitivo'],
      4: ['ASI'],
      5: ['Ataque Extra','Movimento Rápido'],
      6: ['Habilidade de Caminho'],
      7: ['Instinto Selvagem'],
      8: ['ASI'],
      9: ['Crítico Brutal (1 dado)'],
      10: ['Habilidade de Caminho'],
      11: ['Fúria Implacável'],
      12: ['ASI'],
      13: ['Crítico Brutal (2 dados)'],
      14: ['Habilidade de Caminho'],
      15: ['Fúria Persistente'],
      16: ['ASI'],
      17: ['Crítico Brutal (3 dados)'],
      18: ['Força Indomável'],
      19: ['ASI'],
      20: ['Campeão Primitivo']
    }
  },
  fighter: {
    name: 'Guerreiro', hd: 10, primary: 'str', saves: ['str','con'],
    skills: ['Acrobacia','Adestrar Animais','Atletismo','História','Intimidação','Intuição','Percepção','Sobrevivência'],
    skillCount: 2,
    subclasses: ['Campeão','Mestre de Batalha','Cavaleiro Arcano','Arqueiro Arcano','Cavaleiro','Samurai','Cavaleiro do Eco','Guerreiro Psiônico','Cavaleiro Rúnico'],
    features: {
      1: ['Estilo de Luta','Retomar Fôlego'],
      2: ['Surto de Ação (1 uso)'],
      3: ['Arquétipo Marcial'],
      4: ['ASI'],
      5: ['Ataque Extra'],
      6: ['ASI'],
      7: ['Habilidade de Arquétipo'],
      8: ['ASI'],
      9: ['Indomável (1 uso)'],
      10: ['Habilidade de Arquétipo'],
      11: ['Ataque Extra (2)'],
      12: ['ASI'],
      13: ['Indomável (2 usos)'],
      14: ['ASI'],
      15: ['Habilidade de Arquétipo'],
      16: ['ASI'],
      17: ['Surto de Ação (2 usos)','Indomável (3 usos)'],
      18: ['Habilidade de Arquétipo'],
      19: ['ASI'],
      20: ['Ataque Extra (3)']
    }
  },
  wizard: {
    name: 'Mago', hd: 6, primary: 'int', saves: ['int','wis'],
    skills: ['Arcanismo','História','Intuição','Investigação','Medicina','Religião'],
    skillCount: 2,
    subclasses: ['Evocação','Ilusão','Necromancia','Abjuração','Conjuração','Adivinhação','Encantamento','Transmutação','Magia de Guerra','Canto das Lâminas','Escriba'],
    features: {
      1: ['Conjuração','Recuperação Arcana'],
      2: ['Tradição Arcana'],
      3: ['-'],
      4: ['ASI'],
      5: ['-'],
      6: ['Habilidade de Tradição'],
      7: ['-'],
      8: ['ASI'],
      9: ['-'],
      10: ['Habilidade de Tradição'],
      11: ['-'],
      12: ['ASI'],
      13: ['-'],
      14: ['Habilidade de Tradição'],
      15: ['-'],
      16: ['ASI'],
      17: ['-'],
      18: ['Maestria em Magia'],
      19: ['ASI'],
      20: ['Magia de Assinatura']
    }
  },
  rogue: {
    name: 'Ladino', hd: 8, primary: 'dex', saves: ['dex','int'],
    skills: ['Acrobacia','Atletismo','Atuação','Enganação','Furtividade','Intimidação','Intuição','Investigação','Percepção','Persuasão','Prestidigitação'],
    skillCount: 4,
    subclasses: ['Ladrão','Assassino','Trapaceiro Arcano','Investigador','Mentor','Explorador','Fantasma','Adaga da Alma'],
    features: {
      1: ['Especialização (2)','Ataque Furtivo 1d6'],
      2: ['Ação Ardilosa'],
      3: ['Arquétipo','Ataque Furtivo 2d6'],
      4: ['ASI'],
      5: ['Esquiva Sobrenatural','Ataque Furtivo 3d6'],
      6: ['Especialização'],
      7: ['Evasão','Ataque Furtivo 4d6'],
      8: ['ASI'],
      9: ['Habilidade de Arquétipo','Ataque Furtivo 5d6'],
      10: ['ASI'],
      11: ['Talento Confiável','Ataque Furtivo 6d6'],
      12: ['ASI'],
      13: ['Habilidade de Arquétipo','Ataque Furtivo 7d6'],
      14: ['Sentido Cego'],
      15: ['Mente Escorregadia','Ataque Furtivo 8d6'],
      16: ['ASI'],
      17: ['Habilidade de Arquétipo','Ataque Furtivo 9d6'],
      18: ['Elusivo'],
      19: ['ASI','Ataque Furtivo 10d6'],
      20: ['Golpe de Sorte']
    }
  },
  cleric: {
    name: 'Clérigo', hd: 8, primary: 'wis', saves: ['wis','cha'],
    skills: ['História','Intuição','Medicina','Persuasão','Religião'],
    skillCount: 2,
    subclasses: ['Vida','Luz','Guerra','Conhecimento','Natureza','Tempestade','Trapaça','Forja','Túmulo','Ordem','Paz','Crepúsculo'],
    features: {
      1: ['Conjuração','Domínio Divino'],
      2: ['Canalizar Divindade (1/descanso)'],
      3: ['-'],
      4: ['ASI'],
      5: ['Destruir Mortos-Vivos (ND 1/2)'],
      6: ['Canalizar Divindade (2/descanso)'],
      7: ['-'],
      8: ['ASI','Destruir Mortos-Vivos (ND 1)'],
      9: ['-'],
      10: ['Intervenção Divina'],
      11: ['Destruir Mortos-Vivos (ND 2)'],
      12: ['ASI'],
      13: ['-'],
      14: ['Destruir Mortos-Vivos (ND 3)'],
      15: ['-'],
      16: ['ASI'],
      17: ['Destruir Mortos-Vivos (ND 4)'],
      18: ['Canalizar Divindade (3/descanso)'],
      19: ['ASI'],
      20: ['Intervenção Divina Aprimorada']
    }
  },
  bard: {
    name: 'Bardo', hd: 8, primary: 'cha', saves: ['dex','cha'],
    skills: ['Acrobacia','Adestrar Animais','Arcanismo','Atletismo','Atuação','Enganação','Furtividade','História','Intimidação','Intuição','Investigação','Medicina','Natureza','Percepção','Persuasão','Prestidigitação','Religião','Sobrevivência'],
    skillCount: 3,
    subclasses: ['Sabedoria','Valor','Glamour','Espadas','Sussurros','Criação','Eloquência'],
    features: {
      1: ['Conjuração','Inspiração de Bardo (d6)'],
      2: ['Versatilidade'],
      3: ['Colégio de Bardo'],
      4: ['ASI'],
      5: ['Inspiração de Bardo (d8)'],
      6: ['Habilidade de Colégio'],
      7: ['-'],
      8: ['ASI'],
      9: ['-'],
      10: ['Inspiração de Bardo (d10)','Habilidade de Colégio'],
      11: ['-'],
      12: ['ASI'],
      13: ['-'],
      14: ['Habilidade de Colégio'],
      15: ['Inspiração de Bardo (d12)'],
      16: ['ASI'],
      17: ['-'],
      18: ['-'],
      19: ['ASI'],
      20: ['-']
    }
  },
  druid: {
    name: 'Druida', hd: 8, primary: 'wis', saves: ['int','wis'],
    skills: ['Arcanismo','Adestrar Animais','Intuição','Medicina','Natureza','Percepção','Religião','Sobrevivência'],
    skillCount: 2,
    subclasses: ['Terra','Lua','Sonhos','Pastor','Estrelas','Fogo Selvagem','Esporos'],
    features: {
      1: ['Conjuração','Druídico'],
      2: ['Forma Selvagem','Círculo Druídico'],
      3: ['-'],
      4: ['ASI'],
      5: ['-'],
      6: ['Habilidade de Círculo'],
      7: ['-'],
      8: ['ASI'],
      9: ['-'],
      10: ['Habilidade de Círculo'],
      11: ['-'],
      12: ['ASI'],
      13: ['-'],
      14: ['Habilidade de Círculo'],
      15: ['-'],
      16: ['ASI'],
      17: ['-'],
      18: ['-'],
      19: ['ASI'],
      20: ['-']
    }
  },
  monk: {
    name: 'Monge', hd: 8, primary: 'dex', saves: ['str','dex'],
    skills: ['Acrobacia','Atletismo','Furtividade','História','Intuição','Religião'],
    skillCount: 2,
    subclasses: ['Punho Aberto','Sombras','Quatro Elementos','Mestre Bêbado','Kensei','Alma do Sol','Misericórdia','Eu Astral'],
    features: {
      1: ['Defesa sem Armadura','Artes Marciais (d4)'],
      2: ['Ki (2 pontos)','Movimento +10 pés'],
      3: ['Tradição Monástica'],
      4: ['ASI'],
      5: ['Ataque Extra','Artes Marciais (d6)'],
      6: ['Habilidade de Tradição'],
      7: ['Evasão'],
      8: ['ASI'],
      9: ['Movimento em Paredes'],
      10: ['Movimento +20 pés'],
      11: ['Habilidade de Tradição','Artes Marciais (d8)'],
      12: ['ASI'],
      13: ['Pureza Corporal'],
      14: ['Movimento +25 pés'],
      15: ['Corpo de Diamante'],
      16: ['ASI'],
      17: ['Habilidade de Tradição','Artes Marciais (d10)'],
      18: ['Movimento +30 pés'],
      19: ['ASI'],
      20: ['Mente Vazia']
    }
  },
  paladin: {
    name: 'Paladino', hd: 10, primary: 'str', saves: ['wis','cha'],
    skills: ['Atletismo','Intimidação','Intuição','Medicina','Persuasão','Religião'],
    skillCount: 2,
    subclasses: ['Devoção','Antigos','Vingança','Conquista','Redenção','Coroa','Vigias','Glória'],
    features: {
      1: ['Sentido Divino','Imposição de Mãos'],
      2: ['Conjuração','Estilo de Luta'],
      3: ['Juramento Sagrado'],
      4: ['ASI'],
      5: ['Ataque Extra'],
      6: ['Aura de Proteção'],
      7: ['Habilidade de Juramento'],
      8: ['ASI'],
      9: ['-'],
      10: ['Aura de Coragem'],
      11: ['Ataque Extra (1d8 radiante)'],
      12: ['ASI'],
      13: ['-'],
      14: ['Habilidade de Juramento'],
      15: ['Habilidade de Juramento'],
      16: ['ASI'],
      17: ['-'],
      18: ['Aura (30 pés)'],
      19: ['ASI'],
      20: ['Habilidade de Juramento']
    }
  },
  ranger: {
    name: 'Patrulheiro', hd: 10, primary: 'dex', saves: ['str','dex'],
    skills: ['Adestrar Animais','Atletismo','Furtividade','Intuição','Investigação','Natureza','Percepção','Sobrevivência'],
    skillCount: 3,
    subclasses: ['Caçador','Senhor das Feras','Andarilho das Sombras','Andarilho do Horizonte','Matador de Monstros','Errante Feérico','Guardião de Enxame','Guardião de Draco'],
    features: {
      1: ['Inimigo Favorito','Explorador Natural'],
      2: ['Conjuração','Estilo de Luta'],
      3: ['Conclave de Patrulheiro'],
      4: ['ASI'],
      5: ['Ataque Extra'],
      6: ['Inimigo Favorito +'],
      7: ['Habilidade de Conclave'],
      8: ['ASI'],
      9: ['-'],
      10: ['Explorador Natural +'],
      11: ['Habilidade de Conclave'],
      12: ['ASI'],
      13: ['-'],
      14: ['Inimigo Favorito ++'],
      15: ['Habilidade de Conclave'],
      16: ['ASI'],
      17: ['-'],
      18: ['-'],
      19: ['ASI'],
      20: ['-']
    }
  },
  sorcerer: {
    name: 'Feiticeiro', hd: 6, primary: 'cha', saves: ['con','cha'],
    skills: ['Arcanismo','Atuação','Enganação','Intimidação','Intuição','Persuasão','Religião'],
    skillCount: 2,
    subclasses: ['Dracônica','Magia Selvagem','Alma Divina','Sombra','Tempestade','Mente Aberrante','Alma Mecânica'],
    features: {
      1: ['Conjuração','Origem Feiticeira'],
      2: ['Fonte de Magia'],
      3: ['Metamagia (2 opções)'],
      4: ['ASI'],
      5: ['-'],
      6: ['Habilidade de Origem'],
      7: ['-'],
      8: ['ASI'],
      9: ['-'],
      10: ['Metamagia (3 opções)'],
      11: ['-'],
      12: ['ASI'],
      13: ['-'],
      14: ['Habilidade de Origem'],
      15: ['-'],
      16: ['ASI'],
      17: ['Metamagia (4 opções)'],
      18: ['Habilidade de Origem'],
      19: ['ASI'],
      20: ['Recuperação de Feitiçaria']
    }
  },
  warlock: {
    name: 'Bruxo', hd: 8, primary: 'cha', saves: ['wis','cha'],
    skills: ['Arcanismo','Atuação','Enganação','História','Intimidação','Intuição','Investigação','Natureza','Religião'],
    skillCount: 2,
    subclasses: ['Corruptor','Arquifada','Grande Antigo','Celestial','Lâmina Maldita','Abissal','Gênio','Morto-Vivo'],
    features: {
      1: ['Patrono Sobrenatural','Magia de Pacto'],
      2: ['Invocações (2)'],
      3: ['Pacto'],
      4: ['ASI'],
      5: ['-'],
      6: ['Habilidade de Patrono'],
      7: ['Invocações (3)'],
      8: ['ASI'],
      9: ['-'],
      10: ['Habilidade de Patrono'],
      11: ['Espaço Místico (3)'],
      12: ['ASI','Invocações (4)'],
      13: ['Espaço Místico (4)'],
      14: ['Habilidade de Patrono'],
      15: ['Invocações (5)'],
      16: ['ASI'],
      17: ['Espaço Místico (5)'],
      18: ['-'],
      19: ['ASI'],
      20: ['-']
    }
  }
}

const BACKGROUNDS = ['acolyte','criminal','folk_hero','noble','sage','soldier','entertainer','urchin','outlander','sailor','hermit','charlatan','guild_artisan']
const ALIGNMENTS = {
  lawful_good: 'Leal e Bom', neutral_good: 'Neutro e Bom', chaotic_good: 'Caótico e Bom',
  lawful_neutral: 'Leal e Neutro', true_neutral: 'Neutro', chaotic_neutral: 'Caótico e Neutro',
  lawful_evil: 'Leal e Mau', neutral_evil: 'Neutro e Mau', chaotic_evil: 'Caótico e Mau'
}
const FEATS = [
  'Alerta (+5 iniciativa)','Atleta (+1 For/Dex)','Ator (+1 Car)','Cruzado de Magia','Durão (+2 HP/nível)',
  'Elemental','Líder Inspirador','Lutador de Taverna','Mestre de Armas Grandes','Mestre de Escudo',
  'Móvel (+3m)','Observador','Sentinela','Sortudo (3 sorte)'
]

function getMod(v) { return Math.floor((v - 10) / 2) }
function getPB(lv) { return Math.floor((lv - 1) / 4) + 2 }

export default function CharacterCreation({ user, navigate, campaignId, isStandalone }) {
  const [step, setStep] = useState(0)
  const [selRace, setSelRace] = useState(null)
  const [selSubrace, setSelSubrace] = useState(null)
  const [selDraconic, setSelDraconic] = useState(null)
  const [selClass, setSelClass] = useState(null)
  const [selSubclass, setSelSubclass] = useState(null)
  const [selBg, setSelBg] = useState(null)
  const [scores, setScores] = useState({ str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 })
  const [selSkills, setSelSkills] = useState([])
  const [selExpertise, setSelExpertise] = useState([])
  const [selFighting, setSelFighting] = useState(null)
  const [selFeats, setSelFeats] = useState([])
  const [name, setName] = useState('')
  const [alignment, setAlignment] = useState('true_neutral')
  const [level, setLevel] = useState(1)
  const [saving, setSaving] = useState(false)

  const race = selRace ? RACES[selRace] : null
  const cls = selClass ? CLASSES[selClass] : null

  const dynamicSteps = useMemo(() => {
    const s = ['Raça']
    if (race?.subraces?.length > 0) s.push('Sub-Raça')
    if (race?.needsAncestry) s.push('Ancestralidade')
    s.push('Classe')
    if (cls?.subclasses?.length > 0) s.push('Subclasse')
    s.push('Nível')
    if (level >= 1 && cls?.name === 'Guerreiro') s.push('Estilo de Luta')
    if (level >= 3 && cls?.name === 'Mestre de Batalha') s.push('Manobras')
    s.push('Antecedente')
    s.push('Atributos')
    s.push('Perícias')
    if (level >= 1 && cls?.name === 'Ladino') s.push('Especialização')
    if (level >= 4) s.push('Talentos')
    s.push('Detalhes')
    s.push('Revisão')
    return s
  }, [race, cls, level])

  function rollStats() {
    const r = {}
    ;['str','dex','con','int','wis','cha'].forEach(a => {
      const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1).sort((a, b) => b - a)
      r[a] = rolls[0] + rolls[1] + rolls[2]
    })
    setScores(r)
  }

  function applyBonuses(sc = scores) {
    let ns = { ...sc }
    if (race?.bonuses) for (const [k, v] of Object.entries(race.bonuses)) ns[k] = (ns[k] || 10) + v
    if (selSubrace && SUBRACES[selSubrace]?.bonuses) for (const [k, v] of Object.entries(SUBRACES[selSubrace].bonuses)) ns[k] = (ns[k] || 10) + v
    return ns
  }

  function toggleSkill(s) { setSelSkills(p => p.includes(s) ? p.filter(x => x !== s) : p.length < (cls?.skillCount || 2) ? [...p, s] : p) }
  function toggleExpertise(s) { setSelExpertise(p => p.includes(s) ? p.filter(x => x !== s) : p.length < 2 ? [...p, s] : p) }
  function toggleFeat(f) { setSelFeats(p => p.includes(f) ? p.filter(x => x !== f) : p) }

  function getASIcount() {
    let c = 0
    const lvls = cls?.name === 'Guerreiro' ? [4, 6, 8, 12, 14, 16, 19] : cls?.name === 'Ladino' ? [4, 8, 10, 12, 16, 19] : [4, 8, 12, 16, 19]
    lvls.forEach(l => { if (level >= l) c++ })
    return c
  }

  function calculateHP() {
    if (!cls) return 10
    const cm = getMod(applyBonuses().con)
    const avg = Math.floor(cls.hd / 2) + 1
    return cls.hd + cm + (avg + cm) * (level - 1)
  }

  function getLevelFeatures() {
    if (!cls?.features) return []
    const f = []
    for (let lv = 1; lv <= level; lv++) {
      const lf = cls.features[lv] || []
      lf.forEach(x => f.push('Nv.' + lv + ': ' + x))
    }
    return f
  }

  async function handleCreate() {
    setSaving(true)
    try {
      const finalScores = applyBonuses()
      const mods = {}
      for (const [k, v] of Object.entries(finalScores)) mods[k] = getMod(v)
      const hp = calculateHP()
      const pb = getPB(level)
      const charData = {
        user_id: user.id, name, level,
        race: race.name + (selSubrace ? ' (' + SUBRACES[selSubrace].name + ')' : '') + (selDraconic ? ' - ' + selDraconic : ''),
        class: cls.name, subclass: selSubclass || null, background: selBg || '', alignment,
        experience: level * 500, ability_scores: finalScores,
        hit_points: { max: hp, current: hp, temporary: 0 },
        hit_dice: { total: level, current: level, type: 'd' + cls.hd },
        armor_class: 10 + (mods.dex || 0),
        speed: (race?.speed || 30) + (selSubrace && SUBRACES[selSubrace]?.speed || 0),
        initiative: mods.dex || 0, proficiency_bonus: pb,
        skill_proficiencies: selSkills, skill_expertise: selExpertise, skills: {},
        saving_throw_proficiencies: cls.saves,
        traits: [...(race?.languages || []), 'Comum'],
        features: getLevelFeatures().map(f => ({ name: f, description: '' })),
        languages: [...(race?.languages || []), 'Comum'],
        currency: { cp: 0, sp: 0, ep: 0, gp: 10 + (level - 1) * 5, pp: 0 },
        weapons: [], spells: [], equipment: selBg ? [selBg] : [],
        draconic_ancestry: selDraconic || null,
        fighting_style: selFighting || null,
        chosen_feats: selFeats,
        standalone: isStandalone || false
      }
      if (campaignId) charData.campaign_id = campaignId
      const { error } = await supabase.from('characters').insert(charData)
      if (error) throw error
      if (isStandalone) navigate('lobby')
      else navigate('campaign', { campaignId })
    } catch (err) { alert('Erro: ' + err.message) }
    finally { setSaving(false) }
  }

  const pg = { minHeight: '100vh', background: '#1a0c03', color: '#fdf8f0' }
  const hd = { background: '#2d1605', borderBottom: '4px solid #8b4f0f', padding: '15px 20px' }
  const mn = { maxWidth: 1100, margin: '0 auto', padding: 20 }
  const box = { background: '#2d1605', borderRadius: 12, border: '2px solid #4a2508', padding: 30, marginBottom: 20 }
  const btn = { padding: '14px 20px', background: '#1a0c03', border: '2px solid #4a2508', borderRadius: 8, cursor: 'pointer', color: '#fdf8f0', textAlign: 'left', fontFamily: 'Georgia,serif' }
  const sel = { ...btn, background: '#4a2508', border: '2px solid #d4891a' }
  const grid2 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12, marginTop: 15 }
  const grid3 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 10, marginTop: 15 }
  const title = { color: '#d4891a', fontFamily: 'Georgia,serif', fontSize: '1.5rem', margin: '0 0 20px 0' }
  const inputS = { width: '100%', padding: 14, background: '#1a0c03', border: '2px solid #4a2508', borderRadius: 8, color: '#fdf8f0', fontSize: 16, boxSizing: 'border-box' }

  const stepName = dynamicSteps[step] || ''
  const features = getLevelFeatures()

  return React.createElement('div', { style: pg },
    React.createElement('div', { style: hd },
      React.createElement('div', { style: { maxWidth: 1100, margin: '0 auto' } },
        React.createElement('h1', { style: { color: '#d4891a', fontFamily: 'Georgia,serif', fontSize: '1.8rem', margin: '0 0 12px 0' } }, (isStandalone ? '📝 Criação Independente' : '⚒️ Criação de Personagem') + ' - Nível ' + level),
        React.createElement('div', { style: { display: 'flex', gap: 4, flexWrap: 'wrap' } }, dynamicSteps.map((s, i) => React.createElement('button', { key: s, onClick: () => setStep(i), style: { padding: '5px 8px', borderRadius: 4, border: 'none', cursor: 'pointer', background: i === step ? '#d4891a' : i < step ? '#4a2508' : '#2d1605', color: i === step ? '#1a0c03' : '#8b4f0f', fontFamily: 'Georgia,serif', fontSize: 10 } }, (i + 1) + '.')))
      )
    ),
    React.createElement('div', { style: mn },
      React.createElement('div', { style: box },

        // RAÇA
        stepName === 'Raça' && React.createElement('div', null,
          React.createElement('h2', { style: title }, 'Raça'),
          React.createElement('div', { style: grid2 }, Object.entries(RACES).map(([k, r]) => React.createElement('button', { key: k, onClick: () => { setSelRace(k); setSelSubrace(null); setSelDraconic(null) }, style: selRace === k ? { ...sel, textAlign: 'left' } : { ...btn, textAlign: 'left' } },
            React.createElement('div', { style: { fontWeight: 'bold', fontSize: '1.1rem' } }, r.name),
            React.createElement('div', { style: { color: '#8b4f0f', fontSize: 13 } }, r.size + ' • ' + r.speed + ' pés'),
            React.createElement('div', { style: { color: '#4ade80', fontSize: 12, marginTop: 4 } }, Object.entries(r.bonuses).map(([a, b]) => '+' + b + ' ' + a.toUpperCase()).join(', '))
          )))
        ),

        // SUB-RAÇA
        stepName === 'Sub-Raça' && React.createElement('div', null,
          React.createElement('h2', { style: title }, 'Sub-Raça'),
          React.createElement('div', { style: grid2 }, race.subraces.map(sk => SUBRACES[sk] && React.createElement('button', { key: sk, onClick: () => setSelSubrace(sk), style: selSubrace === sk ? sel : btn },
            React.createElement('div', { style: { fontWeight: 'bold' } }, SUBRACES[sk].name),
            SUBRACES[sk].bonuses && React.createElement('div', { style: { color: '#4ade80', fontSize: 12 } }, Object.entries(SUBRACES[sk].bonuses).map(([a, b]) => '+' + b + ' ' + a.toUpperCase()).join(', '))
          )))
        ),

        // ANCESTRALIDADE DRACÔNICA
        stepName === 'Ancestralidade' && React.createElement('div', null,
          React.createElement('h2', { style: title }, 'Ancestralidade Dracônica'),
          React.createElement('div', { style: grid3 }, DRACONIC_ANCESTRIES.map(d => React.createElement('button', { key: d.name, onClick: () => setSelDraconic(d.name), style: selDraconic === d.name ? { ...sel, textAlign: 'center' } : { ...btn, textAlign: 'center' } },
            React.createElement('div', { style: { fontWeight: 'bold', color: ['Ouro','Vermelho'].includes(d.name) ? '#ef4444' : ['Prata','Branco'].includes(d.name) ? '#3b82f6' : '#22c55e' } }, d.name),
            React.createElement('div', { style: { color: '#8b4f0f', fontSize: 11 } }, d.damage + ' • ' + d.breath)
          )))
        ),

        // CLASSE
        stepName === 'Classe' && React.createElement('div', null,
          React.createElement('h2', { style: title }, 'Classe'),
          React.createElement('div', { style: grid3 }, Object.entries(CLASSES).map(([k, c]) => React.createElement('button', { key: k, onClick: () => { setSelClass(k); setSelSubclass(null); setSelSkills([]); setSelExpertise([]); setSelFighting(null) }, style: selClass === k ? { ...sel, textAlign: 'center' } : { ...btn, textAlign: 'center' } },
            React.createElement('div', { style: { fontWeight: 'bold' } }, c.name),
            React.createElement('div', { style: { color: '#8b4f0f', fontSize: 12 } }, 'd' + c.hd)
          )))
        ),

        // SUBCLASSE
        stepName === 'Subclasse' && React.createElement('div', null,
          React.createElement('h2', { style: title }, 'Subclasse'),
          React.createElement('div', { style: grid2 }, cls.subclasses.map(sc => React.createElement('button', { key: sc, onClick: () => setSelSubclass(sc === selSubclass ? null : sc), style: selSubclass === sc ? sel : btn }, sc)))
        ),

        // NÍVEL
        stepName === 'Nível' && React.createElement('div', null,
          React.createElement('h2', { style: title }, 'Nível do Personagem'),
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 15, justifyContent: 'center', marginBottom: 20 } },
            React.createElement('button', { onClick: () => setLevel(l => Math.max(1, l - 1)), style: { ...btn, fontSize: '2rem', padding: '10px 25px', textAlign: 'center' } }, '−'),
            React.createElement('span', { style: { fontSize: '3rem', fontWeight: 'bold', color: '#d4891a', minWidth: 80, textAlign: 'center' } }, level),
            React.createElement('button', { onClick: () => setLevel(l => Math.min(20, l + 1)), style: { ...btn, fontSize: '2rem', padding: '10px 25px', textAlign: 'center' } }, '+')
          ),
          React.createElement('div', { style: { background: '#1a0c03', borderRadius: 8, padding: 20, marginBottom: 15 } },
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 } },
              React.createElement('p', { style: { color: '#8b4f0f', margin: 0 } }, '⭐ Bônus de Proficiência: +' + getPB(level)),
              React.createElement('p', { style: { color: '#8b4f0f', margin: 0 } }, '❤️ HP estimado: ~' + calculateHP()),
              React.createElement('p', { style: { color: '#8b4f0f', margin: 0 } }, '📈 ASIs disponíveis: ' + getASIcount()),
              React.createElement('p', { style: { color: '#8b4f0f', margin: 0 } }, '🎲 Dados de Vida: ' + level + 'd' + (cls?.hd || 8))
            )
          ),
          features.length > 0 && React.createElement('details', { style: { color: '#8b4f0f' } },
            React.createElement('summary', { style: { cursor: 'pointer', fontFamily: 'Georgia,serif' } }, '📜 ' + features.length + ' habilidades por nível'),
            features.map((f, i) => React.createElement('p', { key: i, style: { color: '#fdf8f0', fontSize: 12, margin: '2px 0' } }, '• ' + f))
          ),
          level >= 3 && React.createElement('p', { style: { color: '#f59e0b', marginTop: 15 } }, '⚠️ Nível ' + level + ': Subclasse disponível! Volte ao passo Subclasse se quiser escolher.'),
          getASIcount() > 0 && React.createElement('p', { style: { color: '#4ade80', marginTop: 5 } }, '📈 Você tem ' + getASIcount() + ' Aumento(s) de Atributo (ASI). Ajuste no passo de Atributos.')
        ),

        // ESTILO DE LUTA
        stepName === 'Estilo de Luta' && React.createElement('div', null,
          React.createElement('h2', { style: title }, 'Estilo de Luta'),
          React.createElement('div', { style: grid3 }, FIGHTING_STYLES.map(fs => React.createElement('button', { key: fs, onClick: () => setSelFighting(fs === selFighting ? null : fs), style: selFighting === fs ? { ...sel, textAlign: 'left', fontSize: 13 } : { ...btn, textAlign: 'left', fontSize: 13 } }, fs)))
        ),

        // ANTECEDENTE
        stepName === 'Antecedente' && React.createElement('div', null,
          React.createElement('h2', { style: title }, 'Antecedente'),
          React.createElement('div', { style: grid3 }, BACKGROUNDS.map(b => React.createElement('button', { key: b, onClick: () => setSelBg(b), style: selBg === b ? { ...sel, textTransform: 'capitalize', textAlign: 'center' } : { ...btn, textTransform: 'capitalize', textAlign: 'center' } }, b.replace(/_/g, ' '))))
        ),

        // ATRIBUTOS
        stepName === 'Atributos' && React.createElement('div', null,
          React.createElement('h2', { style: title }, 'Atributos (ASIs disponíveis: ' + getASIcount() + ')'),
          React.createElement('div', { style: { display: 'flex', gap: 10, marginBottom: 20 } },
            React.createElement('button', { onClick: () => setScores({ str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 }), style: { ...btn, background: '#4a2508', textAlign: 'center' } }, '📊 Array Padrão'),
            React.createElement('button', { onClick: rollStats, style: { ...btn, background: '#4a2508', textAlign: 'center' } }, '🎲 Rolar 4d6')
          ),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 15 } },
            ['str','dex','con','int','wis','cha'].map(ab => {
              const v = scores[ab]; const m = getMod(v)
              return React.createElement('div', { key: ab, style: { background: '#1a0c03', borderRadius: 8, padding: 15, border: '2px solid #4a2508' } },
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 10 } },
                  React.createElement('span', { style: { fontFamily: 'Georgia,serif', textTransform: 'uppercase', fontWeight: 'bold' } }, ab),
                  React.createElement('span', { style: { fontWeight: 'bold', color: m >= 0 ? '#4ade80' : '#ef4444' } }, v + ' (' + (m >= 0 ? '+' : '') + m + ')')
                ),
                React.createElement('input', { type: 'range', min: 3, max: 20, value: v, onChange: e => setScores({ ...scores, [ab]: parseInt(e.target.value) }), style: { width: '100%', accentColor: '#d4891a' } })
              )
            })
          )
        ),

        // PERÍCIAS
        stepName === 'Perícias' && React.createElement('div', null,
          React.createElement('h2', { style: title }, 'Perícias (' + selSkills.length + '/' + (cls?.skillCount || 0) + ')'),
          !cls ? React.createElement('p', { style: { color: '#ef4444' } }, '⚠️ Escolha uma classe primeiro.') :
          React.createElement('div', { style: grid3 }, cls.skills.map(s => React.createElement('button', { key: s, onClick: () => toggleSkill(s), style: { ...(selSkills.includes(s) ? sel : btn), textAlign: 'center', opacity: !selSkills.includes(s) && selSkills.length >= (cls?.skillCount || 2) ? 0.4 : 1 } }, s)))
        ),

        // ESPECIALIZAÇÃO
        stepName === 'Especialização' && React.createElement('div', null,
          React.createElement('h2', { style: title }, 'Especialização (2 perícias)'),
          React.createElement('p', { style: { color: '#8b4f0f', marginBottom: 15 } }, 'Escolha 2 perícias para receber o dobro do bônus de proficiência:'),
          React.createElement('div', { style: grid3 }, selSkills.map(s => React.createElement('button', { key: s, onClick: () => toggleExpertise(s), style: { ...(selExpertise.includes(s) ? sel : btn), textAlign: 'center', opacity: !selExpertise.includes(s) && selExpertise.length >= 2 ? 0.4 : 1 } }, s + ' ⭐')))
        ),

        // TALENTOS
        stepName === 'Talentos' && React.createElement('div', null,
          React.createElement('h2', { style: title }, 'Talentos (Feats) - ASIs: ' + getASIcount()),
          React.createElement('p', { style: { color: '#8b4f0f', marginBottom: 15 } }, 'Você pode trocar cada ASI por um talento. Escolha:'),
          React.createElement('div', { style: grid2 }, FEATS.map(f => React.createElement('button', { key: f, onClick: () => toggleFeat(f), style: selFeats.includes(f) ? { ...sel, textAlign: 'left' } : { ...btn, textAlign: 'left' } }, f)))
        ),

        // DETALHES
        stepName === 'Detalhes' && React.createElement('div', null,
          React.createElement('h2', { style: title }, 'Detalhes Finais'),
          React.createElement('div', { style: { maxWidth: 500 } },
            React.createElement('label', { style: { display: 'block', color: '#8b4f0f', marginBottom: 8 } }, 'Nome'),
            React.createElement('input', { value: name, onChange: e => setName(e.target.value), placeholder: 'Nome do personagem...', style: { ...inputS, marginBottom: 20 } }),
            React.createElement('label', { style: { display: 'block', color: '#8b4f0f', marginBottom: 8 } }, 'Alinhamento'),
            React.createElement('select', { value: alignment, onChange: e => setAlignment(e.target.value), style: inputS },
              Object.entries(ALIGNMENTS).map(([k, v]) => React.createElement('option', { key: k, value: k }, v)))
          )
        ),

        // REVISÃO
        stepName === 'Revisão' && React.createElement('div', null,
          React.createElement('h2', { style: title }, '📜 Revisão Final'),
          React.createElement('div', { style: { background: '#1a0c03', borderRadius: 8, padding: 25, border: '2px solid #8b4f0f', marginBottom: 20 } },
            React.createElement('h3', { style: { color: '#d4891a', fontFamily: 'Georgia,serif', fontSize: '1.8rem', margin: '0 0 15px 0' } }, name || '(sem nome)'),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 15 } },
              React.createElement('p', { style: { margin: 0 } }, React.createElement('strong', { style: { color: '#8b4f0f' } }, 'Raça: '), race?.name + (selSubrace ? ' (' + SUBRACES[selSubrace]?.name + ')' : '') + (selDraconic ? ' - ' + selDraconic : '')),
              React.createElement('p', { style: { margin: 0 } }, React.createElement('strong', { style: { color: '#8b4f0f' } }, 'Classe: '), cls?.name + (selSubclass ? ' - ' + selSubclass : '')),
              React.createElement('p', { style: { margin: 0 } }, React.createElement('strong', { style: { color: '#8b4f0f' } }, 'Nível: '), level + ' (PB +' + getPB(level) + ')'),
              React.createElement('p', { style: { margin: 0 } }, React.createElement('strong', { style: { color: '#8b4f0f' } }, 'HP: '), calculateHP()),
              React.createElement('p', { style: { margin: 0 } }, React.createElement('strong', { style: { color: '#8b4f0f' } }, 'CA: '), 10 + getMod(applyBonuses().dex)),
              React.createElement('p', { style: { margin: 0 } }, React.createElement('strong', { style: { color: '#8b4f0f' } }, 'ASIs: '), getASIcount()),
              React.createElement('p', { style: { margin: 0 } }, React.createElement('strong', { style: { color: '#8b4f0f' } }, 'Perícias: '), selSkills.length + (selExpertise.length > 0 ? ' (' + selExpertise.length + ' esp.)' : '')),
              React.createElement('p', { style: { margin: 0 } }, React.createElement('strong', { style: { color: '#8b4f0f' } }, 'Antecedente: '), selBg?.replace(/_/g, ' ') || 'Nenhum')
            ),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 15 } },
              Object.entries(applyBonuses()).map(([k, v]) => React.createElement('div', { key: k, style: { textAlign: 'center', background: '#2d1605', padding: 8, borderRadius: 5 } },
                React.createElement('div', { style: { color: '#8b4f0f', fontSize: 11, textTransform: 'uppercase' } }, k),
                React.createElement('div', { style: { color: '#fdf8f0', fontWeight: 'bold' } }, v)
              ))
            ),
            features.length > 0 && React.createElement('details', { style: { color: '#8b4f0f', marginTop: 10 } },
              React.createElement('summary', { style: { cursor: 'pointer' } }, features.length + ' habilidades por nível'),
              features.map((f, i) => React.createElement('p', { key: i, style: { fontSize: 12, margin: '2px 0' } }, '• ' + f))
            )
          ),
          React.createElement('button', { onClick: handleCreate, disabled: saving || !name, style: { width: '100%', padding: 18, background: '#8b4f0f', color: '#fdf8f0', border: 'none', borderBottom: '4px solid #4a2508', borderRadius: 8, fontSize: 20, cursor: 'pointer', fontFamily: 'Georgia,serif', opacity: saving || !name ? 0.5 : 1 } }, '⚔️ ' + (saving ? 'Forjando Destino...' : 'FORJAR DESTINO!'))
        )
      ),
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: 10 } },
        React.createElement('button', { onClick: () => setStep(s => s - 1), disabled: step === 0, style: { padding: '12px 30px', background: '#2d1605', color: '#fdf8f0', border: '1px solid #4a2508', borderRadius: 6, cursor: 'pointer', fontFamily: 'Georgia,serif', opacity: step === 0 ? 0.3 : 1 } }, '⬅ Voltar'),
        step < dynamicSteps.length - 1 && React.createElement('button', { onClick: () => setStep(s => s + 1), style: { padding: '12px 30px', background: '#8b4f0f', color: '#fdf8f0', border: 'none', borderBottom: '3px solid #4a2508', borderRadius: 6, cursor: 'pointer', fontFamily: 'Georgia,serif' } }, 'Próximo ➡')
      )
    )
  )
}
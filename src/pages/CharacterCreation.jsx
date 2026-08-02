import React, { useState, useMemo } from 'react'
import { supabase } from '../lib/supabase'

// ============ DADOS BASE ============
const RACES = {
  human: { name: 'Humano', bonuses: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 }, speed: 30, size: 'Médio', languages: ['Comum'], traits: ['Versátil: Proficiência em uma perícia.'], subraces: [] },
  elf: { name: 'Elfo', bonuses: { dex: 2 }, speed: 30, size: 'Médio', languages: ['Comum','Élfico'], traits: ['Visão no Escuro 60pés','Sentidos Aguçados','Transe'], subraces: ['high_elf','wood_elf','dark_elf'] },
  dwarf: { name: 'Anão', bonuses: { con: 2 }, speed: 25, size: 'Médio', languages: ['Comum','Anão'], traits: ['Visão no Escuro 60pés','Resiliência Anã'], subraces: ['hill_dwarf','mountain_dwarf'] },
  halfling: { name: 'Halfling', bonuses: { dex: 2 }, speed: 25, size: 'Pequeno', languages: ['Comum','Halfling'], traits: ['Sortudo','Corajoso'], subraces: ['lightfoot','stout'] },
  dragonborn: { name: 'Draconato', bonuses: { str: 2, cha: 1 }, speed: 30, size: 'Médio', languages: ['Comum','Dracônico'], traits: ['Arma de Sopro','Resistência a Dano'], subraces: [] },
  gnome: { name: 'Gnomo', bonuses: { int: 2 }, speed: 25, size: 'Pequeno', languages: ['Comum','Gnômico'], traits: ['Visão no Escuro 60pés','Esperteza Gnômica'], subraces: ['forest_gnome','rock_gnome'] },
  half_elf: { name: 'Meio-Elfo', bonuses: { cha: 2, dex: 1, con: 1 }, speed: 30, size: 'Médio', languages: ['Comum','Élfico'], traits: ['Visão no Escuro 60pés','Versatilidade: +2 perícias'], subraces: [] },
  half_orc: { name: 'Meio-Orc', bonuses: { str: 2, con: 1 }, speed: 30, size: 'Médio', languages: ['Comum','Orc'], traits: ['Visão no Escuro 60pés','Resistência Implacável','Ataques Selvagens'], subraces: [] },
  tiefling: { name: 'Tiefling', bonuses: { int: 1, cha: 2 }, speed: 30, size: 'Médio', languages: ['Comum','Infernal'], traits: ['Visão no Escuro 60pés','Resistência Infernal','Magia Infernal'], subraces: [] }
}

const SUBRACES = {
  high_elf: { name: 'Alto Elfo', bonuses: { int: 1 }, traits: ['Truque de mago','Treinamento Élfico'] },
  wood_elf: { name: 'Elfo da Floresta', bonuses: { wis: 1 }, speed: 5, traits: ['Máscara da Natureza','Treinamento Élfico'] },
  dark_elf: { name: 'Drow', bonuses: { cha: 1 }, traits: ['Visão no Escuro 120pés','Magia Drow'] },
  hill_dwarf: { name: 'Anão da Colina', bonuses: { wis: 1 }, traits: ['Robustez Anã: +1 HP/nível'] },
  mountain_dwarf: { name: 'Anão da Montanha', bonuses: { str: 2 }, traits: ['Armadura Anã'] },
  lightfoot: { name: 'Pé-Leve', bonuses: { cha: 1 }, traits: ['Furtividade Natural'] },
  stout: { name: 'Robusto', bonuses: { con: 1 }, traits: ['Resiliência Robusta'] },
  forest_gnome: { name: 'Gnomo da Floresta', bonuses: { dex: 1 }, traits: ['Ilusionista Nato','Falar com Pequenos Animais'] },
  rock_gnome: { name: 'Gnomo das Rochas', bonuses: { con: 1 }, traits: ['Engenhoca'] }
}

const CLASSES = {
  barbarian: { name: 'Bárbaro', hd: 12, primary: 'str', saves: ['str','con'], skills: ['Adestrar Animais','Atletismo','Intimidação','Natureza','Percepção','Sobrevivência'], skillCount: 2, subclasses: ['Berserker','Guerreiro Totêmico','Guardião Ancestral','Arauto da Tempestade','Zelote','Besta','Magia Selvagem'],
    featuresByLevel: {
      1: ['Fúria (2 usos, +2 dano)','Defesa sem Armadura'],
      2: ['Ataque Imprudente','Sentido de Perigo'],
      3: ['Caminho Primitivo (Subclasse)'],
      4: ['ASI'],
      5: ['Ataque Extra','Movimento Rápido (+10 pés)'],
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
      20: ['Campeão Primitivo (+4 For/Con, máx 24)']
    }
  },
  fighter: { name: 'Guerreiro', hd: 10, primary: 'str', saves: ['str','con'], skills: ['Acrobacia','Adestrar Animais','Atletismo','História','Intimidação','Intuição','Percepção','Sobrevivência'], skillCount: 2, subclasses: ['Campeão','Mestre de Batalha','Cavaleiro Arcano'],
    featuresByLevel: {
      1: ['Estilo de Luta','Retomar Fôlego'],
      2: ['Surto de Ação (1 uso)'],
      3: ['Arquétipo Marcial (Subclasse)'],
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
  wizard: { name: 'Mago', hd: 6, primary: 'int', saves: ['int','wis'], skills: ['Arcanismo','História','Intuição','Investigação','Medicina','Religião'], skillCount: 2, subclasses: ['Evocação','Ilusão','Necromancia','Abjuração','Conjuração','Adivinhação','Encantamento','Transmutação'],
    featuresByLevel: {
      1: ['Conjuração','Recuperação Arcana'],
      2: ['Tradição Arcana (Subclasse)'],
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
  rogue: { name: 'Ladino', hd: 8, primary: 'dex', saves: ['dex','int'], skills: ['Acrobacia','Atletismo','Atuação','Enganação','Furtividade','Intimidação','Intuição','Investigação','Percepção','Persuasão','Prestidigitação'], skillCount: 4, subclasses: ['Ladrão','Assassino','Trapaceiro Arcano'],
    featuresByLevel: {
      1: ['Especialização (2 perícias)','Ataque Furtivo (1d6)','Gírias de Ladrão'],
      2: ['Ação Ardilosa'],
      3: ['Arquétipo (Subclasse)','Ataque Furtivo (2d6)'],
      4: ['ASI'],
      5: ['Esquiva Sobrenatural','Ataque Furtivo (3d6)'],
      6: ['Especialização (+2)'],
      7: ['Evasão','Ataque Furtivo (4d6)'],
      8: ['ASI'],
      9: ['Habilidade de Arquétipo','Ataque Furtivo (5d6)'],
      10: ['ASI'],
      11: ['Talento Confiável','Ataque Furtivo (6d6)'],
      12: ['ASI'],
      13: ['Habilidade de Arquétipo','Ataque Furtivo (7d6)'],
      14: ['Sentido Cego'],
      15: ['Mente Escorregadia','Ataque Furtivo (8d6)'],
      16: ['ASI'],
      17: ['Habilidade de Arquétipo','Ataque Furtivo (9d6)'],
      18: ['Elusivo'],
      19: ['ASI','Ataque Furtivo (10d6)'],
      20: ['Golpe de Sorte']
    }
  },
  cleric: { name: 'Clérigo', hd: 8, primary: 'wis', saves: ['wis','cha'], skills: ['História','Intuição','Medicina','Persuasão','Religião'], skillCount: 2, subclasses: ['Vida','Luz','Guerra','Conhecimento','Natureza','Tempestade','Trapaça'],
    featuresByLevel: {
      1: ['Conjuração','Domínio Divino'],
      2: ['Canalizar Divindade (1/descanso)','Habilidade de Domínio'],
      3: ['-'],
      4: ['ASI'],
      5: ['Destruir Mortos-Vivos (ND 1/2)'],
      6: ['Canalizar Divindade (2/descanso)','Habilidade de Domínio'],
      7: ['-'],
      8: ['ASI','Destruir Mortos-Vivos (ND 1)','Habilidade de Domínio'],
      9: ['-'],
      10: ['Intervenção Divina'],
      11: ['Destruir Mortos-Vivos (ND 2)'],
      12: ['ASI'],
      13: ['-'],
      14: ['Destruir Mortos-Vivos (ND 3)'],
      15: ['-'],
      16: ['ASI'],
      17: ['Destruir Mortos-Vivos (ND 4)','Habilidade de Domínio'],
      18: ['Canalizar Divindade (3/descanso)'],
      19: ['ASI'],
      20: ['Intervenção Divina Aprimorada']
    }
  }
}

// Classes simplificadas para as demais (mesmo padrão)
const SIMPLE_CLASSES = {
  bard: { name: 'Bardo', hd: 8, primary: 'cha', saves: ['dex','cha'], skills: ['Acrobacia','Adestrar Animais','Arcanismo','Atletismo','Atuação','Enganação','Furtividade','História','Intimidação','Intuição','Investigação','Medicina','Natureza','Percepção','Persuasão','Prestidigitação','Religião','Sobrevivência'], skillCount: 3, subclasses: ['Sabedoria','Valor','Glamour','Espadas','Sussurros','Criação','Eloquência'] },
  druid: { name: 'Druida', hd: 8, primary: 'wis', saves: ['int','wis'], skills: ['Arcanismo','Adestrar Animais','Intuição','Medicina','Natureza','Percepção','Religião','Sobrevivência'], skillCount: 2, subclasses: ['Terra','Lua','Sonhos','Pastor','Estrelas','Fogo Selvagem','Esporos'] },
  monk: { name: 'Monge', hd: 8, primary: 'dex', saves: ['str','dex'], skills: ['Acrobacia','Atletismo','Furtividade','História','Intuição','Religião'], skillCount: 2, subclasses: ['Punho Aberto','Sombras','Quatro Elementos','Mestre Bêbado','Kensei','Alma do Sol','Misericórdia','Eu Astral'] },
  paladin: { name: 'Paladino', hd: 10, primary: 'str', saves: ['wis','cha'], skills: ['Atletismo','Intimidação','Intuição','Medicina','Persuasão','Religião'], skillCount: 2, subclasses: ['Devoção','Antigos','Vingança','Conquista','Redenção','Coroa','Vigias','Glória'] },
  ranger: { name: 'Patrulheiro', hd: 10, primary: 'dex', saves: ['str','dex'], skills: ['Adestrar Animais','Atletismo','Furtividade','Intuição','Investigação','Natureza','Percepção','Sobrevivência'], skillCount: 3, subclasses: ['Caçador','Senhor das Feras','Andarilho das Sombras','Andarilho do Horizonte','Matador de Monstros','Errante Feérico','Guardião de Enxame','Guardião de Draco'] },
  sorcerer: { name: 'Feiticeiro', hd: 6, primary: 'cha', saves: ['con','cha'], skills: ['Arcanismo','Atuação','Enganação','Intimidação','Intuição','Persuasão','Religião'], skillCount: 2, subclasses: ['Dracônica','Magia Selvagem','Alma Divina','Sombra','Tempestade','Mente Aberrante','Alma Mecânica'] },
  warlock: { name: 'Bruxo', hd: 8, primary: 'cha', saves: ['wis','cha'], skills: ['Arcanismo','Atuação','Enganação','História','Intimidação','Intuição','Investigação','Natureza','Religião'], skillCount: 2, subclasses: ['Corruptor','Arquifada','Grande Antigo','Celestial','Lâmina Maldita','Abissal','Gênio','Morto-Vivo'] }
}

// Adiciona features genéricas para classes simplificadas
Object.keys(SIMPLE_CLASSES).forEach(k => {
  SIMPLE_CLASSES[k].featuresByLevel = { 1: ['Habilidades de Classe Nv.1'], 2: ['Habilidade Nv.2'], 3: ['Subclasse'], 4: ['ASI'], 5: ['Habilidade Nv.5'], 6: ['Habilidade Nv.6'], 7: ['Habilidade Nv.7'], 8: ['ASI'], 9: ['Habilidade Nv.9'], 10: ['Habilidade Nv.10'], 11: ['Habilidade Nv.11'], 12: ['ASI'], 13: ['Habilidade Nv.13'], 14: ['Habilidade Nv.14'], 15: ['Habilidade Nv.15'], 16: ['ASI'], 17: ['Habilidade Nv.17'], 18: ['Habilidade Nv.18'], 19: ['ASI'], 20: ['Habilidade Suprema Nv.20'] }
})

const ALL_CLASSES = { ...CLASSES, ...SIMPLE_CLASSES }

const BACKGROUNDS = [
  { key: 'acolyte', name: 'Acólito', skills: ['Intuição','Religião'], feature: 'Abrigo dos Fiéis' },
  { key: 'criminal', name: 'Criminoso', skills: ['Enganação','Furtividade'], feature: 'Contato Criminoso' },
  { key: 'folk_hero', name: 'Herói do Povo', skills: ['Adestrar Animais','Sobrevivência'], feature: 'Hospitalidade' },
  { key: 'noble', name: 'Nobre', skills: ['História','Persuasão'], feature: 'Privilégio da Nobreza' },
  { key: 'sage', name: 'Sábio', skills: ['Arcanismo','História'], feature: 'Pesquisador' },
  { key: 'soldier', name: 'Soldado', skills: ['Atletismo','Intimidação'], feature: 'Patente Militar' },
  { key: 'entertainer', name: 'Artista', skills: ['Acrobacia','Atuação'], feature: 'Popularidade' },
  { key: 'urchin', name: 'Órfão', skills: ['Furtividade','Prestidigitação'], feature: 'Segredos da Cidade' },
  { key: 'outlander', name: 'Forasteiro', skills: ['Atletismo','Sobrevivência'], feature: 'Andarilho' },
  { key: 'sailor', name: 'Marinheiro', skills: ['Atletismo','Percepção'], feature: 'Passagem de Navio' },
  { key: 'hermit', name: 'Eremita', skills: ['Medicina','Religião'], feature: 'Descoberta' },
  { key: 'charlatan', name: 'Charlatão', skills: ['Enganação','Prestidigitação'], feature: 'Identidade Falsa' }
]

const ALIGNMENTS = [
  { value: 'lawful_good', name: 'Leal e Bom' },{ value: 'neutral_good', name: 'Neutro e Bom' },{ value: 'chaotic_good', name: 'Caótico e Bom' },
  { value: 'lawful_neutral', name: 'Leal e Neutro' },{ value: 'true_neutral', name: 'Neutro' },{ value: 'chaotic_neutral', name: 'Caótico e Neutro' },
  { value: 'lawful_evil', name: 'Leal e Mau' },{ value: 'neutral_evil', name: 'Neutro e Mau' },{ value: 'chaotic_evil', name: 'Caótico e Mau' }
]

const ASI_LEVELS = [4, 6, 8, 12, 14, 16, 19] // Guerreiro tem ASI extra no 6 e 14

function getMod(v) { return Math.floor((v - 10) / 2) }
function getPB(level) { return Math.floor((level - 1) / 4) + 2 }
function getASIcount(level, className) {
  let count = 0
  const asiLevels = className === 'Guerreiro' ? [4, 6, 8, 12, 14, 16, 19] : [4, 8, 12, 16, 19]
  asiLevels.forEach(l => { if (level >= l) count++ })
  return count
}

const STEPS = ['Raça','Sub-Raça','Classe','Subclasse','Nível','Antecedente','Atributos','Perícias','Detalhes','Revisão']

export default function CharacterCreation({ user, navigate, campaignId }) {
  const [step, setStep] = useState(0)
  const [selectedRace, setSelectedRace] = useState(null)
  const [selectedSubrace, setSelectedSubrace] = useState(null)
  const [selectedClass, setSelectedClass] = useState(null)
  const [selectedSubclass, setSelectedSubclass] = useState(null)
  const [selectedBg, setSelectedBg] = useState(null)
  const [scores, setScores] = useState({ str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 })
  const [selectedSkills, setSelectedSkills] = useState([])
  const [name, setName] = useState('')
  const [alignment, setAlignment] = useState('true_neutral')
  const [level, setLevel] = useState(1)
  const [saving, setSaving] = useState(false)

  const race = selectedRace ? RACES[selectedRace] : null
  const cls = selectedClass ? ALL_CLASSES[selectedClass] : null
  const bg = selectedBg ? BACKGROUNDS.find(b => b.key === selectedBg) : null

  // Features por nível
  const levelFeatures = useMemo(() => {
    if (!cls || !cls.featuresByLevel) return []
    const features = []
    for (let lv = 1; lv <= level; lv++) {
      const lvFeatures = cls.featuresByLevel[lv] || []
      lvFeatures.forEach(f => features.push('Nv.' + lv + ': ' + f))
    }
    return features
  }, [cls, level])

  const asiCount = cls ? getASIcount(level, cls.name) : 0

  function rollStats() {
    const result = {}
    ;['str','dex','con','int','wis','cha'].forEach(a => {
      const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1)
      rolls.sort((a,b) => b - a)
      result[a] = rolls[0] + rolls[1] + rolls[2]
    })
    setScores(result)
  }

  function applyBonuses(sc = scores) {
    let ns = { ...sc }
    if (race?.bonuses) for (const [k,v] of Object.entries(race.bonuses)) ns[k] = (ns[k] || 10) + v
    if (selectedSubrace && SUBRACES[selectedSubrace]?.bonuses) for (const [k,v] of Object.entries(SUBRACES[selectedSubrace].bonuses)) ns[k] = (ns[k] || 10) + v
    return ns
  }

  function toggleSkill(skill) {
    setSelectedSkills(prev => {
      if (prev.includes(skill)) return prev.filter(s => s !== skill)
      if (prev.length >= (cls?.skillCount || 2)) return prev
      return [...prev, skill]
    })
  }

  function calculateHP() {
    if (!cls) return 10
    const conMod = getMod(applyBonuses().con)
    const avg = Math.floor(cls.hd / 2) + 1
    return cls.hd + conMod + (avg + conMod) * (level - 1)
  }

  async function handleCreate() {
    setSaving(true)
    try {
      const finalScores = applyBonuses()
      const mods = {}
      for (const [k,v] of Object.entries(finalScores)) mods[k] = getMod(v)
      const hp = calculateHP()
      const pb = getPB(level)

      const { error } = await supabase.from('characters').insert({
        user_id: user.id, campaign_id: campaignId, name, level,
        race: race.name + (selectedSubrace ? ' (' + SUBRACES[selectedSubrace].name + ')' : ''),
        class: cls.name,
        subclass: selectedSubclass || null,
        background: bg?.name || '',
        alignment,
        experience: level * 500,
        ability_scores: finalScores,
        hit_points: { max: hp, current: hp, temporary: 0 },
        hit_dice: { total: level, current: level, type: 'd' + cls.hd },
        armor_class: 10 + (mods.dex || 0),
        speed: (race?.speed || 30) + (selectedSubrace && SUBRACES[selectedSubrace]?.speed || 0),
        initiative: mods.dex || 0,
        proficiency_bonus: pb,
        skill_proficiencies: selectedSkills,
        skills: {},
        saving_throw_proficiencies: cls.saves,
        traits: [...(race?.traits || []), ...(selectedSubrace && SUBRACES[selectedSubrace]?.traits || [])],
        languages: [...(race?.languages || []), 'Comum'],
        features: levelFeatures.map(f => ({ name: f, description: '' })),
        currency: { cp: 0, sp: 0, ep: 0, gp: 10 + (level - 1) * 5, pp: 0 },
        weapons: [],
        spells: [],
        equipment: bg?.feature ? [bg.feature] : [],
        feats: [],
        asi_history: []
      })
      if (error) throw error
      navigate('campaign', { campaignId })
    } catch (err) {
      alert('Erro ao criar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const pg = { minHeight: '100vh', background: '#1a0c03', color: '#fdf8f0' }
  const hd = { background: '#2d1605', borderBottom: '4px solid #8b4f0f', padding: '15px 20px' }
  const mn = { maxWidth: '1100px', margin: '0 auto', padding: '20px' }
  const box = { background: '#2d1605', borderRadius: '12px', border: '2px solid #4a2508', padding: '30px', marginBottom: '20px' }
  const btn = { padding: '14px 20px', background: '#1a0c03', border: '2px solid #4a2508', borderRadius: '8px', cursor: 'pointer', color: '#fdf8f0', textAlign: 'left', fontFamily: 'Georgia, serif' }
  const sel = { ...btn, background: '#4a2508', border: '2px solid #d4891a' }
  const grid2 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', marginTop: '15px' }
  const grid3 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px', marginTop: '15px' }
  const title = { color: '#d4891a', fontFamily: 'Georgia, serif', fontSize: '1.5rem', margin: '0 0 20px 0' }
  const inputS = { width: '100%', padding: '14px', background: '#1a0c03', border: '2px solid #4a2508', borderRadius: '8px', color: '#fdf8f0', fontSize: '16px', boxSizing: 'border-box' }

  return React.createElement('div', { style: pg },
    React.createElement('div', { style: hd },
      React.createElement('div', { style: { maxWidth: '1100px', margin: '0 auto' } },
        React.createElement('h1', { style: { color: '#d4891a', fontFamily: 'Georgia, serif', fontSize: '1.8rem', margin: '0 0 12px 0' } }, '⚒️ Criação de Personagem'),
        React.createElement('div', { style: { display: 'flex', gap: '4px', flexWrap: 'wrap' } },
          STEPS.map((s, i) => React.createElement('button', { key: s, onClick: () => setStep(i), style: { padding: '6px 10px', borderRadius: '5px', border: 'none', cursor: 'pointer', background: i === step ? '#d4891a' : i < step ? '#4a2508' : '#2d1605', color: i === step ? '#1a0c03' : '#8b4f0f', fontFamily: 'Georgia, serif', fontSize: '11px' } }, (i + 1) + '.'))
        )
      )
    ),
    React.createElement('div', { style: mn },
      React.createElement('div', { style: box },
        step === 0 && React.createElement('div', null,
          React.createElement('h2', { style: title }, '1. Raça'),
          React.createElement('div', { style: grid2 }, Object.entries(RACES).map(([k,r]) => React.createElement('button', { key: k, onClick: () => { setSelectedRace(k); setSelectedSubrace(null) }, style: selectedRace === k ? { ...sel, textAlign: 'left' } : { ...btn, textAlign: 'left' } },
            React.createElement('div', { style: { fontWeight: 'bold' } }, r.name),
            React.createElement('div', { style: { color: '#8b4f0f', fontSize: '13px' } }, r.size + ' • ' + r.speed + ' pés'),
            React.createElement('div', { style: { color: '#4ade80', fontSize: '12px' } }, Object.entries(r.bonuses).map(([a,b]) => '+' + b + ' ' + a.toUpperCase()).join(', '))
          )))
        ),
        step === 1 && React.createElement('div', null,
          React.createElement('h2', { style: title }, '2. Sub-Raça'),
          !race ? React.createElement('p', { style: { color: '#ef4444' } }, '⚠️ Escolha uma raça.')
          : race.subraces.length === 0 ? React.createElement('p', { style: { color: '#4ade80' } }, '✅ Sem sub-raças.')
          : React.createElement('div', { style: grid2 }, race.subraces.map(sk => SUBRACES[sk] && React.createElement('button', { key: sk, onClick: () => setSelectedSubrace(sk), style: selectedSubrace === sk ? sel : btn }, SUBRACES[sk].name)))
        ),
        step === 2 && React.createElement('div', null,
          React.createElement('h2', { style: title }, '3. Classe'),
          React.createElement('div', { style: grid3 }, Object.entries(ALL_CLASSES).map(([k,c]) => React.createElement('button', { key: k, onClick: () => { setSelectedClass(k); setSelectedSubclass(null); setSelectedSkills([]) }, style: selectedClass === k ? { ...sel, textAlign: 'center' } : { ...btn, textAlign: 'center' } },
            React.createElement('div', { style: { fontWeight: 'bold' } }, c.name),
            React.createElement('div', { style: { color: '#8b4f0f', fontSize: '12px' } }, 'd' + c.hd + ' • ' + c.primary.toUpperCase())
          )))
        ),
        step === 3 && React.createElement('div', null,
          React.createElement('h2', { style: title }, '4. Subclasse'),
          !cls ? React.createElement('p', { style: { color: '#ef4444' } }, '⚠️ Escolha uma classe.') : React.createElement('div', { style: grid2 }, cls.subclasses.map(sc => React.createElement('button', { key: sc, onClick: () => setSelectedSubclass(sc === selectedSubclass ? null : sc), style: selectedSubclass === sc ? sel : btn }, sc)))
        ),
        step === 4 && React.createElement('div', null,
          React.createElement('h2', { style: title }, '5. Nível'),
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '15px', justifyContent: 'center', marginBottom: '20px' } },
            React.createElement('button', { onClick: () => setLevel(l => Math.max(1, l - 1)), style: { ...btn, fontSize: '2rem', padding: '10px 25px', textAlign: 'center' } }, '−'),
            React.createElement('span', { style: { fontSize: '3rem', fontWeight: 'bold', color: '#d4891a', minWidth: '80px', textAlign: 'center' } }, level),
            React.createElement('button', { onClick: () => setLevel(l => Math.min(20, l + 1)), style: { ...btn, fontSize: '2rem', padding: '10px 25px', textAlign: 'center' } }, '+')
          ),
          React.createElement('div', { style: { background: '#1a0c03', borderRadius: '8px', padding: '20px', marginBottom: '15px' } },
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' } },
              React.createElement('p', { style: { color: '#8b4f0f', margin: 0 } }, '⭐ PB: +' + getPB(level)),
              React.createElement('p', { style: { color: '#8b4f0f', margin: 0 } }, '❤️ HP: ~' + calculateHP()),
              React.createElement('p', { style: { color: '#8b4f0f', margin: 0 } }, '📈 ASIs: ' + asiCount),
              React.createElement('p', { style: { color: '#8b4f0f', margin: 0 } }, '🎲 Dados: ' + level + 'd' + (cls?.hd || 8))
            )
          ),
          levelFeatures.length > 0 && React.createElement('div', { style: { background: '#1a0c03', borderRadius: '8px', padding: '15px', maxHeight: '200px', overflowY: 'auto' } },
            React.createElement('p', { style: { color: '#d4891a', fontFamily: 'Georgia, serif', margin: '0 0 10px 0' } }, '📜 Habilidades por Nível:'),
            levelFeatures.map((f, i) => React.createElement('p', { key: i, style: { color: '#fdf8f0', margin: '3px 0', fontSize: '13px' } }, '• ' + f))
          ),
          level >= 3 && React.createElement('p', { style: { color: '#f59e0b', marginTop: '15px' } }, '⚠️ Nível ' + level + ': Subclasse disponível!'),
          asiCount > 0 && React.createElement('p', { style: { color: '#4ade80', marginTop: '5px' } }, '📈 Você tem ' + asiCount + ' Aumento(s) de Atributo. Ajuste no próximo passo.')
        ),
        step === 5 && React.createElement('div', null,
          React.createElement('h2', { style: title }, '6. Antecedente'),
          React.createElement('div', { style: grid2 }, BACKGROUNDS.map(b => React.createElement('button', { key: b.key, onClick: () => setSelectedBg(b.key), style: selectedBg === b.key ? sel : btn },
            React.createElement('div', { style: { fontWeight: 'bold' } }, b.name),
            React.createElement('div', { style: { color: '#8b4f0f', fontSize: '12px' } }, b.skills.join(', '))
          )))
        ),
        step === 6 && React.createElement('div', null,
          React.createElement('h2', { style: title }, '7. Atributos'),
          React.createElement('div', { style: { display: 'flex', gap: '10px', marginBottom: '20px' } },
            React.createElement('button', { onClick: () => setScores({ str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 }), style: { ...btn, background: '#4a2508', textAlign: 'center' } }, '📊 Array Padrão'),
            React.createElement('button', { onClick: rollStats, style: { ...btn, background: '#4a2508', textAlign: 'center' } }, '🎲 Rolar 4d6')
          ),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' } },
            ['str','dex','con','int','wis','cha'].map(ab => {
              const val = scores[ab]; const mod = getMod(val)
              return React.createElement('div', { key: ab, style: { background: '#1a0c03', borderRadius: '8px', padding: '15px', border: '2px solid #4a2508' } },
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' } },
                  React.createElement('span', { style: { fontFamily: 'Georgia, serif', textTransform: 'uppercase', fontWeight: 'bold' } }, ab),
                  React.createElement('span', { style: { fontWeight: 'bold', color: mod >= 0 ? '#4ade80' : '#ef4444' } }, val + ' (' + (mod >= 0 ? '+' : '') + mod + ')')
                ),
                React.createElement('input', { type: 'range', min: '3', max: '20', value: val, onChange: e => setScores({ ...scores, [ab]: parseInt(e.target.value) }), style: { width: '100%', accentColor: '#d4891a' } })
              )
            })
          )
        ),
        step === 7 && React.createElement('div', null,
          React.createElement('h2', { style: title }, '8. Perícias (' + selectedSkills.length + '/' + (cls?.skillCount || 0) + ')'),
          !cls ? React.createElement('p', { style: { color: '#ef4444' } }, '⚠️ Escolha uma classe.') :
          React.createElement('div', { style: grid3 }, cls.skills.map(s => React.createElement('button', { key: s, onClick: () => toggleSkill(s), style: { ...(selectedSkills.includes(s) ? sel : btn), textAlign: 'center', opacity: !selectedSkills.includes(s) && selectedSkills.length >= cls.skillCount ? 0.4 : 1 } }, s)))
        ),
        step === 8 && React.createElement('div', null,
          React.createElement('h2', { style: title }, '9. Detalhes'),
          React.createElement('div', { style: { maxWidth: '500px' } },
            React.createElement('label', { style: { display: 'block', color: '#8b4f0f', marginBottom: '8px' } }, 'Nome'),
            React.createElement('input', { value: name, onChange: e => setName(e.target.value), placeholder: 'Nome...', style: { ...inputS, marginBottom: '20px' } }),
            React.createElement('label', { style: { display: 'block', color: '#8b4f0f', marginBottom: '8px' } }, 'Alinhamento'),
            React.createElement('select', { value: alignment, onChange: e => setAlignment(e.target.value), style: { ...inputS } },
              ALIGNMENTS.map(a => React.createElement('option', { key: a.value, value: a.value }, a.name))
            )
          )
        ),
        step === 9 && React.createElement('div', null,
          React.createElement('h2', { style: title }, '📜 Revisão Final'),
          React.createElement('div', { style: { background: '#1a0c03', borderRadius: '8px', padding: '25px', border: '2px solid #8b4f0f', marginBottom: '20px' } },
            React.createElement('h3', { style: { color: '#d4891a', fontFamily: 'Georgia, serif', fontSize: '1.8rem', margin: '0 0 15px 0' } }, name || '(sem nome)'),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '15px' } },
              React.createElement('p', { style: { margin: 0 } }, React.createElement('strong', { style: { color: '#8b4f0f' } }, 'Raça: '), race?.name + (selectedSubrace ? ' (' + SUBRACES[selectedSubrace]?.name + ')' : '')),
              React.createElement('p', { style: { margin: 0 } }, React.createElement('strong', { style: { color: '#8b4f0f' } }, 'Classe: '), cls?.name + (selectedSubclass ? ' - ' + selectedSubclass : '')),
              React.createElement('p', { style: { margin: 0 } }, React.createElement('strong', { style: { color: '#8b4f0f' } }, 'Nível: '), level + ' (PB +' + getPB(level) + ')'),
              React.createElement('p', { style: { margin: 0 } }, React.createElement('strong', { style: { color: '#8b4f0f' } }, 'HP: '), calculateHP()),
              React.createElement('p', { style: { margin: 0 } }, React.createElement('strong', { style: { color: '#8b4f0f' } }, 'CA: '), 10 + getMod(applyBonuses().dex)),
              React.createElement('p', { style: { margin: 0 } }, React.createElement('strong', { style: { color: '#8b4f0f' } }, 'ASIs: '), asiCount),
              React.createElement('p', { style: { margin: 0 } }, React.createElement('strong', { style: { color: '#8b4f0f' } }, 'Antecedente: '), bg?.name),
              React.createElement('p', { style: { margin: 0 } }, React.createElement('strong', { style: { color: '#8b4f0f' } }, 'Perícias: '), selectedSkills.length)
            ),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginBottom: '15px' } },
              Object.entries(applyBonuses()).map(([k,v]) => React.createElement('div', { key: k, style: { textAlign: 'center', background: '#2d1605', padding: '8px', borderRadius: '5px' } },
                React.createElement('div', { style: { color: '#8b4f0f', fontSize: '11px', textTransform: 'uppercase' } }, k),
                React.createElement('div', { style: { color: '#fdf8f0', fontWeight: 'bold' } }, v)
              ))
            ),
            React.createElement('details', { style: { color: '#8b4f0f' } },
              React.createElement('summary', { style: { cursor: 'pointer', fontFamily: 'Georgia, serif' } }, '📜 Ver ' + levelFeatures.length + ' habilidades'),
              levelFeatures.map((f, i) => React.createElement('p', { key: i, style: { color: '#fdf8f0', fontSize: '12px', margin: '2px 0' } }, '• ' + f))
            )
          ),
          React.createElement('button', { onClick: handleCreate, disabled: saving || !name, style: { width: '100%', padding: '18px', background: '#8b4f0f', color: '#fdf8f0', border: 'none', borderBottom: '4px solid #4a2508', borderRadius: '8px', fontSize: '20px', cursor: 'pointer', fontFamily: 'Georgia, serif', opacity: saving || !name ? 0.5 : 1 } }, '⚔️ ' + (saving ? 'Forjando...' : 'FORJAR DESTINO!'))
        )
      ),
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: '10px' } },
        React.createElement('button', { onClick: () => setStep(s => s - 1), disabled: step === 0, style: { padding: '12px 30px', background: '#2d1605', color: '#fdf8f0', border: '1px solid #4a2508', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Georgia, serif', opacity: step === 0 ? 0.3 : 1 } }, '⬅ Voltar'),
        step < 9 && React.createElement('button', { onClick: () => setStep(s => s + 1), style: { padding: '12px 30px', background: '#8b4f0f', color: '#fdf8f0', border: 'none', borderBottom: '3px solid #4a2508', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Georgia, serif' } }, 'Próximo ➡')
      )
    )
  )
}
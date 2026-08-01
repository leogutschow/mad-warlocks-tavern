import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

// ============ DADOS (mesmo de antes, mantidos iguais) ============
const RACES = {
  human: { name: 'Humano', bonuses: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 }, speed: 30, size: 'Médio', languages: ['Comum'], traits: ['Versátil: Proficiência em uma perícia qualquer.'], subraces: [] },
  elf: { name: 'Elfo', bonuses: { dex: 2 }, speed: 30, size: 'Médio', languages: ['Comum', 'Élfico'], traits: ['Visão no Escuro (60 pés)', 'Sentidos Aguçados: Proficiência em Percepção', 'Transe: Medita 4h'], subraces: ['high_elf', 'wood_elf', 'dark_elf'] },
  dwarf: { name: 'Anão', bonuses: { con: 2 }, speed: 25, size: 'Médio', languages: ['Comum', 'Anão'], traits: ['Visão no Escuro (60 pés)', 'Resiliência Anã: Vantagem contra veneno'], subraces: ['hill_dwarf', 'mountain_dwarf'] },
  halfling: { name: 'Halfling', bonuses: { dex: 2 }, speed: 25, size: 'Pequeno', languages: ['Comum', 'Halfling'], traits: ['Sortudo: Rerrola 1 no d20', 'Corajoso: Vantagem contra medo'], subraces: ['lightfoot', 'stout'] },
  dragonborn: { name: 'Draconato', bonuses: { str: 2, cha: 1 }, speed: 30, size: 'Médio', languages: ['Comum', 'Dracônico'], traits: ['Arma de Sopro', 'Resistência a Dano'], subraces: [] },
  gnome: { name: 'Gnomo', bonuses: { int: 2 }, speed: 25, size: 'Pequeno', languages: ['Comum', 'Gnômico'], traits: ['Visão no Escuro (60 pés)', 'Esperteza Gnômica'], subraces: ['forest_gnome', 'rock_gnome'] },
  half_elf: { name: 'Meio-Elfo', bonuses: { cha: 2, dex: 1, con: 1 }, speed: 30, size: 'Médio', languages: ['Comum', 'Élfico'], traits: ['Visão no Escuro (60 pés)', 'Versatilidade: 2 perícias extras'], subraces: [] },
  half_orc: { name: 'Meio-Orc', bonuses: { str: 2, con: 1 }, speed: 30, size: 'Médio', languages: ['Comum', 'Orc'], traits: ['Visão no Escuro (60 pés)', 'Resistência Implacável', 'Ataques Selvagens'], subraces: [] },
  tiefling: { name: 'Tiefling', bonuses: { int: 1, cha: 2 }, speed: 30, size: 'Médio', languages: ['Comum', 'Infernal'], traits: ['Visão no Escuro (60 pés)', 'Resistência Infernal', 'Magia Infernal'], subraces: [] },
  aasimar: { name: 'Aasimar', bonuses: { cha: 2, wis: 1 }, speed: 30, size: 'Médio', languages: ['Comum', 'Celestial'], traits: ['Visão no Escuro (60 pés)', 'Resistência Celestial', 'Toque de Cura'], subraces: ['protector', 'scourge', 'fallen'] },
  genasi: { name: 'Genasi', bonuses: { con: 2 }, speed: 30, size: 'Médio', languages: ['Comum', 'Primordial'], traits: ['Visão no Escuro (60 pés)'], subraces: ['air', 'earth', 'fire', 'water'] },
  goliath: { name: 'Golias', bonuses: { str: 2, con: 1 }, speed: 30, size: 'Médio', languages: ['Comum', 'Gigante'], traits: ['Atleta Natural', 'Resistência da Pedra'], subraces: [] },
  tabaxi: { name: 'Tabaxi', bonuses: { dex: 2, cha: 1 }, speed: 30, size: 'Médio', languages: ['Comum'], traits: ['Visão no Escuro (60 pés)', 'Agilidade Felina', 'Garras: 1d6'], subraces: [] },
  firbolg: { name: 'Firbolg', bonuses: { wis: 2, str: 1 }, speed: 30, size: 'Médio', languages: ['Comum', 'Élfico', 'Gigante'], traits: ['Magia Firbolg', 'Passo Oculto'], subraces: [] }
}

const SUBRACES = {
  high_elf: { name: 'Alto Elfo', bonuses: { int: 1 }, traits: ['Truque de mago', 'Treinamento Élfico'] },
  wood_elf: { name: 'Elfo da Floresta', bonuses: { wis: 1 }, speed: 5, traits: ['Máscara da Natureza', 'Treinamento Élfico'] },
  dark_elf: { name: 'Drow', bonuses: { cha: 1 }, traits: ['Visão no Escuro (120 pés)', 'Magia Drow'] },
  hill_dwarf: { name: 'Anão da Colina', bonuses: { wis: 1 }, traits: ['Robustez Anã: +1 HP por nível'] },
  mountain_dwarf: { name: 'Anão da Montanha', bonuses: { str: 2 }, traits: ['Armadura Anã'] },
  lightfoot: { name: 'Pé-Leve', bonuses: { cha: 1 }, traits: ['Furtividade Natural'] },
  stout: { name: 'Robusto', bonuses: { con: 1 }, traits: ['Resiliência Robusta'] },
  forest_gnome: { name: 'Gnomo da Floresta', bonuses: { dex: 1 }, traits: ['Ilusionista Nato', 'Falar com Pequenos Animais'] },
  rock_gnome: { name: 'Gnomo das Rochas', bonuses: { con: 1 }, traits: ['Engenhoca'] },
  protector: { name: 'Protetor', bonuses: { wis: 1 }, traits: ['Alma Radiante: Asas'] },
  scourge: { name: 'Flagelo', bonuses: { con: 1 }, traits: ['Consumo Radiante'] },
  fallen: { name: 'Caído', bonuses: { str: 1 }, traits: ['Túmulo Necrótico'] },
  air: { name: 'Genasi do Ar', bonuses: { dex: 1 }, traits: ['Respiração Infinita', 'Fundir-se ao Vento'] },
  earth: { name: 'Genasi da Terra', bonuses: { str: 1 }, traits: ['Passo da Terra'] },
  fire: { name: 'Genasi do Fogo', bonuses: { int: 1 }, traits: ['Resistência ao Fogo', 'Alcance das Chamas'] },
  water: { name: 'Genasi da Água', bonuses: { wis: 1 }, traits: ['Anfíbio', 'Nado 30 pés'] }
}

const CLASSES = {
  barbarian: { name: 'Bárbaro', hd: 12, primary: 'str', saves: ['str', 'con'], skills: ['Adestrar Animais', 'Atletismo', 'Intimidação', 'Natureza', 'Percepção', 'Sobrevivência'], skillCount: 2, subclasses: ['Berserker', 'Guerreiro Totêmico', 'Guardião Ancestral', 'Arauto da Tempestade', 'Zelote', 'Besta', 'Magia Selvagem'] },
  bard: { name: 'Bardo', hd: 8, primary: 'cha', saves: ['dex', 'cha'], skills: ['Acrobacia', 'Adestrar Animais', 'Arcanismo', 'Atletismo', 'Atuação', 'Enganação', 'Furtividade', 'História', 'Intimidação', 'Intuição', 'Investigação', 'Medicina', 'Natureza', 'Percepção', 'Persuasão', 'Prestidigitação', 'Religião', 'Sobrevivência'], skillCount: 3, subclasses: ['Sabedoria', 'Valor', 'Glamour', 'Espadas', 'Sussurros', 'Criação', 'Eloquência'] },
  cleric: { name: 'Clérigo', hd: 8, primary: 'wis', saves: ['wis', 'cha'], skills: ['História', 'Intuição', 'Medicina', 'Persuasão', 'Religião'], skillCount: 2, subclasses: ['Vida', 'Luz', 'Guerra', 'Conhecimento', 'Natureza', 'Tempestade', 'Trapaça', 'Forja', 'Túmulo', 'Ordem', 'Paz', 'Crepúsculo'] },
  druid: { name: 'Druida', hd: 8, primary: 'wis', saves: ['int', 'wis'], skills: ['Arcanismo', 'Adestrar Animais', 'Intuição', 'Medicina', 'Natureza', 'Percepção', 'Religião', 'Sobrevivência'], skillCount: 2, subclasses: ['Terra', 'Lua', 'Sonhos', 'Pastor', 'Estrelas', 'Fogo Selvagem', 'Esporos'] },
  fighter: { name: 'Guerreiro', hd: 10, primary: 'str', saves: ['str', 'con'], skills: ['Acrobacia', 'Adestrar Animais', 'Atletismo', 'História', 'Intimidação', 'Intuição', 'Percepção', 'Sobrevivência'], skillCount: 2, subclasses: ['Campeão', 'Mestre de Batalha', 'Cavaleiro Arcano', 'Arqueiro Arcano', 'Cavaleiro', 'Samurai', 'Cavaleiro do Eco', 'Guerreiro Psiônico', 'Cavaleiro Rúnico'] },
  monk: { name: 'Monge', hd: 8, primary: 'dex', saves: ['str', 'dex'], skills: ['Acrobacia', 'Atletismo', 'Furtividade', 'História', 'Intuição', 'Religião'], skillCount: 2, subclasses: ['Punho Aberto', 'Sombras', 'Quatro Elementos', 'Mestre Bêbado', 'Kensei', 'Alma do Sol', 'Misericórdia', 'Eu Astral'] },
  paladin: { name: 'Paladino', hd: 10, primary: 'str', saves: ['wis', 'cha'], skills: ['Atletismo', 'Intimidação', 'Intuição', 'Medicina', 'Persuasão', 'Religião'], skillCount: 2, subclasses: ['Devoção', 'Antigos', 'Vingança', 'Conquista', 'Redenção', 'Coroa', 'Vigias', 'Glória'] },
  ranger: { name: 'Patrulheiro', hd: 10, primary: 'dex', saves: ['str', 'dex'], skills: ['Adestrar Animais', 'Atletismo', 'Furtividade', 'Intuição', 'Investigação', 'Natureza', 'Percepção', 'Sobrevivência'], skillCount: 3, subclasses: ['Caçador', 'Senhor das Feras', 'Andarilho das Sombras', 'Andarilho do Horizonte', 'Matador de Monstros', 'Errante Feérico', 'Guardião de Enxame', 'Guardião de Draco'] },
  rogue: { name: 'Ladino', hd: 8, primary: 'dex', saves: ['dex', 'int'], skills: ['Acrobacia', 'Atletismo', 'Atuação', 'Enganação', 'Furtividade', 'Intimidação', 'Intuição', 'Investigação', 'Percepção', 'Persuasão', 'Prestidigitação'], skillCount: 4, subclasses: ['Ladrão', 'Assassino', 'Trapaceiro Arcano', 'Investigador', 'Mentor', 'Explorador', 'Fantasma', 'Adaga da Alma'] },
  sorcerer: { name: 'Feiticeiro', hd: 6, primary: 'cha', saves: ['con', 'cha'], skills: ['Arcanismo', 'Atuação', 'Enganação', 'Intimidação', 'Intuição', 'Persuasão', 'Religião'], skillCount: 2, subclasses: ['Dracônica', 'Magia Selvagem', 'Alma Divina', 'Sombra', 'Tempestade', 'Mente Aberrante', 'Alma Mecânica'] },
  warlock: { name: 'Bruxo', hd: 8, primary: 'cha', saves: ['wis', 'cha'], skills: ['Arcanismo', 'Atuação', 'Enganação', 'História', 'Intimidação', 'Intuição', 'Investigação', 'Natureza', 'Religião'], skillCount: 2, subclasses: ['Corruptor', 'Arquifada', 'Grande Antigo', 'Celestial', 'Lâmina Maldita', 'Abissal', 'Gênio', 'Morto-Vivo'] },
  wizard: { name: 'Mago', hd: 6, primary: 'int', saves: ['int', 'wis'], skills: ['Arcanismo', 'História', 'Intuição', 'Investigação', 'Medicina', 'Religião'], skillCount: 2, subclasses: ['Evocação', 'Ilusão', 'Necromancia', 'Abjuração', 'Conjuração', 'Adivinhação', 'Encantamento', 'Transmutação', 'Magia de Guerra', 'Canto das Lâminas', 'Escriba'] }
}

const BACKGROUNDS = [
  { key: 'acolyte', name: 'Acólito', skills: ['Intuição', 'Religião'], languages: 2, equipment: 'Símbolo sagrado, livro de orações, incenso, vestes, 15 po', feature: 'Abrigo dos Fiéis' },
  { key: 'criminal', name: 'Criminoso', skills: ['Enganação', 'Furtividade'], tools: 'Ferramentas de ladrão', equipment: 'Pé de cabra, roupas escuras, 15 po', feature: 'Contato Criminoso' },
  { key: 'folk_hero', name: 'Herói do Povo', skills: ['Adestrar Animais', 'Sobrevivência'], tools: 'Ferramentas de artesão', equipment: 'Ferramentas, pá, panela, 10 po', feature: 'Hospitalidade' },
  { key: 'noble', name: 'Nobre', skills: ['História', 'Persuasão'], languages: 1, equipment: 'Roupas finas, anel de sinete, 25 po', feature: 'Privilégio da Nobreza' },
  { key: 'sage', name: 'Sábio', skills: ['Arcanismo', 'História'], languages: 2, equipment: 'Tinta, pena, carta, 10 po', feature: 'Pesquisador' },
  { key: 'soldier', name: 'Soldado', skills: ['Atletismo', 'Intimidação'], tools: 'Kit de jogo', equipment: 'Insígnia, troféu, 10 po', feature: 'Patente Militar' },
  { key: 'entertainer', name: 'Artista', skills: ['Acrobacia', 'Atuação'], tools: 'Instrumento musical', equipment: 'Instrumento, fantasia, 15 po', feature: 'Popularidade' },
  { key: 'urchin', name: 'Órfão', skills: ['Furtividade', 'Prestidigitação'], tools: 'Ferramentas de ladrão', equipment: 'Faca, mapa, rato, 10 po', feature: 'Segredos da Cidade' },
  { key: 'outlander', name: 'Forasteiro', skills: ['Atletismo', 'Sobrevivência'], tools: 'Instrumento', equipment: 'Bastão, armadilha, 10 po', feature: 'Andarilho' },
  { key: 'sailor', name: 'Marinheiro', skills: ['Atletismo', 'Percepção'], tools: 'Navegação', equipment: 'Taco, corda, amuleto, 10 po', feature: 'Passagem de Navio' },
  { key: 'hermit', name: 'Eremita', skills: ['Medicina', 'Religião'], tools: 'Kit de herbalismo', equipment: 'Kit herbalismo, cobertor, 5 po', feature: 'Descoberta' },
  { key: 'charlatan', name: 'Charlatão', skills: ['Enganação', 'Prestidigitação'], tools: 'Kit de disfarce', equipment: 'Kit disfarce, roupas finas, 15 po', feature: 'Identidade Falsa' }
]

const ALIGNMENTS = [
  { value: 'lawful_good', name: 'Leal e Bom' }, { value: 'neutral_good', name: 'Neutro e Bom' }, { value: 'chaotic_good', name: 'Caótico e Bom' },
  { value: 'lawful_neutral', name: 'Leal e Neutro' }, { value: 'true_neutral', name: 'Neutro' }, { value: 'chaotic_neutral', name: 'Caótico e Neutro' },
  { value: 'lawful_evil', name: 'Leal e Mau' }, { value: 'neutral_evil', name: 'Neutro e Mau' }, { value: 'chaotic_evil', name: 'Caótico e Mau' }
]

// ============ FUNÇÕES ============
function getMod(v) { return Math.floor((v - 10) / 2) }
function getPB(level) { return Math.floor((level - 1) / 4) + 2 }

const XP_TABLE = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000]
const HP_AVG = { 6: 4, 8: 5, 10: 6, 12: 7 }

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
  const [rolledScores, setRolledScores] = useState(null)

  const STEPS = ['Raça', 'Sub-Raça', 'Classe', 'Subclasse', 'Antecedente', 'Atributos', 'Perícias', 'Nível', 'Detalhes', 'Revisão']

  const race = selectedRace ? RACES[selectedRace] : null
  const cls = selectedClass ? CLASSES[selectedClass] : null
  const bg = selectedBg ? BACKGROUNDS.find(b => b.key === selectedBg) : null

  function rollStats() {
    const result = {}
    const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha']
    abilities.forEach(a => {
      const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1)
      rolls.sort((a, b) => b - a)
      result[a] = rolls[0] + rolls[1] + rolls[2]
    })
    setRolledScores(result)
    setScores(result)
    return result
  }

  function applyBonuses(sc = scores) {
    let newScores = { ...sc }
    if (race?.bonuses) {
      for (const [k, v] of Object.entries(race.bonuses)) newScores[k] = (newScores[k] || 10) + v
    }
    if (selectedSubrace && SUBRACES[selectedSubrace]?.bonuses) {
      for (const [k, v] of Object.entries(SUBRACES[selectedSubrace].bonuses)) newScores[k] = (newScores[k] || 10) + v
    }
    return newScores
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
    const avgHP = HP_AVG[cls.hd] || 5
    return cls.hd + conMod + (avgHP + conMod) * (level - 1)
  }

  async function handleCreate() {
    setSaving(true)
    try {
      const finalScores = applyBonuses()
      const mods = {}
      for (const [k, v] of Object.entries(finalScores)) mods[k] = getMod(v)
      const hp = calculateHP()
      const pb = getPB(level)

      const { error } = await supabase.from('characters').insert({
        user_id: user.id, campaign_id: campaignId, name, level,
        race: race.name + (selectedSubrace ? ' (' + SUBRACES[selectedSubrace].name + ')' : ''),
        class: cls.name,
        subclass: selectedSubclass || null,
        background: bg?.name || '',
        alignment,
        experience: XP_TABLE[Math.min(level - 1, 19)],
        ability_scores: finalScores,
        hit_points: { max: hp, current: hp, temporary: 0 },
        hit_dice: { total: level, current: level, type: 'd' + cls.hd },
        armor_class: 10 + (mods.dex || 0),
        speed: (race?.speed || 30) + (selectedSubrace && SUBRACES[selectedSubrace]?.speed || 0),
        initiative: mods.dex || 0,
        proficiency_bonus: pb,
        skills: {},
        skill_proficiencies: selectedSkills,
        saving_throw_proficiencies: cls.saves,
        traits: [...(race?.traits || []), ...(selectedSubrace && SUBRACES[selectedSubrace]?.traits || [])],
        languages: [...(race?.languages || []), 'Comum'],
        features: [{ name: bg?.feature || '', description: bg?.equipment || '' }],
        currency: { cp: 0, sp: 0, ep: 0, gp: 10 + (level - 1) * 5, pp: 0 },
        weapons: [],
        spells: [],
        equipment: bg?.equipment ? [bg.equipment] : []
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
          STEPS.map((s, i) => React.createElement('button', { key: s, onClick: () => setStep(i),
            style: { padding: '6px 12px', borderRadius: '5px', border: 'none', cursor: 'pointer', background: i === step ? '#d4891a' : i < step ? '#4a2508' : '#2d1605', color: i === step ? '#1a0c03' : '#8b4f0f', fontFamily: 'Georgia, serif', fontSize: '12px' }
          }, (i + 1) + '.'))
        )
      )
    ),
    React.createElement('div', { style: mn },
      React.createElement('div', { style: box },
        step === 0 && React.createElement('div', null,
          React.createElement('h2', { style: title }, '1. Escolha sua Raça'),
          React.createElement('div', { style: grid2 },
            Object.entries(RACES).map(([k, r]) => React.createElement('button', { key: k, onClick: () => { setSelectedRace(k); setSelectedSubrace(null) }, style: selectedRace === k ? { ...sel, textAlign: 'left' } : { ...btn, textAlign: 'left' } },
              React.createElement('div', { style: { fontWeight: 'bold', fontSize: '1.1rem' } }, r.name),
              React.createElement('div', { style: { color: '#8b4f0f', fontSize: '13px' } }, r.size + ' • ' + r.speed + ' pés'),
              React.createElement('div', { style: { color: '#4ade80', fontSize: '12px', marginTop: '4px' } }, Object.entries(r.bonuses).map(([a, b]) => '+' + b + ' ' + a.toUpperCase()).join(', '))
            ))
          )
        ),
        step === 1 && React.createElement('div', null,
          React.createElement('h2', { style: title }, '2. Sub-Raça'),
          !race ? React.createElement('p', { style: { color: '#ef4444' } }, '⚠️ Escolha uma raça primeiro.')
          : race.subraces.length === 0 ? React.createElement('p', { style: { color: '#4ade80' } }, '✅ ' + race.name + ' não tem sub-raças.')
          : React.createElement('div', { style: grid2 }, race.subraces.map(sk => SUBRACES[sk] && React.createElement('button', { key: sk, onClick: () => setSelectedSubrace(sk), style: selectedSubrace === sk ? { ...sel, textAlign: 'left' } : { ...btn, textAlign: 'left' } },
              React.createElement('div', { style: { fontWeight: 'bold' } }, SUBRACES[sk].name),
              SUBRACES[sk].bonuses && React.createElement('div', { style: { color: '#4ade80', fontSize: '12px' } }, Object.entries(SUBRACES[sk].bonuses).map(([a, b]) => '+' + b + ' ' + a.toUpperCase()).join(', '))
            )))
        ),
        step === 2 && React.createElement('div', null,
          React.createElement('h2', { style: title }, '3. Classe'),
          React.createElement('div', { style: grid3 }, Object.entries(CLASSES).map(([k, c]) => React.createElement('button', { key: k, onClick: () => { setSelectedClass(k); setSelectedSubclass(null); setSelectedSkills([]) }, style: selectedClass === k ? { ...sel, textAlign: 'center' } : { ...btn, textAlign: 'center' } },
            React.createElement('div', { style: { fontWeight: 'bold' } }, c.name),
            React.createElement('div', { style: { color: '#8b4f0f', fontSize: '12px' } }, 'd' + c.hd + ' • ' + c.primary.toUpperCase())
          )))
        ),
        step === 3 && React.createElement('div', null,
          React.createElement('h2', { style: title }, '4. Subclasse (opcional)'),
          !cls ? React.createElement('p', { style: { color: '#ef4444' } }, '⚠️ Escolha uma classe primeiro.')
          : React.createElement('div', { style: grid2 }, cls.subclasses.map(sc => React.createElement('button', { key: sc, onClick: () => setSelectedSubclass(sc === selectedSubclass ? null : sc), style: selectedSubclass === sc ? { ...sel, textAlign: 'left' } : { ...btn, textAlign: 'left' } }, sc)))
        ),
        step === 4 && React.createElement('div', null,
          React.createElement('h2', { style: title }, '5. Antecedente'),
          React.createElement('div', { style: grid2 }, BACKGROUNDS.map(b => React.createElement('button', { key: b.key, onClick: () => setSelectedBg(b.key), style: selectedBg === b.key ? { ...sel, textAlign: 'left' } : { ...btn, textAlign: 'left' } },
            React.createElement('div', { style: { fontWeight: 'bold' } }, b.name),
            React.createElement('div', { style: { color: '#8b4f0f', fontSize: '12px' } }, b.skills.join(', '))
          )))
        ),
        step === 5 && React.createElement('div', null,
          React.createElement('h2', { style: title }, '6. Atributos'),
          React.createElement('div', { style: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' } },
            React.createElement('button', { onClick: () => setScores({ str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 }), style: { ...btn, background: '#4a2508', textAlign: 'center' } }, '📊 Array Padrão'),
            React.createElement('button', { onClick: rollStats, style: { ...btn, background: '#4a2508', textAlign: 'center' } }, '🎲 Rolar 4d6')
          ),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' } },
            ['str', 'dex', 'con', 'int', 'wis', 'cha'].map(ab => {
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
        step === 6 && React.createElement('div', null,
          React.createElement('h2', { style: title }, '7. Perícias (' + selectedSkills.length + '/' + (cls?.skillCount || 0) + ')'),
          !cls ? React.createElement('p', { style: { color: '#ef4444' } }, '⚠️ Escolha uma classe primeiro.')
          : React.createElement('div', { style: grid3 }, cls.skills.map(skill => React.createElement('button', { key: skill, onClick: () => toggleSkill(skill),
            style: { ...(selectedSkills.includes(skill) ? sel : btn), textAlign: 'center', opacity: !selectedSkills.includes(skill) && selectedSkills.length >= cls.skillCount ? 0.4 : 1 }
          }, skill)))
        ),
        step === 7 && React.createElement('div', null,
          React.createElement('h2', { style: title }, '8. Nível do Personagem'),
          React.createElement('p', { style: { color: '#8b4f0f', marginBottom: '20px' } }, 'Escolha o nível inicial (1-20)'),
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '15px', maxWidth: '400px' } },
            React.createElement('button', { onClick: () => setLevel(l => Math.max(1, l - 1)), style: { ...btn, fontSize: '1.5rem', padding: '10px 20px' } }, '−'),
            React.createElement('span', { style: { fontSize: '2rem', fontWeight: 'bold', color: '#d4891a', minWidth: '60px', textAlign: 'center' } }, level),
            React.createElement('button', { onClick: () => setLevel(l => Math.min(20, l + 1)), style: { ...btn, fontSize: '1.5rem', padding: '10px 20px' } }, '+')
          ),
          React.createElement('div', { style: { marginTop: '15px', padding: '15px', background: '#1a0c03', borderRadius: '8px' } },
            React.createElement('p', { style: { color: '#8b4f0f' } }, 'Bônus de Proficiência: +' + getPB(level)),
            React.createElement('p', { style: { color: '#8b4f0f' } }, 'HP estimado: ' + calculateHP()),
            React.createElement('p', { style: { color: '#8b4f0f' } }, 'XP: ' + XP_TABLE[Math.min(level - 1, 19)].toLocaleString())
          )
        ),
        step === 8 && React.createElement('div', null,
          React.createElement('h2', { style: title }, '9. Detalhes Finais'),
          React.createElement('div', { style: { maxWidth: '500px' } },
            React.createElement('label', { style: { display: 'block', color: '#8b4f0f', marginBottom: '8px', fontFamily: 'Georgia, serif' } }, 'Nome'),
            React.createElement('input', { type: 'text', value: name, onChange: e => setName(e.target.value), placeholder: 'Nome do personagem...', style: { ...inputS, marginBottom: '20px' } }),
            React.createElement('label', { style: { display: 'block', color: '#8b4f0f', marginBottom: '8px', fontFamily: 'Georgia, serif' } }, 'Alinhamento'),
            React.createElement('select', { value: alignment, onChange: e => setAlignment(e.target.value), style: { ...inputS, marginBottom: '20px' } },
              ALIGNMENTS.map(a => React.createElement('option', { key: a.value, value: a.value }, a.name))
            )
          )
        ),
        step === 9 && React.createElement('div', null,
          React.createElement('h2', { style: title }, '📜 Pergaminho Final'),
          React.createElement('div', { style: { background: '#1a0c03', borderRadius: '8px', padding: '25px', border: '2px solid #8b4f0f', marginBottom: '20px' } },
            React.createElement('h3', { style: { color: '#d4891a', fontFamily: 'Georgia, serif', fontSize: '1.8rem', margin: '0 0 15px 0' } }, name || '(sem nome)'),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' } },
              React.createElement('p', { style: { margin: 0 } }, React.createElement('strong', { style: { color: '#8b4f0f' } }, 'Raça: '), (race?.name || '') + (selectedSubrace ? ' (' + SUBRACES[selectedSubrace]?.name + ')' : '')),
              React.createElement('p', { style: { margin: 0 } }, React.createElement('strong', { style: { color: '#8b4f0f' } }, 'Classe: '), (cls?.name || '') + (selectedSubclass ? ' - ' + selectedSubclass : '')),
              React.createElement('p', { style: { margin: 0 } }, React.createElement('strong', { style: { color: '#8b4f0f' } }, 'Nível: '), level),
              React.createElement('p', { style: { margin: 0 } }, React.createElement('strong', { style: { color: '#8b4f0f' } }, 'HP: '), calculateHP()),
              React.createElement('p', { style: { margin: 0 } }, React.createElement('strong', { style: { color: '#8b4f0f' } }, 'CA: '), 10 + getMod(applyBonuses().dex)),
              React.createElement('p', { style: { margin: 0 } }, React.createElement('strong', { style: { color: '#8b4f0f' } }, 'Proficiência: '), '+' + getPB(level))
            ),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginTop: '15px' } },
              Object.entries(applyBonuses()).map(([k, v]) => React.createElement('div', { key: k, style: { textAlign: 'center', background: '#2d1605', padding: '8px', borderRadius: '5px' } },
                React.createElement('div', { style: { color: '#8b4f0f', fontSize: '11px', textTransform: 'uppercase' } }, k),
                React.createElement('div', { style: { color: '#fdf8f0', fontWeight: 'bold' } }, v)
              ))
            )
          ),
          React.createElement('button', { onClick: handleCreate, disabled: saving || !name, style: { width: '100%', padding: '18px', background: '#8b4f0f', color: '#fdf8f0', border: 'none', borderBottom: '4px solid #4a2508', borderRadius: '8px', fontSize: '20px', cursor: 'pointer', fontFamily: 'Georgia, serif', opacity: saving || !name ? 0.5 : 1 } },
            '⚔️ ' + (saving ? 'Forjando...' : 'FORJAR DESTINO!')
          )
        )
      ),
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: '10px' } },
        React.createElement('button', { onClick: () => setStep(s => s - 1), disabled: step === 0, style: { padding: '12px 30px', background: '#2d1605', color: '#fdf8f0', border: '1px solid #4a2508', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Georgia, serif', opacity: step === 0 ? 0.3 : 1 } }, '⬅ Voltar'),
        step < 9 && React.createElement('button', { onClick: () => setStep(s => s + 1), style: { padding: '12px 30px', background: '#8b4f0f', color: '#fdf8f0', border: 'none', borderBottom: '3px solid #4a2508', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Georgia, serif' } }, 'Próximo ➡')
      )
    )
  )
}
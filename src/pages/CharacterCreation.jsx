import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// ============ DADOS COMPLETOS ============

const RACES = {
  human: { name: 'Humano', source: 'SRD', bonuses: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 }, speed: 30, size: 'Médio', languages: ['Comum', 'Escolha'], traits: ['Versátil: Proficiência em uma perícia qualquer.'], subraces: [] },
  elf: { name: 'Elfo', source: 'SRD', bonuses: { dex: 2 }, speed: 30, size: 'Médio', languages: ['Comum', 'Élfico'], traits: ['Visão no Escuro (60 pés)', 'Sentidos Aguçados: Proficiência em Percepção', 'Ancestralidade Feérica: Vantagem contra encantamento', 'Transe: Medita 4h ao invés de dormir'], subraces: ['high_elf', 'wood_elf', 'dark_elf'] },
  dwarf: { name: 'Anão', source: 'SRD', bonuses: { con: 2 }, speed: 25, size: 'Médio', languages: ['Comum', 'Anão'], traits: ['Visão no Escuro (60 pés)', 'Resiliência Anã: Vantagem e resistência contra veneno', 'Conhecimento da Rocha'], subraces: ['hill_dwarf', 'mountain_dwarf'] },
  halfling: { name: 'Halfling', source: 'SRD', bonuses: { dex: 2 }, speed: 25, size: 'Pequeno', languages: ['Comum', 'Halfling'], traits: ['Sortudo: Rerrola 1 no d20', 'Corajoso: Vantagem contra medo'], subraces: ['lightfoot', 'stout'] },
  dragonborn: { name: 'Draconato', source: 'SRD', bonuses: { str: 2, cha: 1 }, speed: 30, size: 'Médio', languages: ['Comum', 'Dracônico'], traits: ['Arma de Sopro', 'Resistência a Dano (ancestralidade)'], subraces: [] },
  gnome: { name: 'Gnomo', source: 'SRD', bonuses: { int: 2 }, speed: 25, size: 'Pequeno', languages: ['Comum', 'Gnômico'], traits: ['Visão no Escuro (60 pés)', 'Esperteza Gnômica: Vantagem em Int/Sab/Car contra magia'], subraces: ['forest_gnome', 'rock_gnome'] },
  half_elf: { name: 'Meio-Elfo', source: 'SRD', bonuses: { cha: 2, dex: 1, con: 1 }, speed: 30, size: 'Médio', languages: ['Comum', 'Élfico', 'Escolha'], traits: ['Visão no Escuro (60 pés)', 'Versatilidade: Proficiência em duas perícias'], subraces: [] },
  half_orc: { name: 'Meio-Orc', source: 'SRD', bonuses: { str: 2, con: 1 }, speed: 30, size: 'Médio', languages: ['Comum', 'Orc'], traits: ['Visão no Escuro (60 pés)', 'Resistência Implacável: Fica com 1 HP ao cair', 'Ataques Selvagens: +1 dado em crítico'], subraces: [] },
  tiefling: { name: 'Tiefling', source: 'SRD', bonuses: { int: 1, cha: 2 }, speed: 30, size: 'Médio', languages: ['Comum', 'Infernal'], traits: ['Visão no Escuro (60 pés)', 'Resistência Infernal: Resistência a fogo', 'Magia Infernal: Taumaturgia, Repreensão Infernal, Escuridão'], subraces: [] },
  aasimar: { name: 'Aasimar', source: 'MotM', bonuses: { cha: 2, wis: 1 }, speed: 30, size: 'Médio', languages: ['Comum', 'Celestial'], traits: ['Visão no Escuro (60 pés)', 'Resistência Celestial: Necrótico e Radiante', 'Toque de Cura', 'Portador da Luz'], subraces: ['protector', 'scourge', 'fallen'] },
  genasi: { name: 'Genasi', source: 'MotM', bonuses: { con: 2 }, speed: 30, size: 'Médio', languages: ['Comum', 'Primordial'], traits: ['Visão no Escuro (60 pés)'], subraces: ['air', 'earth', 'fire', 'water'] },
  goliath: { name: 'Golias', source: 'MotM', bonuses: { str: 2, con: 1 }, speed: 30, size: 'Médio', languages: ['Comum', 'Gigante'], traits: ['Atleta Natural', 'Resistência da Pedra', 'Nascido nas Montanhas'], subraces: [] },
  tabaxi: { name: 'Tabaxi', source: 'MotM', bonuses: { dex: 2, cha: 1 }, speed: 30, size: 'Médio', languages: ['Comum', 'Escolha'], traits: ['Visão no Escuro (60 pés)', 'Agilidade Felina: Dobra velocidade', 'Garras: 1d6 cortante'], subraces: [] },
  firbolg: { name: 'Firbolg', source: 'MotM', bonuses: { wis: 2, str: 1 }, speed: 30, size: 'Médio', languages: ['Comum', 'Élfico', 'Gigante'], traits: ['Magia Firbolg', 'Passo Oculto', 'Fala com Bestas e Plantas'], subraces: [] },
  kenku: { name: 'Kenku', source: 'MotM', bonuses: { dex: 2, wis: 1 }, speed: 30, size: 'Médio', languages: ['Comum', 'Escolha'], traits: ['Mimetismo', 'Falsificação'], subraces: [] },
  tortle: { name: 'Tortle', source: 'MotM', bonuses: { str: 2, wis: 1 }, speed: 30, size: 'Médio', languages: ['Comum', 'Aquan'], traits: ['Garras', 'Prender a Respiração', 'Defesa Natural: CA 17'], subraces: [] },
  changeling: { name: 'Changeling', source: 'MotM', bonuses: { cha: 2, dex: 1 }, speed: 30, size: 'Médio', languages: ['Comum', 'Escolha', 'Escolha'], traits: ['Mudança de Forma', 'Personalidade Múltipla'], subraces: [] },
  shifter: { name: 'Shifter', source: 'MotM', bonuses: { dex: 1 }, speed: 30, size: 'Médio', languages: ['Comum'], traits: ['Visão no Escuro (60 pés)', 'Transformação'], subraces: ['beasthide', 'longtooth', 'swiftstride', 'wildhunt'] }
}

const SUBRACES = {
  high_elf: { name: 'Alto Elfo', bonuses: { int: 1 }, traits: ['Truque de mago', 'Treinamento Élfico: Espadas longas/curtas, arcos'] },
  wood_elf: { name: 'Elfo da Floresta', bonuses: { wis: 1 }, speed: 5, traits: ['Máscara da Natureza', 'Treinamento Élfico'] },
  dark_elf: { name: 'Drow', bonuses: { cha: 1 }, traits: ['Visão no Escuro (120 pés)', 'Magia Drow: Globos de Luz, Fogo das Fadas, Escuridão'] },
  hill_dwarf: { name: 'Anão da Colina', bonuses: { wis: 1 }, traits: ['Robustez Anã: +1 HP por nível'] },
  mountain_dwarf: { name: 'Anão da Montanha', bonuses: { str: 2 }, traits: ['Armadura Anã: Proficiência com armaduras leves e médias'] },
  lightfoot: { name: 'Pé-Leve', bonuses: { cha: 1 }, traits: ['Furtividade Natural'] },
  stout: { name: 'Robusto', bonuses: { con: 1 }, traits: ['Resiliência Robusta: Vantagem e resistência a veneno'] },
  forest_gnome: { name: 'Gnomo da Floresta', bonuses: { dex: 1 }, traits: ['Ilusionista Nato: Ilusão Menor', 'Falar com Pequenos Animais'] },
  rock_gnome: { name: 'Gnomo das Rochas', bonuses: { con: 1 }, traits: ['Engenhoca: Ferramentas de funileiro'] },
  protector: { name: 'Protetor', bonuses: { wis: 1 }, traits: ['Alma Radiante: Asas e dano radiante'] },
  scourge: { name: 'Flagelo', bonuses: { con: 1 }, traits: ['Consumo Radiante: Aura de dano radiante'] },
  fallen: { name: 'Caído', bonuses: { str: 1 }, traits: ['Túmulo Necrótico: Aura de medo'] },
  air: { name: 'Genasi do Ar', bonuses: { dex: 1 }, traits: ['Respiração Infinita', 'Fundir-se ao Vento: Levitação + Rajada de Vento'] },
  earth: { name: 'Genasi da Terra', bonuses: { str: 1 }, traits: ['Passo da Terra: Ignora terreno difícil'] },
  fire: { name: 'Genasi do Fogo', bonuses: { int: 1 }, traits: ['Resistência ao Fogo', 'Alcance das Chamas: Produzir Chamas, Mãos Flamejantes'] },
  water: { name: 'Genasi da Água', bonuses: { wis: 1 }, traits: ['Anfíbio', 'Nado: 30 pés'] },
  beasthide: { name: 'Pele de Fera', bonuses: { con: 1 }, traits: ['+1d6 HP temporário e +1 CA ao transformar'] },
  longtooth: { name: 'Dente Longo', bonuses: { str: 1 }, traits: ['Mordida: Ação bônus 1d6 + For'] },
  swiftstride: { name: 'Passo Rápido', bonuses: { dex: 1 }, traits: ['Veloz: +5 pés, +10 ao transformar'] },
  wildhunt: { name: 'Caça Selvagem', bonuses: { wis: 1 }, traits: ['Rastreador: Vantagem em Sobrevivência'] }
}

const CLASSES = {
  barbarian: { name: 'Bárbaro', hd: 12, primary: 'str', saves: ['str', 'con'], skills: ['Adestrar Animais', 'Atletismo', 'Intimidação', 'Natureza', 'Percepção', 'Sobrevivência'], skillCount: 2, subclasses: ['Berserker', 'Guerreiro Totêmico', 'Guardião Ancestral (XGtE)', 'Arauto da Tempestade (XGtE)', 'Zelote (XGtE)', 'Besta (TCoE)', 'Magia Selvagem (TCoE)'] },
  bard: { name: 'Bardo', hd: 8, primary: 'cha', saves: ['dex', 'cha'], skills: ['Acrobacia', 'Adestrar Animais', 'Arcanismo', 'Atletismo', 'Atuação', 'Enganação', 'Furtividade', 'História', 'Intimidação', 'Intuição', 'Investigação', 'Medicina', 'Natureza', 'Percepção', 'Persuasão', 'Prestidigitação', 'Religião', 'Sobrevivência'], skillCount: 3, subclasses: ['Colégio da Sabedoria', 'Colégio do Valor', 'Colégio do Glamour (XGtE)', 'Colégio das Espadas (XGtE)', 'Colégio dos Sussurros (XGtE)', 'Colégio da Criação (TCoE)', 'Colégio da Eloquência (TCoE)'] },
  cleric: { name: 'Clérigo', hd: 8, primary: 'wis', saves: ['wis', 'cha'], skills: ['História', 'Intuição', 'Medicina', 'Persuasão', 'Religião'], skillCount: 2, subclasses: ['Domínio da Vida', 'Domínio da Luz', 'Domínio da Guerra', 'Domínio do Conhecimento', 'Domínio da Natureza', 'Domínio da Tempestade', 'Domínio da Trapaça', 'Domínio da Forja (XGtE)', 'Domínio do Túmulo (XGtE)', 'Domínio da Ordem (TCoE)', 'Domínio da Paz (TCoE)', 'Domínio do Crepúsculo (TCoE)'] },
  druid: { name: 'Druida', hd: 8, primary: 'wis', saves: ['int', 'wis'], skills: ['Arcanismo', 'Adestrar Animais', 'Intuição', 'Medicina', 'Natureza', 'Percepção', 'Religião', 'Sobrevivência'], skillCount: 2, subclasses: ['Círculo da Terra', 'Círculo da Lua', 'Círculo dos Sonhos (XGtE)', 'Círculo do Pastor (XGtE)', 'Círculo das Estrelas (TCoE)', 'Círculo do Fogo Selvagem (TCoE)', 'Círculo dos Esporos (TCoE)'] },
  fighter: { name: 'Guerreiro', hd: 10, primary: 'str', saves: ['str', 'con'], skills: ['Acrobacia', 'Adestrar Animais', 'Atletismo', 'História', 'Intimidação', 'Intuição', 'Percepção', 'Sobrevivência'], skillCount: 2, subclasses: ['Campeão', 'Mestre de Batalha', 'Cavaleiro Arcano', 'Arqueiro Arcano (XGtE)', 'Cavaleiro (XGtE)', 'Samurai (XGtE)', 'Cavaleiro do Eco (EGtW)', 'Guerreiro Psiônico (TCoE)', 'Cavaleiro Rúnico (TCoE)'] },
  monk: { name: 'Monge', hd: 8, primary: 'dex', saves: ['str', 'dex'], skills: ['Acrobacia', 'Atletismo', 'Furtividade', 'História', 'Intuição', 'Religião'], skillCount: 2, subclasses: ['Punho Aberto', 'Sombras', 'Quatro Elementos', 'Mestre Bêbado (XGtE)', 'Kensei (XGtE)', 'Alma do Sol (XGtE)', 'Misericórdia (TCoE)', 'Eu Astral (TCoE)'] },
  paladin: { name: 'Paladino', hd: 10, primary: 'str', saves: ['wis', 'cha'], skills: ['Atletismo', 'Intimidação', 'Intuição', 'Medicina', 'Persuasão', 'Religião'], skillCount: 2, subclasses: ['Juramento de Devoção', 'Juramento dos Antigos', 'Juramento de Vingança', 'Juramento de Conquista (XGtE)', 'Juramento de Redenção (XGtE)', 'Juramento da Coroa (SCAG)', 'Juramento dos Vigias (TCoE)', 'Juramento da Glória (TCoE)'] },
  ranger: { name: 'Patrulheiro', hd: 10, primary: 'dex', saves: ['str', 'dex'], skills: ['Adestrar Animais', 'Atletismo', 'Furtividade', 'Intuição', 'Investigação', 'Natureza', 'Percepção', 'Sobrevivência'], skillCount: 3, subclasses: ['Caçador', 'Senhor das Feras', 'Andarilho das Sombras (XGtE)', 'Andarilho do Horizonte (XGtE)', 'Matador de Monstros (XGtE)', 'Errante Feérico (TCoE)', 'Guardião de Enxame (TCoE)', 'Guardião de Draco (FTD)'] },
  rogue: { name: 'Ladino', hd: 8, primary: 'dex', saves: ['dex', 'int'], skills: ['Acrobacia', 'Atletismo', 'Atuação', 'Enganação', 'Furtividade', 'Intimidação', 'Intuição', 'Investigação', 'Percepção', 'Persuasão', 'Prestidigitação'], skillCount: 4, subclasses: ['Ladrão', 'Assassino', 'Trapaceiro Arcano', 'Investigador (XGtE)', 'Mentor (XGtE)', 'Explorador (XGtE)', 'Fantasma (TCoE)', 'Adaga da Alma (TCoE)'] },
  sorcerer: { name: 'Feiticeiro', hd: 6, primary: 'cha', saves: ['con', 'cha'], skills: ['Arcanismo', 'Atuação', 'Enganação', 'Intimidação', 'Intuição', 'Persuasão', 'Religião'], skillCount: 2, subclasses: ['Linhagem Dracônica', 'Magia Selvagem', 'Alma Divina (XGtE)', 'Feitiçaria da Sombra (XGtE)', 'Feitiçaria da Tempestade (XGtE)', 'Mente Aberrante (TCoE)', 'Alma Mecânica (TCoE)'] },
  warlock: { name: 'Bruxo', hd: 8, primary: 'cha', saves: ['wis', 'cha'], skills: ['Arcanismo', 'Atuação', 'Enganação', 'História', 'Intimidação', 'Intuição', 'Investigação', 'Natureza', 'Religião'], skillCount: 2, subclasses: ['Corruptor', 'Arquifada', 'Grande Antigo', 'Celestial (XGtE)', 'Lâmina Maldita (XGtE)', 'Abissal (TCoE)', 'Gênio (TCoE)', 'Morto-Vivo (VRGtR)'] },
  wizard: { name: 'Mago', hd: 6, primary: 'int', saves: ['int', 'wis'], skills: ['Arcanismo', 'História', 'Intuição', 'Investigação', 'Medicina', 'Religião'], skillCount: 2, subclasses: ['Evocação', 'Ilusão', 'Necromancia', 'Abjuração', 'Conjuração', 'Adivinhação', 'Encantamento', 'Transmutação', 'Magia de Guerra (XGtE)', 'Canto das Lâminas (TCoE)', 'Escriba (TCoE)', 'Cronurgia (EGtW)', 'Graviturgia (EGtW)'] }
}

const BACKGROUNDS = [
  { key: 'acolyte', name: 'Acólito', skills: ['Intuição', 'Religião'], languages: 2, equipment: 'Símbolo sagrado, livro de orações, incenso, vestes, 15 po', feature: 'Abrigo dos Fiéis' },
  { key: 'criminal', name: 'Criminoso', skills: ['Enganação', 'Furtividade'], tools: 'Ferramentas de ladrão, kit de jogo', equipment: 'Pé de cabra, roupas escuras, 15 po', feature: 'Contato Criminoso' },
  { key: 'folk_hero', name: 'Herói do Povo', skills: ['Adestrar Animais', 'Sobrevivência'], tools: 'Ferramentas de artesão', equipment: 'Ferramentas, pá, panela, roupas comuns, 10 po', feature: 'Hospitalidade do Povo' },
  { key: 'noble', name: 'Nobre', skills: ['História', 'Persuasão'], languages: 1, equipment: 'Roupas finas, anel de sinete, pergaminho, 25 po', feature: 'Privilégio da Nobreza' },
  { key: 'sage', name: 'Sábio', skills: ['Arcanismo', 'História'], languages: 2, equipment: 'Tinta, pena, faca, carta, roupas comuns, 10 po', feature: 'Pesquisador' },
  { key: 'soldier', name: 'Soldado', skills: ['Atletismo', 'Intimidação'], tools: 'Kit de jogo, veículos terrestres', equipment: 'Insígnia, troféu, dados, roupas comuns, 10 po', feature: 'Patente Militar' },
  { key: 'entertainer', name: 'Artista', skills: ['Acrobacia', 'Atuação'], tools: 'Kit de disfarce, instrumento musical', equipment: 'Instrumento, fantasia, 15 po', feature: 'Popularidade' },
  { key: 'urchin', name: 'Órfão', skills: ['Furtividade', 'Prestidigitação'], tools: 'Kit de disfarce, ferramentas de ladrão', equipment: 'Faca pequena, mapa da cidade, rato de estimação, 10 po', feature: 'Segredos da Cidade' },
  { key: 'outlander', name: 'Forasteiro', skills: ['Atletismo', 'Sobrevivência'], tools: 'Instrumento musical', equipment: 'Bastão, armadilha, troféu, 10 po', feature: 'Andarilho' },
  { key: 'sailor', name: 'Marinheiro', skills: ['Atletismo', 'Percepção'], tools: 'Ferramentas de navegação, veículos aquáticos', equipment: 'Taco, corda de seda, amuleto, 10 po', feature: 'Passagem de Navio' },
  { key: 'hermit', name: 'Eremita', skills: ['Medicina', 'Religião'], tools: 'Kit de herbalismo', equipment: 'Kit de herbalismo, cobertor, roupas, 5 po', feature: 'Descoberta' },
  { key: 'charlatan', name: 'Charlatão', skills: ['Enganação', 'Prestidigitação'], tools: 'Kit de disfarce, kit de falsificação', equipment: 'Kit de disfarce, roupas finas, 15 po', feature: 'Identidade Falsa' },
  { key: 'guild_artisan', name: 'Artesão de Guilda', skills: ['Intuição', 'Persuasão'], tools: 'Ferramentas de artesão', languages: 1, equipment: 'Ferramentas, carta da guilda, roupas, 15 po', feature: 'Membro de Guilda' }
]

const ALIGNMENTS = [
  { value: 'lawful_good', name: 'Leal e Bom' },
  { value: 'neutral_good', name: 'Neutro e Bom' },
  { value: 'chaotic_good', name: 'Caótico e Bom' },
  { value: 'lawful_neutral', name: 'Leal e Neutro' },
  { value: 'true_neutral', name: 'Neutro' },
  { value: 'chaotic_neutral', name: 'Caótico e Neutro' },
  { value: 'lawful_evil', name: 'Leal e Mau' },
  { value: 'neutral_evil', name: 'Neutro e Mau' },
  { value: 'chaotic_evil', name: 'Caótico e Mau' }
]

// ============ COMPONENTE PRINCIPAL ============

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
  const [saving, setSaving] = useState(false)
  const [rollMethod, setRollMethod] = useState('standard')
  const [rolledScores, setRolledScores] = useState(null)

  const STEPS = [
    'Raça', 'Sub-Raça', 'Classe', 'Subclasse', 
    'Antecedente', 'Atributos', 'Perícias', 
    'Detalhes', 'Revisão'
  ]

  const race = selectedRace ? RACES[selectedRace] : null
  const cls = selectedClass ? CLASSES[selectedClass] : null
  const bg = selectedBg ? BACKGROUNDS.find(b => b.key === selectedBg) : null

  function getMod(v) { return Math.floor((v - 10) / 2) }

  function rollStats() {
    const result = {}
    const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha']
    abilities.forEach(a => {
      const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1)
      rolls.sort((a, b) => b - a)
      result[a] = rolls[0] + rolls[1] + rolls[2]
    })
    setRolledScores(result)
    return result
  }

  function applyBonuses() {
    if (!race) return scores
    let newScores = { ...scores }
    if (race.bonuses) {
      for (const [k, v] of Object.entries(race.bonuses)) {
        newScores[k] = (newScores[k] || 10) + v
      }
    }
    if (selectedSubrace && SUBRACES[selectedSubrace]?.bonuses) {
      for (const [k, v] of Object.entries(SUBRACES[selectedSubrace].bonuses)) {
        newScores[k] = (newScores[k] || 10) + v
      }
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

  async function handleCreate() {
    setSaving(true)
    try {
      const finalScores = applyBonuses()
      const mods = {}
      for (const [k, v] of Object.entries(finalScores)) mods[k] = getMod(v)
      const hp = (cls?.hd || 8) + (mods.con || 0)

      const { error } = await supabase.from('characters').insert({
        user_id: user.id,
        campaign_id: campaignId,
        name,
        race: race.name + (selectedSubrace ? ' (' + SUBRACES[selectedSubrace].name + ')' : ''),
        class: cls.name + (selectedSubclass ? ' - ' + selectedSubclass : ''),
        background: bg.name,
        level: 1,
        alignment,
        ability_scores: finalScores,
        hit_points: { max: hp, current: hp, temporary: 0 },
        hit_dice: { total: 1, current: 1, type: 'd' + cls.hd },
        armor_class: 10 + (mods.dex || 0),
        speed: (race.speed || 30) + (selectedSubrace && SUBRACES[selectedSubrace]?.speed || 0),
        initiative: mods.dex || 0,
        proficiency_bonus: 2,
        skill_proficiencies: selectedSkills,
        traits: [...(race.traits || []), ...(selectedSubrace && SUBRACES[selectedSubrace]?.traits || [])],
        features: [{ name: bg.feature, description: bg.equipment }]
      })
      if (error) throw error
      navigate('campaign', { campaignId })
    } catch (err) {
      alert('Erro ao criar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Estilos
  const pg = { minHeight: '100vh', background: '#1a0c03', color: '#fdf8f0' }
  const hd = { background: '#2d1605', borderBottom: '4px solid #8b4f0f', padding: '15px 20px' }
  const mn = { maxWidth: '1100px', margin: '0 auto', padding: '20px' }
  const box = { background: '#2d1605', borderRadius: '12px', border: '2px solid #4a2508', padding: '30px', marginBottom: '20px' }
  const btn = { padding: '14px 20px', background: '#1a0c03', border: '2px solid #4a2508', borderRadius: '8px', cursor: 'pointer', color: '#fdf8f0', textAlign: 'left', fontFamily: 'Georgia, serif' }
  const sel = { ...btn, background: '#4a2508', border: '2px solid #d4891a' }
  const grid2 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', marginTop: '15px' }
  const grid3 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginTop: '15px' }
  const title = { color: '#d4891a', fontFamily: 'Georgia, serif', fontSize: '1.5rem', margin: '0 0 20px 0' }
  const sub = { color: '#b87014', fontFamily: 'Georgia, serif', fontSize: '1.1rem', margin: '20px 0 10px 0' }

  return React.createElement('div', { style: pg },
    // Header com steps
    React.createElement('div', { style: hd },
      React.createElement('div', { style: { maxWidth: '1100px', margin: '0 auto' } },
        React.createElement('h1', { style: { color: '#d4891a', fontFamily: 'Georgia, serif', fontSize: '1.8rem', margin: '0 0 12px 0' } }, '⚒️ Criação de Personagem'),
        React.createElement('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } },
          STEPS.map((s, i) => React.createElement('button', {
            key: s,
            onClick: () => setStep(i),
            style: {
              padding: '8px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              background: i === step ? '#d4891a' : i < step ? '#4a2508' : '#2d1605',
              color: i === step ? '#1a0c03' : i === step ? '#1a0c03' : '#8b4f0f',
              fontFamily: 'Georgia, serif', fontSize: '13px'
            }
          }, (i + 1) + '. ' + s))
        )
      )
    ),

    // Conteúdo
    React.createElement('div', { style: mn },
      React.createElement('div', { style: box },

        // PASSO 0: RAÇA
        step === 0 && React.createElement('div', null,
          React.createElement('h2', { style: title }, '1. Escolha sua Raça'),
          React.createElement('div', { style: grid2 },
            Object.entries(RACES).map(([k, r]) => React.createElement('button', {
              key: k,
              onClick: () => { setSelectedRace(k); setSelectedSubrace(null); if (rollMethod === 'rolled' && rolledScores) setScores(rolledScores) },
              style: selectedRace === k ? { ...sel, textAlign: 'left' } : { ...btn, textAlign: 'left' }
            },
              React.createElement('div', { style: { fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '4px' } }, r.name),
              React.createElement('div', { style: { color: '#8b4f0f', fontSize: '13px' } }, r.source + ' • ' + r.size + ' • ' + r.speed + ' pés'),
              React.createElement('div', { style: { color: '#4ade80', fontSize: '12px', marginTop: '4px' } },
                Object.entries(r.bonuses).map(([a, b]) => '+' + b + ' ' + a.toUpperCase()).join(', ')
              ),
              React.createElement('div', { style: { color: '#6b7280', fontSize: '11px', marginTop: '4px' } },
                r.traits.slice(0, 2).join('; ') + (r.traits.length > 2 ? '...' : '')
              )
            ))
          ),
          selectedRace && race.subraces.length > 0 && React.createElement('p', { style: { color: '#d4891a', marginTop: '15px', fontFamily: 'Georgia, serif' } },
            '⚠️ Esta raça tem sub-raças. Avance para o próximo passo.'
          ),
          selectedRace && race.subraces.length === 0 && React.createElement('p', { style: { color: '#4ade80', marginTop: '15px' } },
            '✅ Raça selecionada! Pode avançar.'
          )
        ),

        // PASSO 1: SUB-RAÇA
        step === 1 && React.createElement('div', null,
          React.createElement('h2', { style: title }, '2. Escolha sua Sub-Raça'),
          !selectedRace ? React.createElement('p', { style: { color: '#ef4444' } }, '⚠️ Volte e escolha uma raça primeiro.')
          : race.subraces.length === 0 ? React.createElement('p', { style: { color: '#4ade80' } }, '✅ ' + race.name + ' não tem sub-raças. Avance para o próximo passo.')
          : React.createElement('div', { style: grid2 },
            race.subraces.map(sk => {
              const sr = SUBRACES[sk]
              if (!sr) return null
              return React.createElement('button', {
                key: sk,
                onClick: () => setSelectedSubrace(sk),
                style: selectedSubrace === sk ? { ...sel, textAlign: 'left' } : { ...btn, textAlign: 'left' }
              },
                React.createElement('div', { style: { fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '4px' } }, sr.name),
                sr.bonuses && React.createElement('div', { style: { color: '#4ade80', fontSize: '12px' } },
                  Object.entries(sr.bonuses).map(([a, b]) => '+' + b + ' ' + a.toUpperCase()).join(', ')
                ),
                React.createElement('div', { style: { color: '#6b7280', fontSize: '11px', marginTop: '4px' } },
                  sr.traits.join('; ')
                )
              )
            })
          )
        ),

        // PASSO 2: CLASSE
        step === 2 && React.createElement('div', null,
          React.createElement('h2', { style: title }, '3. Escolha sua Classe'),
          React.createElement('div', { style: grid3 },
            Object.entries(CLASSES).map(([k, c]) => React.createElement('button', {
              key: k,
              onClick: () => { setSelectedClass(k); setSelectedSubclass(null); setSelectedSkills([]) },
              style: selectedClass === k ? { ...sel, textAlign: 'center' } : { ...btn, textAlign: 'center' }
            },
              React.createElement('div', { style: { fontWeight: 'bold', fontSize: '1.1rem' } }, c.name),
              React.createElement('div', { style: { color: '#8b4f0f', fontSize: '13px', marginTop: '4px' } }, 'd' + c.hd + ' HP • ' + c.primary.toUpperCase()),
              React.createElement('div', { style: { color: '#6b7280', fontSize: '11px', marginTop: '4px' } }, c.subclasses.length + ' subclasses')
            ))
          )
        ),

        // PASSO 3: SUBCLASSE
        step === 3 && React.createElement('div', null,
          React.createElement('h2', { style: title }, '4. Escolha sua Subclasse (opcional)'),
          !selectedClass ? React.createElement('p', { style: { color: '#ef4444' } }, '⚠️ Volte e escolha uma classe primeiro.')
          : React.createElement('div', null,
            React.createElement('p', { style: { color: '#8b4f0f', marginBottom: '15px' } }, 'Subclasses disponíveis para ' + cls.name + ':'),
            React.createElement('div', { style: grid2 },
              cls.subclasses.map(sc => React.createElement('button', {
                key: sc,
                onClick: () => setSelectedSubclass(sc === selectedSubclass ? null : sc),
                style: selectedSubclass === sc ? { ...sel, textAlign: 'left' } : { ...btn, textAlign: 'left' }
              }, sc))
            ),
            React.createElement('p', { style: { color: '#6b7280', fontSize: '12px', marginTop: '15px' } }, 'A subclasse pode ser escolhida depois, no nível adequado.')
          )
        ),

        // PASSO 4: ANTECEDENTE
        step === 4 && React.createElement('div', null,
          React.createElement('h2', { style: title }, '5. Escolha seu Antecedente'),
          React.createElement('div', { style: grid2 },
            BACKGROUNDS.map(b => React.createElement('button', {
              key: b.key,
              onClick: () => setSelectedBg(b.key),
              style: selectedBg === b.key ? { ...sel, textAlign: 'left' } : { ...btn, textAlign: 'left' }
            },
              React.createElement('div', { style: { fontWeight: 'bold' } }, b.name),
              React.createElement('div', { style: { color: '#8b4f0f', fontSize: '12px', marginTop: '4px' } },
                'Perícias: ' + b.skills.join(', ')
              ),
              React.createElement('div', { style: { color: '#6b7280', fontSize: '11px', marginTop: '4px' } }, b.feature)
            ))
          )
        ),

        // PASSO 5: ATRIBUTOS
        step === 5 && React.createElement('div', null,
          React.createElement('h2', { style: title }, '6. Defina seus Atributos'),
          React.createElement('div', { style: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' } },
            ['standard', 'rolled'].map(m => React.createElement('button', {
              key: m,
              onClick: () => { setRollMethod(m); if (m === 'rolled') rollStats() },
              style: {
                padding: '10px 20px', borderRadius: '6px', border: '2px solid ' + (rollMethod === m ? '#d4891a' : '#4a2508'),
                background: rollMethod === m ? '#4a2508' : '#1a0c03', color: '#fdf8f0', cursor: 'pointer',
                fontFamily: 'Georgia, serif'
              }
            }, m === 'standard' ? '📊 Array Padrão (15,14,13,12,10,8)' : '🎲 Rolar 4d6 (tirar o menor)')),
            rollMethod === 'rolled' && React.createElement('button', {
              onClick: () => rollStats(),
              style: { padding: '10px 20px', borderRadius: '6px', border: '2px solid #8b4f0f', background: '#4a2508', color: '#fdf8f0', cursor: 'pointer', fontFamily: 'Georgia, serif' }
            }, '🔄 Rolar Novamente')
          ),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' } },
            ['str', 'dex', 'con', 'int', 'wis', 'cha'].map(ab => {
              const val = scores[ab]
              const mod = getMod(val)
              return React.createElement('div', { key: ab, style: { background: '#1a0c03', borderRadius: '8px', padding: '15px', border: '2px solid #4a2508' } },
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' } },
                  React.createElement('span', { style: { fontFamily: 'Georgia, serif', textTransform: 'uppercase', fontWeight: 'bold', fontSize: '1.1rem' } }, ab),
                  React.createElement('span', { style: { fontSize: '1.3rem', fontWeight: 'bold', color: mod >= 0 ? '#4ade80' : '#ef4444' } },
                    val + ' (' + (mod >= 0 ? '+' : '') + mod + ')'
                  )
                ),
                React.createElement('input', {
                  type: 'range', min: '3', max: '20', value: val,
                  onChange: e => setScores({ ...scores, [ab]: parseInt(e.target.value) }),
                  style: { width: '100%', accentColor: '#d4891a' }
                }),
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6b7280', marginTop: '4px' } },
                  React.createElement('span', null, '3'), React.createElement('span', null, '20')
                )
              )
            })
          )
        ),

        // PASSO 6: PERÍCIAS
        step === 6 && React.createElement('div', null,
          React.createElement('h2', { style: title }, '7. Escolha suas Perícias'),
          !cls ? React.createElement('p', { style: { color: '#ef4444' } }, '⚠️ Escolha uma classe primeiro.')
          : React.createElement('div', null,
            React.createElement('p', { style: { color: '#fdf8f0', marginBottom: '10px' } },
              'Escolha ' + cls.skillCount + ' perícia(s) para ' + cls.name + ':'
            ),
            React.createElement('p', { style: { color: '#8b4f0f', fontSize: '14px', marginBottom: '15px' } },
              'Selecionadas: ' + selectedSkills.length + '/' + cls.skillCount
            ),
            React.createElement('div', { style: grid3 },
              cls.skills.map(skill => React.createElement('button', {
                key: skill,
                onClick: () => toggleSkill(skill),
                style: {
                  ...(selectedSkills.includes(skill) ? sel : btn),
                  textAlign: 'center',
                  opacity: !selectedSkills.includes(skill) && selectedSkills.length >= cls.skillCount ? 0.5 : 1
                }
              }, skill))
            ),
            bg && React.createElement('div', { style: { marginTop: '20px', padding: '15px', background: '#1a0c03', borderRadius: '8px', border: '1px solid #4a2508' } },
              React.createElement('p', { style: { color: '#d4891a', fontFamily: 'Georgia, serif', margin: '0 0 8px 0' } }, '📜 Perícias do Antecedente (' + bg.name + '):'),
              React.createElement('p', { style: { color: '#8b4f0f', margin: 0 } }, bg.skills.join(', '))
            )
          )
        ),

        // PASSO 7: DETALHES FINAIS
        step === 7 && React.createElement('div', null,
          React.createElement('h2', { style: title }, '8. Detalhes Finais'),
          React.createElement('div', { style: { maxWidth: '500px' } },
            React.createElement('div', { style: { marginBottom: '20px' } },
              React.createElement('label', { style: { display: 'block', color: '#8b4f0f', marginBottom: '8px', fontFamily: 'Georgia, serif' } }, 'Nome do Personagem'),
              React.createElement('input', {
                type: 'text', value: name, onChange: e => setName(e.target.value),
                placeholder: 'Ex: Drizzt Do\'Urden, Elminster...',
                style: { width: '100%', padding: '14px', background: '#1a0c03', border: '2px solid #4a2508', borderRadius: '8px', color: '#fdf8f0', fontSize: '16px', boxSizing: 'border-box' }
              })
            ),
            React.createElement('div', { style: { marginBottom: '20px' } },
              React.createElement('label', { style: { display: 'block', color: '#8b4f0f', marginBottom: '8px', fontFamily: 'Georgia, serif' } }, 'Alinhamento'),
              React.createElement('select', {
                value: alignment, onChange: e => setAlignment(e.target.value),
                style: { width: '100%', padding: '14px', background: '#1a0c03', border: '2px solid #4a2508', borderRadius: '8px', color: '#fdf8f0', fontSize: '16px' }
              }, ALIGNMENTS.map(a => React.createElement('option', { key: a.value, value: a.value }, a.name)))
            )
          )
        ),

        // PASSO 8: REVISÃO
        step === 8 && React.createElement('div', null,
          React.createElement('h2', { style: title }, '📜 Pergaminho do Personagem'),
          React.createElement('div', { style: { background: '#1a0c03', borderRadius: '8px', padding: '25px', border: '2px solid #8b4f0f', marginBottom: '20px' } },
            React.createElement('h3', { style: { color: '#d4891a', fontFamily: 'Georgia, serif', fontSize: '1.8rem', margin: '0 0 10px 0' } }, name || '(sem nome)'),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '15px' } },
              React.createElement('p', { style: { margin: 0, color: '#fdf8f0' } }, React.createElement('strong', { style: { color: '#8b4f0f' } }, 'Raça: '), race?.name + (selectedSubrace ? ' (' + SUBRACES[selectedSubrace]?.name + ')' : '')),
              React.createElement('p', { style: { margin: 0, color: '#fdf8f0' } }, React.createElement('strong', { style: { color: '#8b4f0f' } }, 'Classe: '), cls?.name + (selectedSubclass ? ' - ' + selectedSubclass : '')),
              React.createElement('p', { style: { margin: 0, color: '#fdf8f0' } }, React.createElement('strong', { style: { color: '#8b4f0f' } }, 'Antecedente: '), bg?.name),
              React.createElement('p', { style: { margin: 0, color: '#fdf8f0' } }, React.createElement('strong', { style: { color: '#8b4f0f' } }, 'Alinhamento: '), ALIGNMENTS.find(a => a.value === alignment)?.name),
              React.createElement('p', { style: { margin: 0, color: '#fdf8f0' } }, React.createElement('strong', { style: { color: '#8b4f0f' } }, 'HP: '), (cls?.hd || 8) + getMod(applyBonuses().con)),
              React.createElement('p', { style: { margin: 0, color: '#fdf8f0' } }, React.createElement('strong', { style: { color: '#8b4f0f' } }, 'CA: '), 10 + getMod(applyBonuses().dex)),
              React.createElement('p', { style: { margin: 0, color: '#fdf8f0' } }, React.createElement('strong', { style: { color: '#8b4f0f' } }, 'Velocidade: '), (race?.speed || 30) + ' pés'),
              React.createElement('p', { style: { margin: 0, color: '#fdf8f0' } }, React.createElement('strong', { style: { color: '#8b4f0f' } }, 'Perícias: '), selectedSkills.length + ' selecionadas')
            ),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginTop: '15px' } },
              Object.entries(applyBonuses()).map(([k, v]) => React.createElement('div', { key: k, style: { textAlign: 'center', background: '#2d1605', padding: '8px', borderRadius: '5px' } },
                React.createElement('div', { style: { color: '#8b4f0f', fontSize: '11px', textTransform: 'uppercase' } }, k),
                React.createElement('div', { style: { color: '#fdf8f0', fontWeight: 'bold', fontSize: '1.1rem' } }, v),
                React.createElement('div', { style: { color: getMod(v) >= 0 ? '#4ade80' : '#ef4444', fontSize: '12px' } }, (getMod(v) >= 0 ? '+' : '') + getMod(v))
              ))
            )
          ),
          React.createElement('button', {
            onClick: handleCreate,
            disabled: saving || !name,
            style: {
              width: '100%', padding: '18px', background: '#8b4f0f', color: '#fdf8f0',
              border: 'none', borderBottom: '4px solid #4a2508', borderRadius: '8px',
              fontSize: '20px', cursor: 'pointer', fontFamily: 'Georgia, serif',
              opacity: saving || !name ? 0.5 : 1
            }
          }, '⚔️ ' + (saving ? 'Forjando Destino...' : 'FORJAR DESTINO!'))
        )
      ),

      // Navegação inferior
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: '10px' } },
        React.createElement('button', {
          onClick: () => setStep(s => s - 1),
          disabled: step === 0,
          style: {
            padding: '12px 30px', background: '#2d1605', color: '#fdf8f0',
            border: '1px solid #4a2508', borderRadius: '6px', cursor: 'pointer',
            fontFamily: 'Georgia, serif', fontSize: '16px', opacity: step === 0 ? 0.3 : 1
          }
        }, '⬅ Voltar'),
        step < 8 && React.createElement('button', {
          onClick: () => setStep(s => s + 1),
          style: {
            padding: '12px 30px', background: '#8b4f0f', color: '#fdf8f0',
            border: 'none', borderBottom: '3px solid #4a2508', borderRadius: '6px',
            cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '16px'
          }
        }, 'Próximo ➡')
      )
    )
  )
}
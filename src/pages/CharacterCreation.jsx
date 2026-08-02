import React, { useState, useMemo } from 'react'
import { supabase } from '../lib/supabase'

// ============ DADOS COMPLETOS ============

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
  'Arquearia (+2 ataques à distância)',
  'Combate com Armas Grandes (rerrola 1 e 2)',
  'Defesa (+1 CA com armadura)',
  'Duelo (+2 dano com uma arma)',
  'Duas Armas (+mod. dano na segunda)',
  'Proteção (desvantagem em aliado)'
]

const RACES = {
  human: { name: 'Humano', bonuses: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 }, speed: 30, size: 'Médio', languages: ['Comum'], traits: ['Versátil'], subraces: [], needsAncestry: false },
  elf: { name: 'Elfo', bonuses: { dex: 2 }, speed: 30, size: 'Médio', languages: ['Comum','Élfico'], traits: ['Visão no Escuro 60pés','Sentidos Aguçados','Transe'], subraces: ['high_elf','wood_elf','dark_elf'], needsAncestry: false },
  dwarf: { name: 'Anão', bonuses: { con: 2 }, speed: 25, size: 'Médio', languages: ['Comum','Anão'], traits: ['Visão no Escuro 60pés','Resiliência Anã'], subraces: ['hill_dwarf','mountain_dwarf'], needsAncestry: false },
  halfling: { name: 'Halfling', bonuses: { dex: 2 }, speed: 25, size: 'Pequeno', languages: ['Comum','Halfling'], traits: ['Sortudo','Corajoso'], subraces: ['lightfoot','stout'], needsAncestry: false },
  dragonborn: { name: 'Draconato', bonuses: { str: 2, cha: 1 }, speed: 30, size: 'Médio', languages: ['Comum','Dracônico'], traits: ['Arma de Sopro','Resistência a Dano'], subraces: [], needsAncestry: true },
  gnome: { name: 'Gnomo', bonuses: { int: 2 }, speed: 25, size: 'Pequeno', languages: ['Comum','Gnômico'], traits: ['Visão no Escuro 60pés','Esperteza Gnômica'], subraces: ['forest_gnome','rock_gnome'], needsAncestry: false },
  half_elf: { name: 'Meio-Elfo', bonuses: { cha: 2, dex: 1, con: 1 }, speed: 30, size: 'Médio', languages: ['Comum','Élfico'], traits: ['Visão no Escuro 60pés','Versatilidade'], subraces: [], needsAncestry: false },
  half_orc: { name: 'Meio-Orc', bonuses: { str: 2, con: 1 }, speed: 30, size: 'Médio', languages: ['Comum','Orc'], traits: ['Visão no Escuro 60pés','Resistência Implacável','Ataques Selvagens'], subraces: [], needsAncestry: false },
  tiefling: { name: 'Tiefling', bonuses: { int: 1, cha: 2 }, speed: 30, size: 'Médio', languages: ['Comum','Infernal'], traits: ['Visão no Escuro 60pés','Resistência Infernal','Magia Infernal'], subraces: [], needsAncestry: false }
}

const SUBRACES = {
  high_elf: { name: 'Alto Elfo', bonuses: { int: 1 }, traits: ['Truque de mago'] },
  wood_elf: { name: 'Elfo da Floresta', bonuses: { wis: 1 }, speed: 5, traits: ['Máscara da Natureza'] },
  dark_elf: { name: 'Drow', bonuses: { cha: 1 }, traits: ['Visão no Escuro 120pés','Magia Drow'] },
  hill_dwarf: { name: 'Anão da Colina', bonuses: { wis: 1 }, traits: ['Robustez Anã'] },
  mountain_dwarf: { name: 'Anão da Montanha', bonuses: { str: 2 }, traits: ['Armadura Anã'] },
  lightfoot: { name: 'Pé-Leve', bonuses: { cha: 1 }, traits: ['Furtividade Natural'] },
  stout: { name: 'Robusto', bonuses: { con: 1 }, traits: ['Resiliência Robusta'] },
  forest_gnome: { name: 'Gnomo da Floresta', bonuses: { dex: 1 }, traits: ['Ilusionista Nato'] },
  rock_gnome: { name: 'Gnomo das Rochas', bonuses: { con: 1 }, traits: ['Engenhoca'] }
}

const CLASSES = {
  barbarian: { name: 'Bárbaro', hd: 12, primary: 'str', saves: ['str','con'], skills: ['Adestrar Animais','Atletismo','Intimidação','Natureza','Percepção','Sobrevivência'], skillCount: 2, subclasses: ['Berserker','Guerreiro Totêmico','Guardião Ancestral','Arauto da Tempestade','Zelote','Besta','Magia Selvagem'],
    featuresByLevel: { 1: ['Fúria (2)','Defesa sem Armadura'], 2: ['Ataque Imprudente','Sentido de Perigo'], 3: ['Caminho Primitivo'], 4: ['ASI'], 5: ['Ataque Extra','Movimento Rápido'], 6: ['Habilidade de Caminho'], 7: ['Instinto Selvagem'], 8: ['ASI'], 9: ['Crítico Brutal (1)'], 10: ['Habilidade de Caminho'], 11: ['Fúria Implacável'], 12: ['ASI'], 13: ['Crítico Brutal (2)'], 14: ['Habilidade de Caminho'], 15: ['Fúria Persistente'], 16: ['ASI'], 17: ['Crítico Brutal (3)'], 18: ['Força Indomável'], 19: ['ASI'], 20: ['Campeão Primitivo'] }
  },
  fighter: { name: 'Guerreiro', hd: 10, primary: 'str', saves: ['str','con'], skills: ['Acrobacia','Adestrar Animais','Atletismo','História','Intimidação','Intuição','Percepção','Sobrevivência'], skillCount: 2, subclasses: ['Campeão','Mestre de Batalha','Cavaleiro Arcano'],
    featuresByLevel: { 1: ['Estilo de Luta','Retomar Fôlego'], 2: ['Surto de Ação'], 3: ['Arquétipo Marcial'], 4: ['ASI'], 5: ['Ataque Extra'], 6: ['ASI'], 7: ['Habilidade de Arquétipo'], 8: ['ASI'], 9: ['Indomável'], 10: ['Habilidade de Arquétipo'], 11: ['Ataque Extra (2)'], 12: ['ASI'], 13: ['Indomável (2)'], 14: ['ASI'], 15: ['Habilidade de Arquétipo'], 16: ['ASI'], 17: ['Surto de Ação (2)'], 18: ['Habilidade de Arquétipo'], 19: ['ASI'], 20: ['Ataque Extra (3)'] }
  },
  wizard: { name: 'Mago', hd: 6, primary: 'int', saves: ['int','wis'], skills: ['Arcanismo','História','Intuição','Investigação','Medicina','Religião'], skillCount: 2, subclasses: ['Evocação','Ilusão','Necromancia','Abjuração','Conjuração','Adivinhação','Encantamento','Transmutação'],
    featuresByLevel: { 1: ['Conjuração','Recuperação Arcana'], 2: ['Tradição Arcana'], 3: ['-'], 4: ['ASI'], 5: ['-'], 6: ['Habilidade de Tradição'], 7: ['-'], 8: ['ASI'], 9: ['-'], 10: ['Habilidade de Tradição'], 11: ['-'], 12: ['ASI'], 13: ['-'], 14: ['Habilidade de Tradição'], 15: ['-'], 16: ['ASI'], 17: ['-'], 18: ['Maestria em Magia'], 19: ['ASI'], 20: ['Magia de Assinatura'] }
  },
  rogue: { name: 'Ladino', hd: 8, primary: 'dex', saves: ['dex','int'], skills: ['Acrobacia','Atletismo','Atuação','Enganação','Furtividade','Intimidação','Intuição','Investigação','Percepção','Persuasão','Prestidigitação'], skillCount: 4, subclasses: ['Ladrão','Assassino','Trapaceiro Arcano'],
    featuresByLevel: { 1: ['Especialização (2)','Ataque Furtivo 1d6'], 2: ['Ação Ardilosa'], 3: ['Arquétipo','Ataque Furtivo 2d6'], 4: ['ASI'], 5: ['Esquiva Sobrenatural','Ataque Furtivo 3d6'], 6: ['Especialização'], 7: ['Evasão','Ataque Furtivo 4d6'], 8: ['ASI'], 9: ['Habilidade Arquétipo','Ataque Furtivo 5d6'], 10: ['ASI'], 11: ['Talento Confiável','Ataque Furtivo 6d6'], 12: ['ASI'], 13: ['Habilidade Arquétipo','Ataque Furtivo 7d6'], 14: ['Sentido Cego'], 15: ['Mente Escorregadia','Ataque Furtivo 8d6'], 16: ['ASI'], 17: ['Habilidade Arquétipo','Ataque Furtivo 9d6'], 18: ['Elusivo'], 19: ['ASI','Ataque Furtivo 10d6'], 20: ['Golpe de Sorte'] }
  },
  cleric: { name: 'Clérigo', hd: 8, primary: 'wis', saves: ['wis','cha'], skills: ['História','Intuição','Medicina','Persuasão','Religião'], skillCount: 2, subclasses: ['Vida','Luz','Guerra','Conhecimento','Natureza','Tempestade','Trapaça'],
    featuresByLevel: { 1: ['Conjuração','Domínio Divino'], 2: ['Canalizar Divindade'], 3: ['-'], 4: ['ASI'], 5: ['Destruir Mortos-Vivos'], 6: ['Canalizar (2)'], 7: ['-'], 8: ['ASI','Destruir Mortos-Vivos+'], 9: ['-'], 10: ['Intervenção Divina'], 11: ['Destruir Mortos-Vivos++'], 12: ['ASI'], 13: ['-'], 14: ['Destruir Mortos-Vivos+++'], 15: ['-'], 16: ['ASI'], 17: ['Destruir Mortos-Vivos++++'], 18: ['Canalizar (3)'], 19: ['ASI'], 20: ['Intervenção Aprimorada'] }
  }
}

const SIMPLE_CLASS = { bard:8, druid:8, monk:8, paladin:10, ranger:10, sorcerer:6, warlock:8 }
Object.keys(SIMPLE_CLASS).forEach(k => {
  const hd = SIMPLE_CLASS[k]
  CLASSES[k] = { name: k.charAt(0).toUpperCase()+k.slice(1), hd, primary: 'str', saves: ['str','con'], skills: ['Atletismo','Percepção'], skillCount: 2, subclasses: ['Padrão'], featuresByLevel: {} }
  for (let lv=1; lv<=20; lv++) CLASSES[k].featuresByLevel[lv] = lv%4===0?['ASI']:['Habilidade Nv.'+lv]
})

const BACKGROUNDS = ['acolyte','criminal','folk_hero','noble','sage','soldier','entertainer','urchin','outlander','sailor','hermit','charlatan']
const ALIGNMENTS = ['lawful_good','neutral_good','chaotic_good','lawful_neutral','true_neutral','chaotic_neutral','lawful_evil','neutral_evil','chaotic_evil']
const ALIGN_NAMES = { lawful_good:'Leal e Bom', neutral_good:'Neutro e Bom', chaotic_good:'Caótico e Bom', lawful_neutral:'Leal e Neutro', true_neutral:'Neutro', chaotic_neutral:'Caótico e Neutro', lawful_evil:'Leal e Mau', neutral_evil:'Neutro e Mau', chaotic_evil:'Caótico e Mau' }

const FEATS = [
  'Alerta (+5 iniciativa)','Atleta (+1 For/Dex)','Ator (+1 Car)','Cruzado de Magia (+1 Con/Int/Sab/Car, magias)',
  'Durão (+2 HP/nível)','Elemental (+1 em atributo, resistência)','Líder Inspirador (HP temp aliados)',
  'Lutador de Taverna (+1 For/Con)','Mestre de Armas Grandes','Mestre de Escudo','Móvel (+3m movimento)',
  'Observador (+1 Int/Sab, ler lábios)','Sentinela (ataque de oportunidade)','Sortudo (3 pontos de sorte)'
]

function getMod(v) { return Math.floor((v-10)/2) }
function getPB(lv) { return Math.floor((lv-1)/4)+1 }

export default function CharacterCreation({ user, navigate, campaignId }) {
  const [step, setStep] = useState(0)
  const [selRace, setSelRace] = useState(null)
  const [selSubrace, setSelSubrace] = useState(null)
  const [selDraconic, setSelDraconic] = useState(null)
  const [selClass, setSelClass] = useState(null)
  const [selSubclass, setSelSubclass] = useState(null)
  const [selBg, setSelBg] = useState(null)
  const [scores, setScores] = useState({ str:15, dex:14, con:13, int:12, wis:10, cha:8 })
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

  // Passos dinâmicos baseados no nível
  const dynamicSteps = useMemo(() => {
    const steps = ['Raça']
    if (race?.subraces?.length > 0) steps.push('Sub-Raça')
    if (race?.needsAncestry) steps.push('Ancestralidade')
    steps.push('Classe')
    steps.push('Subclasse')
    steps.push('Nível')
    if (level >= 1 && cls?.name === 'Guerreiro') steps.push('Estilo de Luta')
    steps.push('Antecedente')
    steps.push('Atributos')
    steps.push('Perícias')
    if (level >= 1 && cls?.name === 'Ladino') steps.push('Especialização')
    if (level >= 4) steps.push('Talentos (Feats)')
    steps.push('Detalhes')
    steps.push('Revisão')
    return steps
  }, [race, cls, level])

  const stepName = dynamicSteps[step] || ''

  function rollStats() {
    const r = {}
    ;['str','dex','con','int','wis','cha'].forEach(a => {
      const rolls = Array.from({length:4},()=>Math.floor(Math.random()*6)+1).sort((a,b)=>b-a)
      r[a] = rolls[0]+rolls[1]+rolls[2]
    })
    setScores(r)
  }

  function applyBonuses(sc = scores) {
    let ns = {...sc}
    if (race?.bonuses) for (const [k,v] of Object.entries(race.bonuses)) ns[k]=(ns[k]||10)+v
    if (selSubrace && SUBRACES[selSubrace]?.bonuses) for (const [k,v] of Object.entries(SUBRACES[selSubrace].bonuses)) ns[k]=(ns[k]||10)+v
    return ns
  }

  function toggleSkill(s) {
    setSelSkills(p => p.includes(s) ? p.filter(x=>x!==s) : p.length < (cls?.skillCount||2) ? [...p,s] : p)
  }

  function toggleExpertise(s) {
    setSelExpertise(p => p.includes(s) ? p.filter(x=>x!==s) : p.length < 2 ? [...p,s] : p)
  }

  function toggleFeat(f) {
    setSelFeats(p => p.includes(f) ? p.filter(x=>x!==f) : p)
  }

  function getASIcount() {
    let c = 0
    const lvls = cls?.name==='Guerreiro' ? [4,6,8,12,14,16,19] : [4,8,12,16,19]
    lvls.forEach(l => { if (level >= l) c++ })
    return c
  }

  function calculateHP() {
    if (!cls) return 10
    const cm = getMod(applyBonuses().con)
    const avg = Math.floor(cls.hd/2)+1
    return cls.hd+cm+(avg+cm)*(level-1)
  }

  function getLevelFeatures() {
    if (!cls?.featuresByLevel) return []
    const f = []
    for (let lv=1; lv<=level; lv++) {
      const lf = cls.featuresByLevel[lv] || []
      lf.forEach(x => f.push('Nv.'+lv+': '+x))
    }
    return f
  }

  async function handleCreate() {
    setSaving(true)
    try {
      const finalScores = applyBonuses()
      const mods = {}
      for (const [k,v] of Object.entries(finalScores)) mods[k]=getMod(v)
      const hp = calculateHP()
      const pb = getPB(level)

      const { error } = await supabase.from('characters').insert({
        user_id: user.id, campaign_id: campaignId, name, level,
        race: race.name + (selSubrace?' ('+SUBRACES[selSubrace].name+')':'') + (selDraconic?' - '+selDraconic:''),
        class: cls.name, subclass: selSubclass || null, background: selBg || '',
        alignment, experience: level*500,
        ability_scores: finalScores,
        hit_points: { max:hp, current:hp, temporary:0 },
        hit_dice: { total:level, current:level, type:'d'+cls.hd },
        armor_class: 10+(mods.dex||0),
        speed: (race?.speed||30)+(selSubrace&&SUBRACES[selSubrace]?.speed||0),
        initiative: mods.dex||0, proficiency_bonus: pb,
        skill_proficiencies: selSkills, skill_expertise: selExpertise,
        skills: {},
        saving_throw_proficiencies: cls.saves,
        traits: [...(race?.traits||[]),...(selSubrace&&SUBRACES[selSubrace]?.traits||[])],
        features: getLevelFeatures().map(f=>({name:f,description:''})),
        languages: [...(race?.languages||[]),'Comum'],
        currency: { cp:0,sp:0,ep:0,gp:10+(level-1)*5,pp:0 },
        weapons: [], spells: [],
        equipment: selBg?[selBg]:[],
        draconic_ancestry: selDraconic || null,
        fighting_style: selFighting || null,
        chosen_feats: selFeats
      })
      if (error) throw error
      navigate('campaign',{campaignId})
    } catch(err) {
      alert('Erro: '+err.message)
    } finally { setSaving(false) }
  }

  const pg = { minHeight:'100vh', background:'#1a0c03', color:'#fdf8f0' }
  const hd = { background:'#2d1605', borderBottom:'4px solid #8b4f0f', padding:'15px 20px' }
  const mn = { maxWidth:1100, margin:'0 auto', padding:20 }
  const box = { background:'#2d1605', borderRadius:12, border:'2px solid #4a2508', padding:30, marginBottom:20 }
  const btn = { padding:'14px 20px', background:'#1a0c03', border:'2px solid #4a2508', borderRadius:8, cursor:'pointer', color:'#fdf8f0', textAlign:'left', fontFamily:'Georgia,serif' }
  const sel = { ...btn, background:'#4a2508', border:'2px solid #d4891a' }
  const grid2 = { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12, marginTop:15 }
  const grid3 = { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:10, marginTop:15 }
  const title = { color:'#d4891a', fontFamily:'Georgia,serif', fontSize:'1.5rem', margin:'0 0 20px 0' }
  const inputS = { width:'100%', padding:14, background:'#1a0c03', border:'2px solid #4a2508', borderRadius:8, color:'#fdf8f0', fontSize:16, boxSizing:'border-box' }

  return React.createElement('div',{style:pg},
    React.createElement('div',{style:hd},
      React.createElement('div',{style:{maxWidth:1100,margin:'0 auto'}},
        React.createElement('h1',{style:{color:'#d4891a',fontFamily:'Georgia,serif',fontSize:'1.8rem',margin:'0 0 12px 0'}},'⚒️ Criação - Nível '+level),
        React.createElement('div',{style:{display:'flex',gap:4,flexWrap:'wrap'}},
          dynamicSteps.map((s,i)=>React.createElement('button',{key:s,onClick:()=>setStep(i),style:{padding:'6px 10px',borderRadius:5,border:'none',cursor:'pointer',background:i===step?'#d4891a':i<step?'#4a2508':'#2d1605',color:i===step?'#1a0c03':'#8b4f0f',fontFamily:'Georgia,serif',fontSize:11}},(i+1)+'.'))
        )
      )
    ),
    React.createElement('div',{style:mn},
      React.createElement('div',{style:box},
        
        // RAÇA
        stepName==='Raça'&&React.createElement('div',null,
          React.createElement('h2',{style:title},'1. Escolha sua Raça'),
          React.createElement('div',{style:grid2},Object.entries(RACES).map(([k,r])=>React.createElement('button',{key:k,onClick:()=>{setSelRace(k);setSelSubrace(null);setSelDraconic(null)},style:selRace===k?{...sel,textAlign:'left'}:{...btn,textAlign:'left'}},
            React.createElement('div',{style:{fontWeight:'bold',fontSize:'1.1rem'}},r.name),
            React.createElement('div',{style:{color:'#8b4f0f',fontSize:13}},r.size+' • '+r.speed+' pés'),
            React.createElement('div',{style:{color:'#4ade80',fontSize:12,marginTop:4}},Object.entries(r.bonuses).map(([a,b])=>'+'+b+' '+a.toUpperCase()).join(', '))
          )))
        ),

        // SUB-RAÇA (dinâmico)
        stepName==='Sub-Raça'&&React.createElement('div',null,
          React.createElement('h2',{style:title},'2. Sub-Raça'),
          React.createElement('div',{style:grid2},race.subraces.map(sk=>SUBRACES[sk]&&React.createElement('button',{key:sk,onClick:()=>setSelSubrace(sk),style:selSubrace===sk?sel:btn},
            React.createElement('div',{style:{fontWeight:'bold'}},SUBRACES[sk].name),
            SUBRACES[sk].bonuses&&React.createElement('div',{style:{color:'#4ade80',fontSize:12}},Object.entries(SUBRACES[sk].bonuses).map(([a,b])=>'+'+b+' '+a.toUpperCase()).join(', '))
          )))
        ),

        // ANCESTRALIDADE DRACÔNICA (dinâmico)
        stepName==='Ancestralidade'&&React.createElement('div',null,
          React.createElement('h2',{style:title},'3. Ancestralidade Dracônica'),
          React.createElement('p',{style:{color:'#8b4f0f',marginBottom:15}},'Escolha seu ancestral dragão:'),
          React.createElement('div',{style:grid2},DRACONIC_ANCESTRIES.map(d=>React.createElement('button',{key:d.name,onClick:()=>setSelDraconic(d.name),style:selDraconic===d.name?{...sel,textAlign:'left'}:{...btn,textAlign:'left'}},
            React.createElement('div',{style:{fontWeight:'bold',color:d.name==='Ouro'||d.name==='Vermelho'?'#ef4444':d.name==='Prata'||d.name==='Branco'?'#3b82f6':d.name==='Bronze'?'#eab308':'#22c55e'}},d.name),
            React.createElement('div',{style:{color:'#8b4f0f',fontSize:12}},d.damage+' • '+d.breath)
          )))
        ),

        // CLASSE
        stepName==='Classe'&&React.createElement('div',null,
          React.createElement('h2',{style:title},'Classe'),
          React.createElement('div',{style:grid3},Object.entries(CLASSES).map(([k,c])=>React.createElement('button',{key:k,onClick:()=>{setSelClass(k);setSelSubclass(null);setSelSkills([]);setSelExpertise([]);setSelFighting(null)},style:selClass===k?{...sel,textAlign:'center'}:{...btn,textAlign:'center'}},
            React.createElement('div',{style:{fontWeight:'bold'}},c.name),React.createElement('div',{style:{color:'#8b4f0f',fontSize:12}},'d'+c.hd)
          )))
        ),

        // SUBCLASSE
        stepName==='Subclasse'&&React.createElement('div',null,
          React.createElement('h2',{style:title},'Subclasse'),!cls?React.createElement('p',{style:{color:'#ef4444'}},'⚠️ Escolha uma classe.'):
          React.createElement('div',{style:grid2},cls.subclasses.map(sc=>React.createElement('button',{key:sc,onClick:()=>setSelSubclass(sc===selSubclass?null:sc),style:selSubclass===sc?sel:btn},sc)))
        ),

        // NÍVEL
        stepName==='Nível'&&React.createElement('div',null,
          React.createElement('h2',{style:title},'Nível do Personagem'),
          React.createElement('div',{style:{display:'flex',alignItems:'center',gap:15,justifyContent:'center',marginBottom:20}},
            React.createElement('button',{onClick:()=>setLevel(l=>Math.max(1,l-1)),style:{...btn,fontSize:'2rem',padding:'10px 25px',textAlign:'center'}},'−'),
            React.createElement('span',{style:{fontSize:'3rem',fontWeight:'bold',color:'#d4891a',minWidth:80,textAlign:'center'}},level),
            React.createElement('button',{onClick:()=>setLevel(l=>Math.min(20,l+1)),style:{...btn,fontSize:'2rem',padding:'10px 25px',textAlign:'center'}},'+')
          ),
          React.createElement('div',{style:{background:'#1a0c03',borderRadius:8,padding:20,marginBottom:15}},
            React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}},
              React.createElement('p',{style:{color:'#8b4f0f',margin:0}},'⭐ PB: +'+getPB(level)),
              React.createElement('p',{style:{color:'#8b4f0f',margin:0}},'❤️ HP: ~'+calculateHP()),
              React.createElement('p',{style:{color:'#8b4f0f',margin:0}},'📈 ASIs: '+getASIcount()),
              React.createElement('p',{style:{color:'#8b4f0f',margin:0}},'🎲 Dados: '+level+'d'+(cls?.hd||8))
            )
          ),
          React.createElement('details',{style:{color:'#8b4f0f'}},React.createElement('summary',{style:{cursor:'pointer',fontFamily:'Georgia,serif'}},'📜 '+getLevelFeatures().length+' habilidades'),
            getLevelFeatures().map((f,i)=>React.createElement('p',{key:i,style:{color:'#fdf8f0',fontSize:12,margin:'2px 0'}},'• '+f)))
        ),

        // ESTILO DE LUTA (Guerreiro nível 1+)
        stepName==='Estilo de Luta'&&React.createElement('div',null,
          React.createElement('h2',{style:title},'Estilo de Luta'),
          React.createElement('p',{style:{color:'#8b4f0f',marginBottom:15}},'Guerreiros escolhem 1 estilo de luta:'),
          React.createElement('div',{style:grid2},FIGHTING_STYLES.map(fs=>React.createElement('button',{key:fs,onClick:()=>setSelFighting(fs===selFighting?null:fs),style:selFighting===fs?{...sel,textAlign:'left'}:{...btn,textAlign:'left'}},fs)))
        ),

        // ANTECEDENTE
        stepName==='Antecedente'&&React.createElement('div',null,
          React.createElement('h2',{style:title},'Antecedente'),
          React.createElement('div',{style:grid3},BACKGROUNDS.map(b=>React.createElement('button',{key:b,onClick:()=>setSelBg(b),style:selBg===b?{...sel,textTransform:'capitalize'}:{...btn,textTransform:'capitalize'}},b.replace(/_/g,' '))))
        ),

        // ATRIBUTOS
        stepName==='Atributos'&&React.createElement('div',null,
          React.createElement('h2',{style:title},'Atributos (ASIs disponíveis: '+getASIcount()+')'),
          React.createElement('div',{style:{display:'flex',gap:10,marginBottom:20}},
            React.createElement('button',{onClick:()=>setScores({str:15,dex:14,con:13,int:12,wis:10,cha:8}),style:{...btn,background:'#4a2508',textAlign:'center'}},'📊 Array Padrão'),
            React.createElement('button',{onClick:rollStats,style:{...btn,background:'#4a2508',textAlign:'center'}},'🎲 Rolar 4d6')
          ),
          React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:15}},
            ['str','dex','con','int','wis','cha'].map(ab=>{const v=scores[ab];const m=getMod(v);return React.createElement('div',{key:ab,style:{background:'#1a0c03',borderRadius:8,padding:15,border:'2px solid #4a2508'}},
              React.createElement('div',{style:{display:'flex',justifyContent:'space-between',marginBottom:10}},React.createElement('span',{style:{fontFamily:'Georgia,serif',textTransform:'uppercase',fontWeight:'bold'}},ab),React.createElement('span',{style:{fontWeight:'bold',color:m>=0?'#4ade80':'#ef4444'}},v+' ('+(m>=0?'+':'')+m+')')),
              React.createElement('input',{type:'range',min:3,max:20,value:v,onChange:e=>setScores({...scores,[ab]:parseInt(e.target.value)}),style:{width:'100%',accentColor:'#d4891a'}})
            )})
          )
        ),

        // PERÍCIAS
        stepName==='Perícias'&&React.createElement('div',null,
          React.createElement('h2',{style:title},'Perícias ('+selSkills.length+'/'+(cls?.skillCount||0)+')'),
          !cls?React.createElement('p',{style:{color:'#ef4444'}},'⚠️ Escolha uma classe.'):
          React.createElement('div',{style:grid3},cls.skills.map(s=>React.createElement('button',{key:s,onClick:()=>toggleSkill(s),style:{...(selSkills.includes(s)?sel:btn),textAlign:'center',opacity:!selSkills.includes(s)&&selSkills.length>=(cls.skillCount||2)?0.4:1}},s)))
        ),

        // ESPECIALIZAÇÃO (Ladino)
        stepName==='Especialização'&&React.createElement('div',null,
          React.createElement('h2',{style:title},'Especialização (2 perícias)'),
          React.createElement('p',{style:{color:'#8b4f0f',marginBottom:15}},'Escolha 2 perícias para receber o dobro do bônus de proficiência:'),
          React.createElement('div',{style:grid3},selSkills.map(s=>React.createElement('button',{key:s,onClick:()=>toggleExpertise(s),style:{...(selExpertise.includes(s)?{...sel,textAlign:'center'}:{...btn,textAlign:'center'}),opacity:!selExpertise.includes(s)&&selExpertise.length>=2?0.4:1}},s+' ⭐')))
        ),

        // TALENTOS (nível 4+)
        stepName==='Talentos (Feats)'&&React.createElement('div',null,
          React.createElement('h2',{style:title},'Talentos (Feats) - ASIs: '+getASIcount()),
          React.createElement('p',{style:{color:'#8b4f0f',marginBottom:15}},'Você pode trocar cada ASI por um talento. Escolha seus talentos:'),
          React.createElement('div',{style:grid2},FEATS.map(f=>React.createElement('button',{key:f,onClick:()=>toggleFeat(f),style:selFeats.includes(f)?{...sel,textAlign:'left'}:{...btn,textAlign:'left'}},f)))
        ),

        // DETALHES
        stepName==='Detalhes'&&React.createElement('div',null,
          React.createElement('h2',{style:title},'Detalhes Finais'),
          React.createElement('div',{style:{maxWidth:500}},
            React.createElement('label',{style:{display:'block',color:'#8b4f0f',marginBottom:8}},'Nome'),
            React.createElement('input',{value:name,onChange:e=>setName(e.target.value),placeholder:'Nome...',style:{...inputS,marginBottom:20}}),
            React.createElement('label',{style:{display:'block',color:'#8b4f0f',marginBottom:8}},'Alinhamento'),
            React.createElement('select',{value:alignment,onChange:e=>setAlignment(e.target.value),style:inputS},
              ALIGNMENTS.map(a=>React.createElement('option',{key:a,value:a},ALIGN_NAMES[a]||a)))
          )
        ),

        // REVISÃO
        stepName==='Revisão'&&React.createElement('div',null,
          React.createElement('h2',{style:title},'📜 Pergaminho Final'),
          React.createElement('div',{style:{background:'#1a0c03',borderRadius:8,padding:25,border:'2px solid #8b4f0f',marginBottom:20}},
            React.createElement('h3',{style:{color:'#d4891a',fontFamily:'Georgia,serif',fontSize:'1.8rem',margin:'0 0 15px 0'}},name||'(sem nome)'),
            React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:15}},
              React.createElement('p',{style:{margin:0}},React.createElement('strong',{style:{color:'#8b4f0f'}},'Raça: '),race?.name+(selSubrace?' ('+SUBRACES[selSubrace]?.name+')':'')+(selDraconic?' - '+selDraconic:'')),
              React.createElement('p',{style:{margin:0}},React.createElement('strong',{style:{color:'#8b4f0f'}},'Classe: '),cls?.name+(selSubclass?' - '+selSubclass:'')),
              React.createElement('p',{style:{margin:0}},React.createElement('strong',{style:{color:'#8b4f0f'}},'Nível: '),level+' (PB +'+getPB(level)+')'),
              React.createElement('p',{style:{margin:0}},React.createElement('strong',{style:{color:'#8b4f0f'}},'HP: '),calculateHP()),
              React.createElement('p',{style:{margin:0}},React.createElement('strong',{style:{color:'#8b4f0f'}},'CA: '),10+getMod(applyBonuses().dex)),
              React.createElement('p',{style:{margin:0}},React.createElement('strong',{style:{color:'#8b4f0f'}},'ASIs: '),getASIcount()),
              selFighting&&React.createElement('p',{style:{margin:0}},React.createElement('strong',{style:{color:'#8b4f0f'}},'Estilo: '),selFighting?.split('(')[0]),
              React.createElement('p',{style:{margin:0}},React.createElement('strong',{style:{color:'#8b4f0f'}},'Perícias: '),selSkills.length+(selExpertise.length>0?' ('+selExpertise.length+' especializadas)':''))
            ),
            React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:8,marginBottom:15}},
              Object.entries(applyBonuses()).map(([k,v])=>React.createElement('div',{key:k,style:{textAlign:'center',background:'#2d1605',padding:8,borderRadius:5}},React.createElement('div',{style:{color:'#8b4f0f',fontSize:11,textTransform:'uppercase'}},k),React.createElement('div',{style:{color:'#fdf8f0',fontWeight:'bold'}},v)))
            ),
            selFeats.length>0&&React.createElement('p',{style:{color:'#f59e0b'}},'Talentos: '+selFeats.join(', '))
          ),
          React.createElement('button',{onClick:handleCreate,disabled:saving||!name,style:{width:'100%',padding:18,background:'#8b4f0f',color:'#fdf8f0',border:'none',borderBottom:'4px solid #4a2508',borderRadius:8,fontSize:20,cursor:'pointer',fontFamily:'Georgia,serif',opacity:saving||!name?0.5:1}},'⚔️ '+(saving?'Forjando...':'FORJAR DESTINO!'))
        )
      ),
      React.createElement('div',{style:{display:'flex',justifyContent:'space-between',marginTop:10}},
        React.createElement('button',{onClick:()=>setStep(s=>s-1),disabled:step===0,style:{padding:'12px 30px',background:'#2d1605',color:'#fdf8f0',border:'1px solid #4a2508',borderRadius:6,cursor:'pointer',fontFamily:'Georgia,serif',opacity:step===0?0.3:1}},'⬅ Voltar'),
        step<dynamicSteps.length-1&&React.createElement('button',{onClick:()=>setStep(s=>s+1),style:{padding:'12px 30px',background:'#8b4f0f',color:'#fdf8f0',border:'none',borderBottom:'3px solid #4a2508',borderRadius:6,cursor:'pointer',fontFamily:'Georgia,serif'}},'Próximo ➡')
      )
    )
  )
}
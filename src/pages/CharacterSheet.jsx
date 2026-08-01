import React,{useState,useEffect}from'react'
import{supabase}from'../lib/supabase'

// ============ UTILITÁRIOS DE ROLAGEM ============
function rollDice(sides,count=1){
  let total=0
  const rolls=[]
  for(let i=0;i<count;i++){
    const r=Math.floor(Math.random()*sides)+1
    rolls.push(r)
    total+=r
  }
  return{total,rolls}
}

function formatRoll(dice,mod){
  const{total,rolls}=rollDice(dice)
  const final=total+mod
  const modStr=mod>=0?'+'+mod:''+mod
  return{rolls,total,final,text:rolls.join(' + ')+' '+modStr+' = '+final}
}

// ============ COMPONENTE ============
export default function CharacterSheet({user,navigate,characterId,campaignId}){
  const[char,setChar]=useState(null)
  const[loading,setLoading]=useState(true)
  const[tab,setTab]=useState('stats')
  const[editing,setEditing]=useState(false)
  const[hpDelta,setHpDelta]=useState(0)
  const[tempHp,setTempHp]=useState(0)
  const[newNote,setNewNote]=useState('')
  const[goldDelta,setGoldDelta]=useState(0)
  const[rollResult,setRollResult]=useState(null)
  const[newWeapon,setNewWeapon]=useState('')
  const[weaponDmg,setWeaponDmg]=useState('1d8')
  const[newSpell,setNewSpell]=useState('')
  const[spellLevel,setSpellLevel]=useState(1)
  const[newFeature,setNewFeature]=useState('')
  const[featureDesc,setFeatureDesc]=useState('')
  const[newItem,setNewItem]=useState('')
  const[itemQty,setItemQty]=useState(1)

  useEffect(()=>{
    supabase.from('characters').select('*').eq('id',characterId).single().then(({data})=>{setChar(data);setLoading(false)})
  },[])

  async function update(u){
    const{error}=await supabase.from('characters').update(u).eq('id',characterId)
    if(!error)setChar({...char,...u})
  }

  function getMod(s){return Math.floor((s-10)/2)}
  function getPB(){return Math.floor((char?.level-1)/4)+2}

  // Rolagens
  function rollAbility(ability){
    const mod=getMod(char.ability_scores[ability]||10)
    const r=formatRoll(20,mod)
    setRollResult({type:'Atributo '+ability.toUpperCase(),...r})
  }
  function rollSkill(skill){
    const mod=getSkillMod(skill)
    const r=formatRoll(20,mod)
    setRollResult({type:'Perícia '+skill.replace(/_/g,' '),...r})
  }
  function rollSave(ability){
    const mod=getMod(char.ability_scores[ability]||10)
    const isSave=char.saving_throw_proficiencies?.includes?.(ability)
    const totalMod=mod+(isSave?getPB():0)
    const r=formatRoll(20,totalMod)
    setRollResult({type:'Salvaguarda '+ability.toUpperCase(),...r})
  }
  function rollInitiative(){
    const mod=char.initiative||getMod(char.ability_scores.dex||10)
    const r=formatRoll(20,mod)
    setRollResult({type:'Iniciativa',...r})
  }
  function rollWeapon(weapon){
    const abilityMod=getMod(char.ability_scores.str||10)
    const pb=getPB()
    const atkMod=abilityMod+pb
    const atkRoll=formatRoll(20,atkMod)
    
    // Parse do dano (ex: 1d8+2)
    const dmgStr=weapon.damage||'1d8'
    const dmgMatch=dmgStr.match(/(\d+)d(\d+)/)
    let dmgRoll={total:0,final:abilityMod,text:'0 + '+abilityMod+' = '+abilityMod}
    if(dmgMatch){
      const dice=rollDice(parseInt(dmgMatch[2]),parseInt(dmgMatch[1]))
      dmgRoll={...dice,final:dice.total+abilityMod,text:dice.rolls.join(' + ')+' + '+abilityMod+' = '+(dice.total+abilityMod)}
    }
    
    setRollResult({type:'Ataque: '+weapon.name,...atkRoll,dmg:dmgRoll})
  }
  function rollSpellAttack(spell){
    const mod=getMod(char.ability_scores[char.class==='Bruxo'||char.class==='Feiticeiro'||char.class==='Bardo'?'cha':char.class==='Mago'?'int':char.class==='Clérigo'||char.class==='Druida'?'wis':'cha']||10)
    const r=formatRoll(20,mod+getPB())
    setRollResult({type:'Ataque Mágico: '+spell.name,...r})
  }
  function rollHitDice(){
    const hd=char.hit_dice?.type||'d8'
    const sides=parseInt(hd.replace('d',''))
    const conMod=getMod(char.ability_scores.con||10)
    const r=formatRoll(sides,conMod)
    setRollResult({type:'Dado de Vida ('+hd+')',...r})
  }

  // Skills
  function getSkillMod(skill){
    const abilityMap={acrobatics:'dex',animal_handling:'wis',arcana:'int',athletics:'str',deception:'cha',history:'int',insight:'wis',intimidation:'cha',investigation:'int',medicine:'wis',nature:'int',perception:'wis',performance:'cha',persuasion:'cha',religion:'int',sleight_of_hand:'dex',stealth:'dex',survival:'wis'}
    const ability=abilityMap[skill]||'int'
    const base=getMod(char.ability_scores[ability]||10)
    const proficient=char.skill_proficiencies?.includes?.(skill)
    const expertise=char.skill_expertise?.includes?.(skill)
    const pb=getPB()
    return base+(expertise?pb*2:proficient?pb:0)
  }

  // HP
  function heal(){const n=Math.min(char.hit_points.max,char.hit_points.current+hpDelta);update({hit_points:{...char.hit_points,current:n}});setHpDelta(0)}
  function damage(){const n=Math.max(0,char.hit_points.current-hpDelta);update({hit_points:{...char.hit_points,current:n}});setHpDelta(0)}
  function addTemp(){update({hit_points:{...char.hit_points,temporary:tempHp}});setTempHp(0)}

  // Death saves
  function addDeathSave(type){
    const ds={...char.death_saves}
    if(type==='success')ds.successes=Math.min(3,ds.successes+1)
    if(type==='failure')ds.failures=Math.min(3,ds.failures+1)
    update({death_saves:ds})
  }
  function resetDeathSaves(){update({death_saves:{successes:0,failures:0}})}

  // Currency
  function addGold(){const c={...char.currency};c.gp=(c.gp||0)+goldDelta;update({currency:c});setGoldDelta(0)}
  function addNote(){if(!newNote.trim())return;const notes=char.notes?char.notes+'\n'+newNote:newNote;update({notes});setNewNote('')}

  // Weapons
  function addWeapon(){
    if(!newWeapon.trim())return
    const weapons=[...(char.weapons||[]),{name:newWeapon,damage:weaponDmg}]
    update({weapons})
    setNewWeapon('');setWeaponDmg('1d8')
  }
  function removeWeapon(idx){
    const weapons=char.weapons.filter((_,i)=>i!==idx)
    update({weapons})
  }

  // Spells
  function addSpell(){
    if(!newSpell.trim())return
    const spells=[...(char.spells||[]),{name:newSpell,level:spellLevel,school:'-'}]
    update({spells})
    setNewSpell('');setSpellLevel(1)
  }
  function removeSpell(idx){
    const spells=char.spells.filter((_,i)=>i!==idx)
    update({spells})
  }
  function useSlot(lvl){
    const slots={...char.spell_slots}
    if(slots[lvl]&&slots[lvl].current>0){
      slots[lvl]={...slots[lvl],current:slots[lvl].current-1}
      update({spell_slots:slots})
    }
  }
  function resetSlots(){
    const slots={...char.spell_slots}
    Object.keys(slots).forEach(k=>{slots[k]={...slots[k],current:slots[k].total}})
    update({spell_slots:slots})
  }

  // Features
  function addFeature(){
    if(!newFeature.trim())return
    const features=[...(char.features||[]),{name:newFeature,description:featureDesc}]
    update({features})
    setNewFeature('');setFeatureDesc('')
  }

  // Equipment
  function addItem(){
    if(!newItem.trim())return
    const equipment=[...(char.equipment||[]),typeof char.equipment?.[0]==='string'?newItem+(itemQty>1?' x'+itemQty:''):{name:newItem,quantity:itemQty}]
    update({equipment})
    setNewItem('');setItemQty(1)
  }

  const skills=['acrobatics','animal_handling','arcana','athletics','deception','history','insight','intimidation','investigation','medicine','nature','perception','performance','persuasion','religion','sleight_of_hand','stealth','survival']

  if(loading)return React.createElement('div',{style:{minHeight:'100vh',background:'#1a0c03',display:'flex',alignItems:'center',justifyContent:'center'}},React.createElement('h1',{style:{fontSize:'4rem'}},'🍺'))
  if(!char)return React.createElement('div',{style:{minHeight:'100vh',background:'#1a0c03',display:'flex',alignItems:'center',justifyContent:'center',color:'#ef4444'}},'Personagem não encontrado')

  const pg={minHeight:'100vh',background:'#1a0c03',color:'#fdf8f0'}
  const hd={background:'#2d1605',borderBottom:'4px solid #8b4f0f',padding:20}
  const mn={maxWidth:1200,margin:'0 auto',padding:20}
  const card={background:'#2d1605',borderRadius:10,border:'2px solid #4a2508',padding:20}
  const card2={background:'#1a0c03',borderRadius:8,padding:15,border:'1px solid #4a2508'}
  const btn={padding:'10px 18px',background:'#4a2508',color:'#fdf8f0',border:'1px solid #8b4f0f',borderRadius:6,cursor:'pointer',fontFamily:'Georgia,serif',fontSize:14}
  const btnSm={padding:'5px 10px',background:'#4a2508',color:'#fdf8f0',border:'1px solid #8b4f0f',borderRadius:4,cursor:'pointer',fontFamily:'Georgia,serif',fontSize:11}
  const input={padding:8,background:'#1a0c03',border:'1px solid #4a2508',borderRadius:4,color:'#fdf8f0',textAlign:'center',fontSize:13}
  const inputW={...input,width:'100%',textAlign:'left',padding:'8px 12px',boxSizing:'border-box'}

  return React.createElement('div',{style:pg},
    // ===== POPUP DE ROLAGEM =====
    rollResult&&React.createElement('div',{onClick:()=>setRollResult(null),style:{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}},
      React.createElement('div',{onClick:e=>e.stopPropagation(),style:{background:'#2d1605',border:'3px solid #d4891a',borderRadius:15,padding:30,minWidth:300,textAlign:'center',animation:'fadeIn 0.2s'}},
        React.createElement('h3',{style:{color:'#d4891a',fontFamily:'Georgia,serif',margin:'0 0 15px 0'}},rollResult.type),
        React.createElement('div',{style:{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap',marginBottom:10}},
          rollResult.rolls?.map((r,i)=>React.createElement('span',{key:i,style:{width:40,height:40,borderRadius:'50%',background:r===20?'#22c55e':r===1?'#ef4444':'#1a0c03',border:'2px solid #d4891a',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'bold',fontSize:18}},r))
        ),
        React.createElement('p',{style:{fontSize:'2rem',fontWeight:'bold',color:'#fdf8f0',margin:'10px 0'}},rollResult.final),
        React.createElement('p',{style:{color:'#6b7280',fontSize:14}},rollResult.text),
        rollResult.dmg&&React.createElement('div',{style:{marginTop:15,padding:15,background:'#1a0c03',borderRadius:8}},
          React.createElement('p',{style:{color:'#ef4444',fontWeight:'bold',margin:0}},'💥 Dano: '+rollResult.dmg.final),
          React.createElement('p',{style:{color:'#6b7280',fontSize:12,margin:'5px 0 0 0'}},rollResult.dmg.text)
        ),
        React.createElement('button',{onClick:()=>setRollResult(null),style:{...btn,marginTop:15,background:'#8b4f0f'}},'Fechar')
      )
    ),

    // ===== HEADER =====
    React.createElement('div',{style:hd},
      React.createElement('div',{style:{maxWidth:1200,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}},
        React.createElement('div',{style:{display:'flex',alignItems:'center',gap:15}},
          React.createElement('div',{style:{width:70,height:70,borderRadius:'50%',background:char.token?.color||'#8b4f0f',border:'4px solid #d4891a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem',color:'#fdf8f0',fontFamily:'Georgia,serif'}},char.name.charAt(0).toUpperCase()),
          React.createElement('div',null,
            React.createElement('h1',{style:{color:'#d4891a',fontFamily:'Georgia,serif',margin:0,fontSize:'1.8rem'}},char.name),
            React.createElement('p',{style:{color:'#8b4f0f',margin:'2px 0 0 0',fontSize:14}},char.race+' • '+char.class+(char.subclass?' - '+char.subclass:'')+' • Nv '+char.level)
          )
        ),
        React.createElement('div',{style:{display:'flex',gap:10}},
          React.createElement('button',{onClick:rollInitiative,style:{...btn,background:'#b45309',borderColor:'#eab308'}},'⚡ Iniciativa +'+(char.initiative||getMod(char.ability_scores.dex||10))),
          React.createElement('button',{onClick:()=>setEditing(!editing),style:{...btn,background:editing?'#166534':'#4a2508'}},editing?'💾 Salvar':'✏️ Editar'),
          React.createElement('button',{onClick:()=>navigate('campaign',{campaignId}),style:btn},'🏠 Voltar')
        )
      )
    ),

    // ===== STATS RÁPIDOS =====
    React.createElement('div',{style:{...mn,paddingBottom:0}},
      React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:10,marginBottom:15}},
        React.createElement('div',{style:{...card,textAlign:'center'}},
          React.createElement('p',{style:{color:'#ef4444',margin:0,fontSize:13}},'❤️ Vida'),
          React.createElement('p',{style:{fontSize:'1.8rem',fontWeight:'bold',margin:'5px 0'}},char.hit_points.current),
          React.createElement('p',{style:{color:'#6b7280',fontSize:12,margin:0}},'/'+char.hit_points.max+(char.hit_points.temporary>0?' (+'+char.hit_points.temporary+')':'')),
          React.createElement('div',{style:{height:6,background:'#4a2508',borderRadius:3,marginTop:8,overflow:'hidden'}},React.createElement('div',{style:{height:'100%',width:(char.hit_points.current/char.hit_points.max*100)+'%',background:'linear-gradient(90deg,#ef4444,#f97316)',borderRadius:3}}))
        ),
        React.createElement('div',{style:{...card,textAlign:'center'}},React.createElement('p',{style:{color:'#3b82f6',margin:0,fontSize:13}},'🛡️ CA'),React.createElement('p',{style:{fontSize:'1.8rem',fontWeight:'bold',margin:'5px 0'}},char.armor_class)),
        React.createElement('div',{style:{...card,textAlign:'center',cursor:'pointer'},onClick:rollInitiative},React.createElement('p',{style:{color:'#eab308',margin:0,fontSize:13}},'⚡ Iniciativa'),React.createElement('p',{style:{fontSize:'1.8rem',fontWeight:'bold',margin:'5px 0'}},(char.initiative>=0?'+':'')+char.initiative)),
        React.createElement('div',{style:{...card,textAlign:'center'}},React.createElement('p',{style:{color:'#22c55e',margin:0,fontSize:13}},'🏃 Velocidade'),React.createElement('p',{style:{fontSize:'1.8rem',fontWeight:'bold',margin:'5px 0'}},char.speed+' pés')),
        React.createElement('div',{style:{...card,textAlign:'center'}},React.createElement('p',{style:{color:'#a855f7',margin:0,fontSize:13}},'⭐ Proficiência'),React.createElement('p',{style:{fontSize:'1.8rem',fontWeight:'bold',margin:'5px 0'}},'+'+getPB())),
        React.createElement('div',{style:{...card,textAlign:'center'}},React.createElement('p',{style:{color:'#f59e0b',margin:0,fontSize:13}},'💀 Inspiração'),React.createElement('button',{onClick:()=>update({inspiration:!char.inspiration}),style:{...btnSm,marginTop:8,background:char.inspiration?'#b45309':'#4a2508'}},char.inspiration?'⭐ Sim':'☆ Não'))
      )
    ),

    // ===== TABS =====
    React.createElement('div',{style:mn},
      React.createElement('div',{style:{display:'flex',gap:4,flexWrap:'wrap',marginBottom:20}},
        ['stats','skills','combat','spells','equipment','features','notes'].map(t=>React.createElement('button',{key:t,onClick:()=>setTab(t),style:{...btnSm,background:tab===t?'#d4891a':'#4a2508',color:tab===t?'#1a0c03':'#fdf8f0',border:tab===t?'2px solid #f59e0b':'1px solid #8b4f0f'}},t==='stats'?'📊 Atributos':t==='skills'?'🎯 Perícias':t==='combat'?'⚔️ Combate':t==='spells'?'🔮 Magias':t==='equipment'?'🎒 Equipamento':t==='features'?'✨ Características':'📝 Anotações'))
      ),

      // ===== TAB: ATRIBUTOS =====
      tab==='stats'&&React.createElement('div',null,
        React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:12,marginBottom:20}},
          Object.entries(char.ability_scores).map(([k,v])=>{
            const m=getMod(v)
            const isSave=char.saving_throw_proficiencies?.includes?.(k)
            const save=m+(isSave?getPB():0)
            return React.createElement('div',{key:k,style:{...card2,textAlign:'center'}},
              React.createElement('p',{style:{color:'#8b4f0f',fontSize:11,textTransform:'uppercase',margin:0,fontFamily:'Georgia,serif'}},k),
              React.createElement('p',{style:{fontSize:'2rem',fontWeight:'bold',margin:'5px 0',color:'#fdf8f0'}},v),
              React.createElement('button',{onClick:()=>rollAbility(k),style:{...btnSm,background:'#7e22ce',margin:'5px 0',width:'100%',fontSize:14,fontWeight:'bold'}},(m>=0?'+':'')+m+' 🎲'),
              React.createElement('button',{onClick:()=>rollSave(k),style:{...btnSm,width:'100%',fontSize:11,color:'#d4891a'}},'Salvaguarda '+(save>=0?'+':'')+save+' 🎲')
            )
          })
        ),
        React.createElement('div',{style:card},
          React.createElement('h3',{style:{color:'#d4891a',fontFamily:'Georgia,serif',margin:'0 0 15px 0'}},'💀 Testes de Morte'),
          React.createElement('div',{style:{display:'flex',gap:30,alignItems:'center',flexWrap:'wrap'}},
            React.createElement('div',null,
              React.createElement('p',{style:{color:'#8b4f0f',margin:'0 0 8px 0',fontSize:13}},'Sucessos'),
              React.createElement('div',{style:{display:'flex',gap:6}},[0,1,2].map(i=>React.createElement('button',{key:i,onClick:()=>addDeathSave('success'),style:{width:30,height:30,borderRadius:'50%',border:'2px solid '+(i<char.death_saves?.successes?'#22c55e':'#4a2508'),background:i<char.death_saves?.successes?'#22c55e':'transparent',cursor:'pointer'}})))
            ),
            React.createElement('div',null,
              React.createElement('p',{style:{color:'#8b4f0f',margin:'0 0 8px 0',fontSize:13}},'Falhas'),
              React.createElement('div',{style:{display:'flex',gap:6}},[0,1,2].map(i=>React.createElement('button',{key:i,onClick:()=>addDeathSave('failure'),style:{width:30,height:30,borderRadius:'50%',border:'2px solid '+(i<char.death_saves?.failures?'#ef4444':'#4a2508'),background:i<char.death_saves?.failures?'#ef4444':'transparent',cursor:'pointer'}})))
            ),
            React.createElement('button',{onClick:resetDeathSaves,style:btnSm},'🔄 Resetar')
          )
        )
      ),

      // ===== TAB: PERÍCIAS =====
      tab==='skills'&&React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:8}},
        skills.map(s=>{
          const mod=getSkillMod(s)
          const isP=char.skill_proficiencies?.includes?.(s)
          const isE=char.skill_expertise?.includes?.(s)
          return React.createElement('div',{key:s,style:{...card2,display:'flex',justifyContent:'space-between',alignItems:'center',background:isE?'#3b0764':isP?'#1e3a5f':'#1a0c03',border:isE?'1px solid #a855f7':isP?'1px solid #3b82f6':'1px solid #4a2508'}},
            React.createElement('span',{style:{textTransform:'capitalize',fontSize:13}},s.replace(/_/g,' ')+(isE?' ⭐':isP?' ●':'')),
            React.createElement('button',{onClick:()=>rollSkill(s),style:{...btnSm,background:'#7e22ce',fontWeight:'bold'}},(mod>=0?'+':'')+mod+' 🎲')
          )
        })
      ),

      // ===== TAB: COMBATE =====
      tab==='combat'&&React.createElement('div',null,
        editing&&React.createElement('div',{style:{...card,marginBottom:15}},
          React.createElement('h3',{style:{color:'#d4891a',fontFamily:'Georgia,serif',margin:'0 0 10px 0'}},'❤️ Ajustar Vida'),
          React.createElement('div',{style:{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}},
            React.createElement('input',{type:'number',value:hpDelta,onChange:e=>setHpDelta(parseInt(e.target.value)||0),style:input,placeholder:'Qtd'}),
            React.createElement('button',{onClick:heal,style:{...btnSm,background:'#166534'}},'💚 Curar'),
            React.createElement('button',{onClick:damage,style:{...btnSm,background:'#991b1b'}},'💔 Dano'),
            React.createElement('input',{type:'number',value:tempHp,onChange:e=>setTempHp(parseInt(e.target.value)||0),style:input,placeholder:'Temp'}),
            React.createElement('button',{onClick:addTemp,style:{...btnSm,background:'#1e40af'}},'💙 Temp HP')
          )
        ),
        React.createElement('div',{style:card},
          React.createElement('h3',{style:{color:'#d4891a',fontFamily:'Georgia,serif',margin:'0 0 10px 0'}},'🗡️ Armas'),
          char.weapons?.length>0?char.weapons.map((w,i)=>React.createElement('div',{key:i,style:{...card2,marginBottom:5,display:'flex',justifyContent:'space-between',alignItems:'center'}},
            React.createElement('div',null,
              React.createElement('span',{style:{fontWeight:'bold'}},w.name||w),
              React.createElement('span',{style:{color:'#8b4f0f',marginLeft:10,fontSize:12}},(w.damage||'')),
            ),
            React.createElement('div',{style:{display:'flex',gap:5}},
              React.createElement('button',{onClick:()=>rollWeapon(w),style:{...btnSm,background:'#dc2626'}},'⚔️ Atacar'),
              editing&&React.createElement('button',{onClick:()=>removeWeapon(i),style:{...btnSm,background:'#7f1d1d'}},'✕')
            )
          )):React.createElement('p',{style:{color:'#6b7280'}},'Nenhuma arma'),
          editing&&React.createElement('div',{style:{display:'flex',gap:10,marginTop:10}},
            React.createElement('input',{value:newWeapon,onChange:e=>setNewWeapon(e.target.value),placeholder:'Nome da arma',style:inputW}),
            React.createElement('input',{value:weaponDmg,onChange:e=>setWeaponDmg(e.target.value),placeholder:'1d8+2',style:{...input,width:80}}),
            React.createElement('button',{onClick:addWeapon,style:btnSm},'+ Adicionar')
          )
        ),
        React.createElement('button',{onClick:rollHitDice,style:{...btn,background:'#7e22ce',marginTop:10,width:'100%'}},'🎲 Rolar Dado de Vida ('+(char.hit_dice?.type||'d8')+')')
      ),

      // ===== TAB: MAGIAS =====
      tab==='spells'&&React.createElement('div',null,
        React.createElement('div',{style:{...card,marginBottom:15}},
          React.createElement('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}},
            React.createElement('h3',{style:{color:'#d4891a',fontFamily:'Georgia,serif',margin:0}},'🔮 Slots de Magia'),
            React.createElement('button',{onClick:resetSlots,style:{...btnSm,background:'#166534'}},'🔄 Recuperar Tudo')
          ),
          React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(60px,1fr))',gap:6}},
            Object.entries(char.spell_slots||{}).map(([lvl,sl])=>React.createElement('button',{key:lvl,onClick:()=>useSlot(lvl),style:{...card2,textAlign:'center',cursor:sl.current>0?'pointer':'default',opacity:sl.current>0?1:0.4}},
              React.createElement('p',{style:{color:'#8b4f0f',fontSize:10,margin:0}},'Nv '+lvl),
              React.createElement('p',{style:{fontWeight:'bold',fontSize:16,margin:'3px 0',color:sl.current>0?'#a855f7':'#6b7280'}},sl.current+'/'+sl.total)
            ))
          )
        ),
        React.createElement('div',{style:card},
          React.createElement('h3',{style:{color:'#d4891a',fontFamily:'Georgia,serif',margin:'0 0 10px 0'}},'📜 Magias Conhecidas'),
          char.spells?.length>0?char.spells.map((s,i)=>React.createElement('div',{key:i,style:{...card2,marginBottom:5,display:'flex',justifyContent:'space-between',alignItems:'center'}},
            React.createElement('div',null,
              React.createElement('p',{style:{fontWeight:'bold',margin:0,color:'#d4891a'}},s.name||s),
              React.createElement('p',{style:{color:'#8b4f0f',fontSize:11,margin:'3px 0 0 0'}},'Nível '+(s.level||'?')+' • '+(s.school||''))
            ),
            React.createElement('div',{style:{display:'flex',gap:5}},
              React.createElement('button',{onClick:()=>rollSpellAttack(s),style:{...btnSm,background:'#7e22ce'}},'🎲 Ataque'),
              editing&&React.createElement('button',{onClick:()=>removeSpell(i),style:{...btnSm,background:'#7f1d1d'}},'✕')
            )
          )):React.createElement('p',{style:{color:'#6b7280'}},'Nenhuma magia'),
          editing&&React.createElement('div',{style:{display:'flex',gap:10,marginTop:10}},
            React.createElement('input',{value:newSpell,onChange:e=>setNewSpell(e.target.value),placeholder:'Nome da magia',style:inputW}),
            React.createElement('select',{value:spellLevel,onChange:e=>setSpellLevel(parseInt(e.target.value)),style:{...input,width:70}},
              [0,1,2,3,4,5,6,7,8,9].map(l=>React.createElement('option',{key:l,value:l},'Nv '+l))
            ),
            React.createElement('button',{onClick:addSpell,style:btnSm},'+')
          )
        )
      ),

      // ===== TAB: EQUIPAMENTO =====
      tab==='equipment'&&React.createElement('div',null,
        React.createElement('div',{style:{...card,marginBottom:15}},
          React.createElement('h3',{style:{color:'#d4891a',fontFamily:'Georgia,serif',margin:'0 0 10px 0'}},'💰 Moedas'),
          React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(80px,1fr))',gap:8}},
            Object.entries(char.currency||{}).map(([coin,amt])=>React.createElement('div',{key:coin,style:{...card2,textAlign:'center'}},
              React.createElement('p',{style:{color:'#8b4f0f',fontSize:11,textTransform:'uppercase',margin:0}},coin),
              React.createElement('p',{style:{fontWeight:'bold',margin:'5px 0',color:'#f59e0b'}},amt)
            ))
          ),
          editing&&React.createElement('div',{style:{display:'flex',gap:10,marginTop:10,alignItems:'center'}},
            React.createElement('input',{type:'number',value:goldDelta,onChange:e=>setGoldDelta(parseInt(e.target.value)||0),style:input,placeholder:'GP'}),
            React.createElement('button',{onClick:addGold,style:btnSm},'💰 Adicionar GP')
          )
        ),
        React.createElement('div',{style:card},
          React.createElement('h3',{style:{color:'#d4891a',fontFamily:'Georgia,serif',margin:'0 0 10px 0'}},'🎒 Inventário'),
          char.equipment?.length>0?char.equipment.map((item,i)=>React.createElement('div',{key:i,style:{...card2,marginBottom:5,display:'flex',justifyContent:'space-between'}},
            React.createElement('span',null,typeof item==='string'?item:item.name||item),
            (typeof item==='object'&&item.quantity||typeof item==='string'&&item.includes('x'))&&React.createElement('span',{style:{color:'#6b7280'}},'x'+(typeof item==='object'?item.quantity:''))
          )):React.createElement('p',{style:{color:'#6b7280'}},'Inventário vazio'),
          editing&&React.createElement('div',{style:{display:'flex',gap:10,marginTop:10}},
            React.createElement('input',{value:newItem,onChange:e=>setNewItem(e.target.value),placeholder:'Item',style:inputW}),
            React.createElement('input',{type:'number',value:itemQty,onChange:e=>setItemQty(parseInt(e.target.value)||1),style:{...input,width:60}}),
            React.createElement('button',{onClick:addItem,style:btnSm},'+')
          )
        )
      ),

      // ===== TAB: CARACTERÍSTICAS =====
      tab==='features'&&React.createElement('div',null,
        React.createElement('div',{style:{...card,marginBottom:15}},
          React.createElement('h3',{style:{color:'#d4891a',fontFamily:'Georgia,serif',margin:'0 0 10px 0'}},'🧬 Traços Raciais'),
          char.traits?.length>0?char.traits.map((t,i)=>React.createElement('div',{key:i,style:{...card2,marginBottom:5}},
            React.createElement('p',{style:{color:'#d4891a',margin:0,fontWeight:'bold',fontSize:14}},t.name||t),
            t.description&&React.createElement('p',{style:{color:'#8b4f0f',margin:'3px 0 0 0',fontSize:12}},t.description)
          )):React.createElement('p',{style:{color:'#6b7280'}},'Nenhum traço')
        ),
        React.createElement('div',{style:{...card,marginBottom:15}},
          React.createElement('h3',{style:{color:'#d4891a',fontFamily:'Georgia,serif',margin:'0 0 10px 0'}},'⭐ Habilidades'),
          char.features?.length>0?char.features.map((f,i)=>React.createElement('div',{key:i,style:{...card2,marginBottom:5}},
            React.createElement('p',{style:{color:'#eab308',margin:0,fontWeight:'bold',fontSize:14}},f.name||f),
            f.description&&React.createElement('p',{style:{color:'#8b4f0f',margin:'3px 0 0 0',fontSize:12}},f.description)
          )):React.createElement('p',{style:{color:'#6b7280'}},'Nenhuma habilidade'),
          editing&&React.createElement('div',{style:{display:'flex',flexDirection:'column',gap:5,marginTop:10}},
            React.createElement('input',{value:newFeature,onChange:e=>setNewFeature(e.target.value),placeholder:'Nome da habilidade',style:inputW}),
            React.createElement('input',{value:featureDesc,onChange:e=>setFeatureDesc(e.target.value),placeholder:'Descrição',style:inputW}),
            React.createElement('button',{onClick:addFeature,style:btnSm},'+ Adicionar')
          )
        ),
        React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:10}},
          React.createElement('div',{style:card},
            React.createElement('h3',{style:{color:'#d4891a',fontFamily:'Georgia,serif',margin:'0 0 8px 0',fontSize:14}},'🗣️ Idiomas'),
            char.languages?.length>0?React.createElement('div',{style:{display:'flex',flexWrap:'wrap',gap:4}},char.languages.map((l,i)=>React.createElement('span',{key:i,style:{...btnSm,fontSize:11}},l))):React.createElement('p',{style:{color:'#6b7280',fontSize:13}},'Nenhum')
          ),
          React.createElement('div',{style:card},
            React.createElement('h3',{style:{color:'#d4891a',fontFamily:'Georgia,serif',margin:'0 0 8px 0',fontSize:14}},'🛡️ Proficiências'),
            React.createElement('p',{style:{color:'#8b4f0f',fontSize:13,margin:0}},'Armas: '+(char.weapon_proficiencies?.join?.(', ')||'Nenhuma')),
            React.createElement('p',{style:{color:'#8b4f0f',fontSize:13,margin:'5px 0 0 0'}},'Armaduras: '+(char.armor_proficiencies?.join?.(', ')||'Nenhuma')),
            React.createElement('p',{style:{color:'#8b4f0f',fontSize:13,margin:'5px 0 0 0'}},'Ferramentas: '+(char.tool_proficiencies?.join?.(', ')||'Nenhuma'))
          )
        )
      ),

      // ===== TAB: ANOTAÇÕES =====
      tab==='notes'&&React.createElement('div',{style:card},
        React.createElement('h3',{style:{color:'#d4891a',fontFamily:'Georgia,serif',margin:'0 0 10px 0'}},'📝 Anotações'),
        React.createElement('pre',{style:{color:'#fdf8f0',whiteSpace:'pre-wrap',fontFamily:'Georgia,serif',background:'#1a0c03',padding:15,borderRadius:8,minHeight:150,margin:0}},char.notes||'Nenhuma anotação'),
        editing&&React.createElement('div',{style:{display:'flex',gap:10,marginTop:10}},
          React.createElement('input',{type:'text',value:newNote,onChange:e=>setNewNote(e.target.value),placeholder:'Nova anotação...',style:{...input,width:'100%',textAlign:'left',padding:'8px 12px'}}),
          React.createElement('button',{onClick:addNote,style:btnSm},'✏️ Adicionar')
        )
      )
    )
  )
}
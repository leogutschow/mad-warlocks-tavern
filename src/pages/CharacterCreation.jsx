import React,{useState}from'react'
import{supabase}from'../lib/supabase'

const RACES={human:{n:'Humano',b:{str:1,dex:1,con:1,int:1,wis:1,cha:1},s:30},elf:{n:'Elfo',b:{dex:2},s:30},dwarf:{n:'Anão',b:{con:2},s:25},halfling:{n:'Halfling',b:{dex:2},s:25},dragonborn:{n:'Draconato',b:{str:2,cha:1},s:30},gnome:{n:'Gnomo',b:{int:2},s:25},half_elf:{n:'Meio-Elfo',b:{cha:2,dex:1,con:1},s:30},half_orc:{n:'Meio-Orc',b:{str:2,con:1},s:30},tiefling:{n:'Tiefling',b:{int:1,cha:2},s:30}}
const CLASSES={barbarian:{n:'Bárbaro',h:12},bard:{n:'Bardo',h:8},cleric:{n:'Clérigo',h:8},druid:{n:'Druida',h:8},fighter:{n:'Guerreiro',h:10},monk:{n:'Monge',h:8},paladin:{n:'Paladino',h:10},ranger:{n:'Patrulheiro',h:10},rogue:{n:'Ladino',h:8},sorcerer:{n:'Feiticeiro',h:6},warlock:{n:'Bruxo',h:8},wizard:{n:'Mago',h:6}}
const BG=['acolyte','criminal','folk_hero','noble','sage','soldier','entertainer','urchin','outlander']
const STEPS=['Raça','Classe','Atributos','Antecedente','Nome','Revisão']

export default function CharacterCreation({user,navigate,campaignId}){
  const[step,setStep]=useState(0)
  const[sr,setSR]=useState(null)
  const[sc,setSC]=useState(null)
  const[scores,setScores]=useState({str:10,dex:10,con:10,int:10,wis:10,cha:10})
  const[bg,setBg]=useState('')
  const[name,setName]=useState('')
  const[saving,setSaving]=useState(false)
  
  function applyRace(k){
    const r=RACES[k]
    const ns={...scores}
    for(const[a,b]of Object.entries(r.b))ns[a]=(ns[a]||10)+b
    setScores(ns)
  }
  
  async function createChar(){
    setSaving(true)
    try{
      const r=RACES[sr];const c=CLASSES[sc];const m={}
      for(const[k,v]of Object.entries(scores))m[k]=Math.floor((v-10)/2)
      const hp=c.h+(m.con||0)
      const{error}=await supabase.from('characters').insert({
        user_id:user.id,campaign_id:campaignId,name,race:r.n,class:c.n,background:bg,
        ability_scores:scores,hit_points:{max:hp,current:hp,temporary:0},
        hit_dice:{total:1,current:1,type:'d'+c.h},
        armor_class:10+(m.dex||0),speed:r.s,initiative:m.dex||0,alignment:'true_neutral'
      })
      if(error)throw error
      navigate('campaign',{campaignId})
    }catch(err){alert('Erro: '+err.message)}
    finally{setSaving(false)}
  }
  
  const pg={minHeight:'100vh',background:'#1a0c03'}
  const hd={background:'#2d1605',borderBottom:'4px solid #8b4f0f',padding:15}
  const mn={maxWidth:1000,margin:'0 auto',padding:20}
  const bx={background:'#2d1605',borderRadius:10,border:'2px solid #4a2508',padding:30}
  const btn={padding:15,background:'#1a0c03',border:'2px solid #4a2508',borderRadius:8,cursor:'pointer',color:'#fdf8f0',textAlign:'left'}
  const sel={...btn,background:'#4a2508',border:'2px solid #d4891a'}
  
  return React.createElement('div',{style:pg},
    React.createElement('header',{style:hd},
      React.createElement('div',{style:{maxWidth:1000,margin:'0 auto'}},
        React.createElement('h1',{style:{color:'#d4891a',fontFamily:'Georgia,serif',margin:'0 0 10px 0'}},'⚒️ Forja do Destino'),
        React.createElement('div',{style:{display:'flex',gap:10,flexWrap:'wrap'}},
          STEPS.map((s,i)=>React.createElement('button',{key:s,onClick:()=>setStep(i),style:{padding:'8px 15px',borderRadius:5,border:'none',cursor:'pointer',background:i===step?'#d4891a':i<step?'#4a2508':'#2d1605',color:i===step?'#1a0c03':'#8b4f0f',fontFamily:'Georgia,serif'}},i+1+'. '+s))
        )
      )
    ),
    React.createElement('div',{style:mn},
      React.createElement('div',{style:bx},
        step===0&&React.createElement('div',null,
          React.createElement('h2',{style:{color:'#d4891a',fontFamily:'Georgia,serif',marginTop:0}},'Escolha sua Raça'),
          React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:15,marginTop:15}},
            Object.entries(RACES).map(([k,r])=>React.createElement('button',{key:k,onClick:()=>{setSR(k);applyRace(k)},style:sr===k?sel:btn},
              React.createElement('h3',{style:{fontFamily:'Georgia,serif',margin:'0 0 5px 0'}},r.n),
              React.createElement('p',{style:{color:'#8b4f0f',fontSize:14,margin:0}},'Vel: '+r.s+' pés')
            ))
          )
        ),
        step===1&&React.createElement('div',null,
          React.createElement('h2',{style:{color:'#d4891a',fontFamily:'Georgia,serif',marginTop:0}},'Escolha sua Classe'),
          React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:15,marginTop:15}},
            Object.entries(CLASSES).map(([k,c])=>React.createElement('button',{key:k,onClick:()=>setSC(k),style:sc===k?sel:btn},
              React.createElement('h3',{style:{fontFamily:'Georgia,serif',margin:'0 0 5px 0'}},c.n),
              React.createElement('p',{style:{color:'#8b4f0f',fontSize:14,margin:0}},'Dado: d'+c.h)
            ))
          )
        ),
        step===2&&React.createElement('div',null,
          React.createElement('h2',{style:{color:'#d4891a',fontFamily:'Georgia,serif',marginTop:0}},'Atributos'),
          React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))',gap:15,marginTop:15}},
            Object.entries(scores).map(([k,v])=>{
              const m=Math.floor((v-10)/2)
              return React.createElement('div',{key:k,style:{background:'#1a0c03',borderRadius:8,padding:15,border:'2px solid #4a2508'}},
                React.createElement('div',{style:{display:'flex',justifyContent:'space-between',marginBottom:10}},
                  React.createElement('span',{style:{fontFamily:'Georgia,serif',color:'#fdf8f0',textTransform:'uppercase'}},k),
                  React.createElement('span',{style:{color:m>=0?'#4ade80':'#ef4444',fontWeight:'bold'}},v+' ('+(m>=0?'+':'')+m+')')
                ),
                React.createElement('input',{type:'range',min:'3',max:'20',value:v,onChange:e=>setScores({...scores,[k]:parseInt(e.target.value)}),style:{width:'100%',accentColor:'#d4891a'}})
              )
            })
          )
        ),
        step===3&&React.createElement('div',null,
          React.createElement('h2',{style:{color:'#d4891a',fontFamily:'Georgia,serif',marginTop:0}},'Antecedente'),
          React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:10,marginTop:15}},
            BG.map(b=>React.createElement('button',{key:b,onClick:()=>setBg(b),style:bg===b?{...sel,textTransform:'capitalize'}:{...btn,textTransform:'capitalize'}},b.replace(/_/g,' ')))
          )
        ),
        step===4&&React.createElement('div',{style:{maxWidth:400,margin:'0 auto'}},
          React.createElement('h2',{style:{color:'#d4891a',fontFamily:'Georgia,serif',marginTop:0}},'Nome do Herói'),
          React.createElement('input',{type:'text',value:name,onChange:e=>setName(e.target.value),placeholder:'Thordak, o Destemido...',style:{width:'100%',padding:15,background:'#1a0c03',border:'2px solid #4a2508',borderRadius:8,color:'#fdf8f0',fontSize:18,boxSizing:'border-box'}})
        ),
        step===5&&React.createElement('div',null,
          React.createElement('h2',{style:{color:'#d4891a',fontFamily:'Georgia,serif',marginTop:0}},'📜 Pergaminho do Herói'),
          React.createElement('div',{style:{background:'#1a0c03',borderRadius:8,padding:20,border:'2px solid #4a2508',marginBottom:20}},
            React.createElement('h3',{style:{color:'#d4891a',fontFamily:'Georgia,serif',fontSize:'1.5rem',margin:'0 0 10px 0'}},name||'(sem nome)'),
            React.createElement('p',{style:{color:'#8b4f0f',margin:0}},RACES[sr]?.n+' • '+CLASSES[sc]?.n+' • '+bg),
            React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:10,marginTop:15}},
              Object.entries(scores).map(([k,v])=>React.createElement('div',{key:k,style:{textAlign:'center',background:'#2d1605',padding:10,borderRadius:5}},
                React.createElement('div',{style:{color:'#8b4f0f',fontSize:12}},k.toUpperCase()),
                React.createElement('div',{style:{color:'#fdf8f0',fontWeight:'bold'}},v)
              ))
            )
          ),
          React.createElement('button',{onClick:createChar,disabled:saving,style:{width:'100%',padding:18,background:'#8b4f0f',color:'#fdf8f0',border:'none',borderBottom:'4px solid #4a2508',borderRadius:8,fontSize:20,cursor:'pointer',fontFamily:'Georgia,serif',opacity:saving?0.5:1}},'⚔️ '+(saving?'Forjando...':'FORJAR DESTINO!'))
        )
      ),
      React.createElement('div',{style:{display:'flex',justifyContent:'space-between',marginTop:20}},
        React.createElement('button',{onClick:()=>setStep(s=>s-1),disabled:step===0,style:{padding:'12px 25px',background:'#2d1605',color:'#fdf8f0',border:'1px solid #4a2508',borderRadius:5,cursor:'pointer',opacity:step===0?0.3:1}},'⬅ Voltar'),
        step<5&&React.createElement('button',{onClick:()=>setStep(s=>s+1),style:{padding:'12px 25px',background:'#8b4f0f',color:'#fdf8f0',border:'none',borderBottom:'3px solid #4a2508',borderRadius:5,cursor:'pointer'}},'Próximo ➡')
      )
    )
  )
}
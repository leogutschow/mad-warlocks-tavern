import React,{useState,useEffect}from'react'
import{supabase}from'../lib/supabase'

export default function CharacterSheet({user,navigate,characterId,campaignId}){
  const[c,setC]=useState(null)
  const[l,setL]=useState(true)
  
  useEffect(()=>{
    supabase.from('characters').select('*').eq('id',characterId).single().then(({data})=>{setC(data);setL(false)})
  },[])
  
  if(l)return React.createElement('div',{style:{minHeight:'100vh',background:'#1a0c03',display:'flex',alignItems:'center',justifyContent:'center'}},React.createElement('h1',{style:{fontSize:'4rem'}},'🍺'))
  if(!c)return React.createElement('div',{style:{minHeight:'100vh',background:'#1a0c03',display:'flex',alignItems:'center',justifyContent:'center',color:'#8b4f0f'}},'Personagem não encontrado')
  
  const gm=s=>Math.floor((s-10)/2)
  const pg={minHeight:'100vh',background:'#1a0c03'}
  const hd={background:'#2d1605',borderBottom:'4px solid #8b4f0f',padding:20}
  const mn={maxWidth:1000,margin:'0 auto',padding:20}
  const sc={background:'#2d1605',borderRadius:8,padding:15,border:'2px solid #4a2508'}
  
  return React.createElement('div',{style:pg},
    React.createElement('header',{style:hd},
      React.createElement('div',{style:{maxWidth:1000,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center'}},
        React.createElement('div',{style:{display:'flex',alignItems:'center',gap:15}},
          React.createElement('div',{style:{width:60,height:60,borderRadius:'50%',background:'#8b4f0f',border:'3px solid #d4891a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem',color:'#fdf8f0',fontFamily:'Georgia,serif'}},c.name.charAt(0)),
          React.createElement('div',null,
            React.createElement('h1',{style:{color:'#d4891a',fontFamily:'Georgia,serif',margin:0}},c.name),
            React.createElement('p',{style:{color:'#8b4f0f',margin:'5px 0 0 0'}},c.race+' • '+c.class+' • Nível '+c.level)
          )
        ),
        React.createElement('button',{onClick:()=>navigate('campaign',{campaignId}),style:{padding:'10px 20px',background:'#4a2508',color:'#fdf8f0',border:'1px solid #8b4f0f',borderRadius:5,cursor:'pointer'}},'Voltar')
      )
    ),
    React.createElement('div',{style:mn},
      React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:15,marginBottom:20}},
        React.createElement('div',{style:sc},React.createElement('p',{style:{color:'#ef4444',margin:0}},'❤️ PV'),React.createElement('p',{style:{color:'#fdf8f0',fontSize:'1.5rem',fontWeight:'bold',margin:'5px 0 0 0'}},c.hit_points.current+' / '+c.hit_points.max)),
        React.createElement('div',{style:sc},React.createElement('p',{style:{color:'#3b82f6',margin:0}},'🛡️ CA'),React.createElement('p',{style:{color:'#fdf8f0',fontSize:'1.5rem',fontWeight:'bold',margin:'5px 0 0 0'}},c.armor_class)),
        React.createElement('div',{style:sc},React.createElement('p',{style:{color:'#eab308',margin:0}},'⚡ Velocidade'),React.createElement('p',{style:{color:'#fdf8f0',fontSize:'1.5rem',fontWeight:'bold',margin:'5px 0 0 0'}},c.speed+' pés')),
        React.createElement('div',{style:sc},React.createElement('p',{style:{color:'#a855f7',margin:0}},'⭐ Proficiência'),React.createElement('p',{style:{color:'#fdf8f0',fontSize:'1.5rem',fontWeight:'bold',margin:'5px 0 0 0'}},'+'+c.proficiency_bonus))
      ),
      React.createElement('div',{style:{...sc,padding:20}},
        React.createElement('h2',{style:{color:'#d4891a',fontFamily:'Georgia,serif',margin:'0 0 15px 0'}},'Atributos'),
        React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))',gap:10}},
          Object.entries(c.ability_scores).map(([k,v])=>{
            const m=gm(v)
            return React.createElement('div',{key:k,style:{background:'#1a0c03',borderRadius:8,padding:15,textAlign:'center',border:'1px solid #4a2508'}},
              React.createElement('p',{style:{color:'#8b4f0f',fontSize:12,fontFamily:'Georgia,serif',margin:0}},k.toUpperCase()),
              React.createElement('p',{style:{color:'#fdf8f0',fontSize:'1.5rem',fontWeight:'bold',margin:'5px 0'}},v),
              React.createElement('p',{style:{color:m>=0?'#4ade80':'#ef4444',margin:0}},(m>=0?'+':'')+m)
            )
          })
        )
      )
    )
  )
}
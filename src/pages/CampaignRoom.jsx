import React,{useState,useEffect}from'react'
import{supabase}from'../lib/supabase'

export default function CampaignRoom({user,navigate,campaignId}){
  const[camp,setCamp]=useState(null)
  const[chars,setChars]=useState([])
  const[l,setL]=useState(true)
  const[msgs,setMsgs]=useState([])
  const[nm,setNm]=useState('')
  
  useEffect(()=>{
    load()
    const ch=supabase.channel('camp-'+campaignId).on('postgres_changes',{event:'INSERT',schema:'public',table:'chat_messages',filter:'campaign_id=eq.'+campaignId},p=>setMsgs(prev=>[...prev,p.new])).subscribe()
    return()=>{supabase.removeChannel(ch)}
  },[campaignId])
  
  async function load(){
    const[cr,chr,mr]=await Promise.all([
      supabase.from('campaigns').select('*,dm:dm_id(username)').eq('id',campaignId).single(),
      supabase.from('characters').select('*').eq('campaign_id',campaignId),
      supabase.from('chat_messages').select('*').eq('campaign_id',campaignId).order('created_at',{ascending:true}).limit(50)
    ])
    setCamp(cr.data);setChars(chr.data||[]);setMsgs(mr.data||[]);setL(false)
  }
  
  async function sm(){
    if(!nm.trim())return
    await supabase.from('chat_messages').insert({campaign_id:campaignId,user_id:user.id,username:user.user_metadata?.username||'Aventureiro',message:nm,type:'chat'})
    setNm('')
  }
  
  const mc=chars.find(c=>c.user_id===user.id)
  
  if(l)return React.createElement('div',{style:{minHeight:'100vh',background:'#1a0c03',display:'flex',alignItems:'center',justifyContent:'center'}},React.createElement('h1',{style:{fontSize:'4rem'}},'🍺'))
  
  return React.createElement('div',{style:{minHeight:'100vh',background:'#1a0c03',display:'flex',flexDirection:'column'}},
    React.createElement('header',{style:{background:'#2d1605',borderBottom:'4px solid #8b4f0f',padding:15}},
      React.createElement('div',{style:{maxWidth:1200,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center'}},
        React.createElement('div',null,
          React.createElement('h1',{style:{color:'#d4891a',fontFamily:'Georgia,serif',margin:0}},camp?.name),
          React.createElement('p',{style:{color:'#8b4f0f',margin:'5px 0 0 0'}},chars.length+' aventureiros')
        ),
        React.createElement('div',{style:{display:'flex',gap:10}},
          React.createElement('button',{onClick:()=>navigate('lobby'),style:{padding:'10px 20px',background:'#4a2508',color:'#fdf8f0',border:'1px solid #8b4f0f',borderRadius:5,cursor:'pointer',fontFamily:'Georgia,serif'}},'🏠 Lobby'),
          !mc&&React.createElement('button',{onClick:()=>navigate('create-character',{campaignId}),style:{padding:'10px 20px',background:'#8b4f0f',color:'#fdf8f0',border:'none',borderRadius:5,cursor:'pointer'}},'Criar Personagem'),
          mc&&React.createElement('button',{onClick:()=>navigate('character-sheet',{characterId:mc.id,campaignId}),style:{padding:'10px 20px',background:'#4a2508',color:'#fdf8f0',border:'1px solid #8b4f0f',borderRadius:5,cursor:'pointer'}},'Minha Ficha')
        )
      )
    ),
    React.createElement('div',{style:{flex:1,display:'flex',flexDirection:'column'}},
      React.createElement('div',{style:{flex:1,padding:20,display:'flex',alignItems:'center',justifyContent:'center'}},
        React.createElement('p',{style:{color:'#4a2508',fontSize:'1.2rem'}},'🗺️ Battlemap (em breve)')
      ),
      React.createElement('div',{style:{borderTop:'2px solid #4a2508',background:'#2d1605'}},
        React.createElement('div',{style:{height:200,overflowY:'auto',padding:15}},
          msgs.map(m=>React.createElement('div',{key:m.id,style:{marginBottom:5}},
            React.createElement('span',{style:{color:'#d4891a',fontWeight:'bold',fontFamily:'Georgia,serif'}},m.username+': '),
            React.createElement('span',{style:{color:'#fdf8f0'}},m.message)
          ))
        ),
        React.createElement('div',{style:{padding:10,borderTop:'1px solid #4a2508',display:'flex',gap:10}},
          React.createElement('input',{value:nm,onChange:e=>setNm(e.target.value),onKeyDown:e=>e.key==='Enter'&&sm(),placeholder:'Diga algo...',style:{flex:1,padding:10,background:'#1a0c03',border:'1px solid #4a2508',borderRadius:5,color:'#fdf8f0'}}),
          React.createElement('button',{onClick:sm,style:{padding:'10px 20px',background:'#8b4f0f',color:'#fdf8f0',border:'none',borderRadius:5,cursor:'pointer',fontFamily:'Georgia,serif'}},'Enviar')
        )
      )
    )
  )
}
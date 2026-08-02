import React,{useState,useEffect}from'react'
import{supabase,signOut}from'../lib/supabase'

export default function Lobby({user,navigate}){
  const[campaigns,setCampaigns]=useState([])
  const[loading,setLoading]=useState(true)
  const[showCreate,setShowCreate]=useState(false)
  const[showJoin,setShowJoin]=useState(false)
  const[search,setSearch]=useState('')
  const[form,setForm]=useState({name:'',password:'',description:'',max_players:6})
  
  useEffect(()=>{
    loadCampaigns()
  },[])
  
  async function loadCampaigns(){
    setLoading(true)
    const{data,error}=await supabase
      .from('campaigns')
      .select('*')
      .eq('is_active',true)
      .order('created_at',{ascending:false})
    
    if(error){
      console.error('Erro ao carregar campanhas:',error)
    }else{
      console.log('Campanhas carregadas:',data)
      setCampaigns(data||[])
    }
    setLoading(false)
  }
  
  async function create(e){
    e.preventDefault()
    const{data,error}=await supabase
      .from('campaigns')
      .insert({
        name:form.name,
        password_hash:form.password,
        description:form.description,
        dm_id:user.id,
        max_players:form.max_players,
        is_active:true
      })
      .select()
      .single()
    
    if(error){
      alert('Erro: '+error.message)
      return
    }
    
    setCampaigns(prev=>[data,...prev])
    setShowCreate(false)
    setForm({name:'',password:'',description:'',max_players:6})
  }
  
  async function join(cid){
    const pass=prompt('Senha da campanha:')
    if(!pass)return
    
    const{data:camp,error}=await supabase
      .from('campaigns')
      .select('*')
      .eq('id',cid)
      .single()
    
    if(error||!camp){
      alert('Campanha não encontrada!')
      return
    }
    
    if(camp.password_hash!==pass){
      alert('Senha incorreta!')
      return
    }
    
    const{data:mc}=await supabase
      .from('characters')
      .select('*')
      .eq('campaign_id',cid)
      .eq('user_id',user.id)
      .single()
    
    if(mc)navigate('campaign',{campaignId:cid})
    else navigate('create-character',{campaignId:cid})
  }
  
  if(loading){
    return React.createElement('div',{style:{minHeight:'100vh',background:'#1a0c03',display:'flex',alignItems:'center',justifyContent:'center'}},
      React.createElement('div',{style:{textAlign:'center'}},
        React.createElement('h1',{style:{fontSize:'4rem'}},'🍺'),
        React.createElement('p',{style:{color:'#8b4f0f'}},'Carregando taverna...')
      )
    )
  }
  
  const page={minHeight:'100vh',background:'#1a0c03'}
  const header={background:'#2d1605',borderBottom:'4px solid #8b4f0f',padding:20}
  const main={maxWidth:1200,margin:'0 auto',padding:20}
  const card={background:'#2d1605',borderRadius:10,border:'2px solid #4a2508',padding:20}
  const input={padding:12,background:'#1a0c03',border:'2px solid #4a2508',borderRadius:5,color:'#fdf8f0',width:'100%',boxSizing:'border-box'}
  
  return React.createElement('div',{style:page},
    React.createElement('header',{style:header},
      React.createElement('div',{style:{maxWidth:1200,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center'}},
        React.createElement('div',null,
          React.createElement('h1',{style:{color:'#d4891a',fontSize:'2rem',fontFamily:'Georgia,serif',margin:0}},'🍺 MAD WARLOCK\'S TAVERN'),
          React.createElement('p',{style:{color:'#8b4f0f',margin:'5px 0 0 0'}},'Bem-vindo, '+(user?.user_metadata?.username||user?.email||'Aventureiro')+'!')
        ),
        React.createElement('button',{onClick:async()=>{await signOut();window.location.reload()},style:{padding:'10px 20px',background:'#4a2508',color:'#fdf8f0',border:'1px solid #8b4f0f',borderRadius:5,cursor:'pointer'}},'Sair')
      )
    ),
    React.createElement('button',{
    onClick:()=>navigate('standalone-character'),
    style:{padding:'10px 20px',background:'#8b4f0f',color:'#fdf8f0',border:'none',borderBottom:'3px solid #4a2508',borderRadius:8,cursor:'pointer',fontFamily:'Georgia,serif',fontSize:14}
  },'📝 Criar Personagem Independente'),
    React.createElement('main',{style:main},
      React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:30}},
        React.createElement('button',{onClick:()=>{setShowCreate(!showCreate);setShowJoin(false)},style:{...card,textAlign:'left',cursor:'pointer',background:showCreate?'#4a2508':'#2d1605',border:showCreate?'3px solid #d4891a':'2px solid #4a2508'}},
          React.createElement('div',{style:{fontSize:'3rem',marginBottom:10}},'👑'),
          React.createElement('h2',{style:{color:'#d4891a',fontFamily:'Georgia,serif',margin:'0 0 5px 0'}},'Ser o Mestre'),
          React.createElement('p',{style:{color:'#8b4f0f',margin:0}},'Crie uma nova campanha')
        ),
        React.createElement('button',{onClick:()=>{setShowJoin(!showJoin);setShowCreate(false)},style:{...card,textAlign:'left',cursor:'pointer',background:showJoin?'#4a2508':'#2d1605',border:showJoin?'3px solid #d4891a':'2px solid #4a2508'}},
          React.createElement('div',{style:{fontSize:'3rem',marginBottom:10}},'⚔️'),
          React.createElement('h2',{style:{color:'#d4891a',fontFamily:'Georgia,serif',margin:'0 0 5px 0'}},'Ser um Herói'),
          React.createElement('p',{style:{color:'#8b4f0f',margin:0}},'Entre em uma aventura')
        )
      ),
      showCreate&&React.createElement('form',{onSubmit:create,style:{...card,marginBottom:20}},
        React.createElement('h3',{style:{color:'#d4891a',fontFamily:'Georgia,serif',marginTop:0}},'📜 Nova Jornada'),
        React.createElement('input',{placeholder:'Nome da Aventura',value:form.name,onChange:e=>setForm({...form,name:e.target.value}),style:{...input,marginBottom:10},required:true}),
        React.createElement('input',{type:'password',placeholder:'Senha Secreta',value:form.password,onChange:e=>setForm({...form,password:e.target.value}),style:{...input,marginBottom:10},required:true}),
        React.createElement('button',{type:'submit',style:{padding:14,background:'#8b4f0f',color:'#fdf8f0',border:'none',borderBottom:'4px solid #4a2508',borderRadius:5,cursor:'pointer',fontFamily:'Georgia,serif',fontSize:16,width:'100%'}},'⚔️ Iniciar Aventura!')
      ),
      showJoin&&React.createElement('div',{style:{...card,marginBottom:20}},
        React.createElement('h3',{style:{color:'#d4891a',fontFamily:'Georgia,serif',marginTop:0}},'🗡️ Encontrar Aventura'),
        React.createElement('input',{placeholder:'Buscar campanhas...',value:search,onChange:e=>setSearch(e.target.value),style:input})
      ),
      React.createElement('h2',{style:{color:'#d4891a',fontFamily:'Georgia,serif'}},'🏰 Aventuras em Andamento'),
      campaigns.length===0?
        React.createElement('div',{style:{...card,textAlign:'center',marginTop:15}},
          React.createElement('p',{style:{color:'#8b4f0f',fontSize:'1.2rem'}},'Nenhuma campanha ativa no momento'),
          React.createElement('p',{style:{color:'#6b7280'}},'Crie uma nova aventura ou peça para seu Mestre!')
        )
      :
        React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:15,marginTop:15}},
          campaigns.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())).map(c=>
            React.createElement('div',{key:c.id,style:card},
              React.createElement('p',{style:{color:'#8b4f0f',fontSize:14,margin:0}},'Campanha • '+new Date(c.created_at).toLocaleDateString()),
              React.createElement('h3',{style:{color:'#fdf8f0',fontFamily:'Georgia,serif',margin:'10px 0'}},c.name),
              React.createElement('p',{style:{color:'#6b7280',fontSize:13,margin:'0 0 10px 0'}},c.description||'Sem descrição'),
              React.createElement('button',{onClick:()=>join(c.id),style:{padding:10,background:'#4a2508',color:'#fdf8f0',border:'1px solid #8b4f0f',borderRadius:5,cursor:'pointer',width:'100%',marginTop:10,fontFamily:'Georgia,serif'}},'🚪 Entrar')
            )
          )
        )
    )
  )
}
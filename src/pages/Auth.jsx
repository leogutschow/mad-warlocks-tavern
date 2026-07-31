import React,{useState}from'react'
import{signUp,signIn}from'../lib/supabase'

export default function Auth({onLogin}){
  const[isLogin,setIsLogin]=useState(true)
  const[email,setEmail]=useState('')
  const[password,setPassword]=useState('')
  const[username,setUsername]=useState('')
  const[error,setError]=useState('')
  const[loading,setLoading]=useState(false)
  
  async function handle(e){
    e.preventDefault()
    setError('')
    setLoading(true)
    try{
      if(isLogin)await signIn(email,password)
      else await signUp(email,password,username)
      onLogin()
    }catch(err){setError(err.message||'Erro')}
    finally{setLoading(false)}
  }
  
  const s={minHeight:'100vh',background:'#1a0c03',display:'flex',alignItems:'center',justifyContent:'center',padding:20}
  const card={background:'#2d1605',borderRadius:10,padding:30,border:'2px solid #8b4f0f',maxWidth:400,width:'100%'}
  const input={padding:12,background:'#1a0c03',border:'2px solid #4a2508',borderRadius:5,color:'#fdf8f0',fontSize:16,width:'100%',marginBottom:10}
  const btn={padding:14,background:'#8b4f0f',color:'#fdf8f0',border:'none',borderBottom:'4px solid #4a2508',borderRadius:5,fontSize:18,cursor:'pointer',fontFamily:'Georgia,serif',width:'100%'}
  
  return React.createElement('div',{style:s},
    React.createElement('div',{style:{textAlign:'center'}},
      React.createElement('div',{style:card},
        React.createElement('div',{style:{textAlign:'center',marginBottom:30}},
          React.createElement('h1',{style:{fontSize:'4rem',margin:0}},'🍺'),
          React.createElement('h1',{style:{color:'#d4891a',fontSize:'2rem',fontFamily:'Georgia,serif',margin:'5px 0'}},"MAD WARLOCK'S"),
          React.createElement('h2',{style:{color:'#b87014',fontSize:'1.5rem',fontFamily:'Georgia,serif',margin:0}},'TAVERN')
        ),
        React.createElement('h3',{style:{color:'#d4891a',textAlign:'center',fontFamily:'Georgia,serif',marginBottom:20}},isLogin?'Entre na Taverna':'Novo Aventureiro'),
        error&&React.createElement('div',{style:{background:'#4a2508',color:'#fdf8f0',padding:10,borderRadius:5,marginBottom:15,border:'1px solid #8b4f0f'}},error),
        React.createElement('form',{onSubmit:handle},
          !isLogin&&React.createElement('input',{type:'text',placeholder:'Nome do Aventureiro',value:username,onChange:e=>setUsername(e.target.value),style:input,required:true}),
          React.createElement('input',{type:'email',placeholder:'Email',value:email,onChange:e=>setEmail(e.target.value),style:input,required:true}),
          React.createElement('input',{type:'password',placeholder:'Senha',value:password,onChange:e=>setPassword(e.target.value),style:input,required:true}),
          React.createElement('button',{type:'submit',disabled:loading,style:{...btn,opacity:loading?0.5:1}},loading?'🕯️ Abrindo portal...':isLogin?'🍺 Entrar na Taverna':'⚔️ Forjar Destino')
        ),
        React.createElement('div',{style:{textAlign:'center',marginTop:20}},
          React.createElement('button',{onClick:()=>setIsLogin(!isLogin),style:{background:'none',border:'none',color:'#8b4f0f',cursor:'pointer',fontSize:14}},isLogin?'🎭 Novo por aqui? Registre-se!':'🗡️ Já tem conta? Faça login!')
        )
      )
    )
  )
}
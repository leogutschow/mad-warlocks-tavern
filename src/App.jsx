import React,{useState,useEffect}from'react'
import{onAuthChange}from'./lib/supabase'
import Auth from'./pages/Auth'
import Lobby from'./pages/Lobby'
import CharacterCreation from'./pages/CharacterCreation'
import CharacterSheet from'./pages/CharacterSheet'
import CampaignRoom from'./pages/CampaignRoom'

export default function App(){
  const[user,setUser]=useState(null)
  const[loading,setLoading]=useState(true)
  const[page,setPage]=useState('lobby')
  const[params,setParams]=useState({})
  
  useEffect(()=>{
    const{data}=onAuthChange(u=>{setUser(u);setLoading(false)})
    return()=>data?.subscription?.unsubscribe()
  },[])
  
  function nav(pg,pr={}){setPage(pg);setParams(pr)}
  
  if(loading)return React.createElement('div',{style:{minHeight:'100vh',background:'#1a0c03',display:'flex',alignItems:'center',justifyContent:'center'}},React.createElement('h1',{style:{fontSize:'4rem'}},'🍺'))
  if(!user)return React.createElement(Auth,{onLogin:()=>setPage('lobby')})
  
  return React.createElement('div',null,
    page==='lobby'&&React.createElement(Lobby,{user,navigate:nav}),
    page==='create-character'&&React.createElement(CharacterCreation,{user,navigate:nav,campaignId:params.campaignId}),
    page==='character-sheet'&&React.createElement(CharacterSheet,{user,navigate:nav,characterId:params.characterId,campaignId:params.campaignId}),
    page==='campaign'&&React.createElement(CampaignRoom,{user,navigate:nav,campaignId:params.campaignId})
  )
}
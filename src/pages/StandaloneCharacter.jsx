import React from 'react'
import CharacterCreation from './CharacterCreation'

export default function StandaloneCharacter({ user, navigate }) {
  return React.createElement(CharacterCreation, { 
    user, 
    navigate, 
    campaignId: null, 
    isStandalone: true 
  })
}
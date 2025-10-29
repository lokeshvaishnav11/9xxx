import React, { useState } from 'react'
import { MouseEvent } from 'react'
// import { useNavigateCustom } from '../_layout/elements/custom-link'

const oddsone = () => {
 
  return (
  <iframe
                style={{ width: '100%', height: '250px' }}
                // src={`${tvUrl}${currentMatch?.matchId}`}
                src={`https://livestream-v3-iframe.akamaized.uk/?eventid=34698690}`}
              ></iframe>
  )
}

export default oddsone

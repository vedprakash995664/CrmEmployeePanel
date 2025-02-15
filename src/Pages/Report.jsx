import React, { useEffect } from 'react'
import Dashboard from '../Components/Dashboard'
import { useNavigate } from 'react-router-dom';
function Report() {
  const navigate=useNavigate()
    useEffect(()=>{
      const tokenId=sessionStorage.getItem('Token');
      if(!tokenId){
        navigate('/')
      }
  
    },[navigate])
  return (
    <div>
      <Dashboard active={'report'}>
        This Page is Under Constructions
      </Dashboard>
    </div>
  )
}

export default Report

import React, { useEffect, useState } from 'react'
import Dashboard from '../Components/Dashboard';
import DynamicTable from '../Components/DynmicTables';
import DynamicCard from '../Components/DynamicCard'
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeads } from '../Features/LeadSlice';
function NegativeLead() {

  const [tableTitle, setTableTitle] = useState('Negative Lead')

  const dispatch = useDispatch();
  const leads = useSelector((state) => state.leads.leads);
  const filteredData=leads.filter((item)=>item.closed===false && item.deleted===false && item.negative===true)

  useEffect(() => {
    dispatch(fetchLeads());
  }, [dispatch]);
  return (
    <>
      <Dashboard active={'negative'}>
      <div className="lead-table-container">
            <DynamicTable className='dynamicTable' lead={filteredData} TableTitle={tableTitle} />
          </div> 
          <div className='lead-card-container'>
            <DynamicCard leadCard={filteredData} TableTitle={tableTitle} />
          </div>



      </Dashboard>
    </>
  )
}

export default NegativeLead;

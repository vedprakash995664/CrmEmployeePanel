import React, { useEffect, useState } from 'react'
import Dashboard from '../Components/Dashboard'
import DynamicTable from '../Components/DynmicTables';
import DynamicCard from '../Components/DynamicCard'
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeads } from '../Features/LeadSlice';

function ClosedLead() {
  const [tableTitle, setTableTitle] = useState('Closed Lead')

  const dispatch = useDispatch();
  const leads = useSelector((state) => state.leads.leads);
  const filteredData=leads.filter((item)=>item.closed===true && item.deleted===false && item.negative===false)

  useEffect(() => {
    dispatch(fetchLeads());
  }, [dispatch]);

  return (
    <>
      <Dashboard active={'closedLead'}>
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

export default ClosedLead

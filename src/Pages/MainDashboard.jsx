import React, { useEffect, useState } from 'react'
import Dashboard from '../Components/Dashboard';
import { LineChart } from '@mui/x-charts/LineChart';
import DynamicTable from '../Components/DynmicTables';
import './CSS/MainDashboard.css'
import { useNavigate } from 'react-router-dom';
import DynamicCard from '../Components/DynamicCard';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllFollowUps, fetchLeads } from '../Features/LeadSlice';

function MainDashboard() {
  const [tableData, setTableData] = useState([]);
  const [tableTitle, setTableTitle] = useState('Today Reminders')
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const followUps = useSelector((state) => state.leads.followups);  
  const today = new Date().toISOString().split("T")[0]
  const leadFinaldata = followUps.followups?.filter((item) => item.nextFollowupDate?.split("T")[0] === today)
  const finalData = leadFinaldata?.map((item) => item.leadId)
  const leads = useSelector((state) => state.leads.leads);
  const filteredData=leads.filter((item)=>item.closed===false && item.deleted===false && item.negative===false)
  

  const leadFinaldataforMissed=followUps.followups?.filter((item)=>item.nextFollowupDate?.split("T")[0]<today)
  const Missed=leadFinaldataforMissed?.map((item)=>item.leadId)
useEffect(() => {
  dispatch(fetchAllFollowUps());
        dispatch(fetchLeads()); 
}, [dispatch]);
  useEffect(() => {
    const tokenId = sessionStorage.getItem('Token');
    if (!tokenId) {
      navigate('/')
    }

  }, [navigate])
  return (
    <>
      <Dashboard active={'dashboard'}>
        <div className="main-dashboard-container">
          <div className="main-dashboard-outer">
            <div className="main-dashboard-top">
              <div className="main-top-1">
                <div className="chart">
                  <span>Data</span>
                  <LineChart
                    xAxis={[{ data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }]}
                    series={[
                      {
                        data: [2, 3, 5.5, 8.5, 1.5, 5, 1, 4, 3, 8],
                        showMark: ({ index }) => index % 2 === 0,
                      },

                    ]}
                  />
                </div>
              </div>
              <div className="main-top-2">
                <div className="main-top-2-card1">
                  <h4>Missed Leads</h4>
                  <h1 >{Missed?.length || 0}</h1>
                </div>
                <div className="main-top-2-card2">
                  <h4>Total Leads</h4>
                  <h1 >{filteredData?.length || 0}</h1>
                </div>
              </div>
            </div>
            <div className="main-dashboard-bottom">
              <div className='main-table-container'>
                <DynamicTable lead={finalData} TableTitle={tableTitle} />
              </div>
            </div>
            <div className='main-card-container'>
              <DynamicCard leadCard={finalData} TableTitle={tableTitle} />
            </div>  
          </div>
        </div>
      </Dashboard>
    </>
  )
}

export default MainDashboard

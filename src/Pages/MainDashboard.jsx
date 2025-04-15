import React, { useEffect, useState } from 'react';
import Dashboard from '../Components/Dashboard';
import DynamicTable from '../Components/DynmicTables';
import './CSS/MainDashboard.css';
import { useNavigate } from 'react-router-dom';
import DynamicCard from '../Components/DynamicCard';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllFollowUps, fetchLeads } from '../Features/LeadSlice';

import { FaCalendarCheck, FaUserTimes, FaBell, FaThumbsDown } from 'react-icons/fa';

function MainDashboard() {
  const [tableTitle, setTableTitle] = useState('Today Reminders');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const followUps = useSelector((state) => state.leads.followups);
  const leads = useSelector((state) => state.leads.leads);

  const today = new Date().toISOString().split("T")[0];
  
  const todayFollowUps = followUps.followups?.filter(
    (item) => item.nextFollowupDate?.split("T")[0] === today
  );
  const todayLeads = todayFollowUps?.map((item) => item.leadId);

  const missedFollowUps = followUps.followups?.filter(
    (item) => item.nextFollowupDate?.split("T")[0] < today
  );
  const missedLeads = missedFollowUps?.map((item) => item.leadId);

  const closedLeads = leads.filter((item) => item.closed && !item.deleted);
  const negativeLeads = leads.filter((item) => item.negative && !item.deleted);

  // Calculate total leads (for all time)
  const totalLeads = leads.filter((item) => !item.deleted); // Only include non-deleted leads

  useEffect(() => {
    dispatch(fetchAllFollowUps());
    dispatch(fetchLeads());
  }, [dispatch]);

  useEffect(() => {
    const tokenId = sessionStorage.getItem('Token');
    if (!tokenId) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <Dashboard active={'dashboard'}>
      <div className="main-dashboard-container">
        <div className="main-dashboard-outer">

          {/* Top cards section */}
          <div className="card-row">
            <div className="dashboard-card">
              <div className="card-icon"><FaCalendarCheck /></div>
              <div className="card-content">
                <h4>Total Leads</h4>
                <h1>{(totalLeads.length > 0) ?  totalLeads?.length : <div className="circle-loader"></div>}</h1> {/* Display total leads */}
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-icon"><FaUserTimes /></div>
              <div className="card-content">
                <h4>Missed Leads</h4>
                <h1>{(totalLeads.length > 0) ?  missedLeads?.length : <div className="circle-loader"></div>}</h1>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-icon"><FaBell /></div> {/* Changed icon to a bell */}
              <div className="card-content">
                <h4>Today Reminders</h4>
                <h1>{(totalLeads.length > 0) ?  todayFollowUps?.length : <div className="circle-loader"></div>}</h1> {/* Display reminders (today's follow-ups) */}
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-icon"><FaThumbsDown /></div>
              
              <div className="card-content">
                <h4>Negative Leads</h4>
                <h1>{(totalLeads.length > 0) ? negativeLeads?.length : <div className="circle-loader"></div>}</h1>
              </div>
            </div>
          </div>

          {/* Table and mobile card section */}
          <div className="main-dashboard-bottom">
            <div className='main-table-container'>
              <DynamicTable lead={todayLeads} TableTitle={tableTitle} />
            </div>
          </div>

          <div className='main-card-container'>
            <DynamicCard leadCard={todayLeads} TableTitle={tableTitle} />
          </div>

        </div>
      </div>
    </Dashboard>
  );
}

export default MainDashboard;

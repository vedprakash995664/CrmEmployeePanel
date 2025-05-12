import React, { useEffect, useState } from 'react';
import Dashboard from '../Components/Dashboard';
import DynamicTable from '../Components/DynmicTables';
import './CSS/MainDashboard.css';
import { useNavigate } from 'react-router-dom';
import DynamicCard from '../Components/DynamicCard';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllFollowUps, fetchLeads } from '../Features/LeadSlice';
import Modal from '../Components/LeadForm';
import { 
  FaUser, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaCalendarAlt, 
  FaChartLine, 
  FaClock, 
  FaBell, 
  FaUserPlus 
} from 'react-icons/fa';

function MainDashboard() {
  const [tableTitle, setTableTitle] = useState('Today Reminders');
    const [leadData, setLeadData] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
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

  const closedLeads = leads.filter((item) => item.closed && !item.deleted && !item.negative);
  const negativeLeads = leads.filter((item) => item.negative && !item.deleted  && !item.closed);

  // Calculate total leads (for all time)
  const totalLeads = leads.filter((item) => !item.deleted); // Only include non-deleted leads
  
  // Calculate completion rate
  const completionRate = totalLeads.length > 0 
    ? Math.round((closedLeads.length / totalLeads.length) * 100) 
    : 0;

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
   const openModal = () => {
    setIsModalOpen(true);
  };
  
    const closeModal = () => {
    setIsModalOpen(false);
  };
  const handleAddNew = () => {
    // Close sidebar when opening the modal
    setLeadData({});
    openModal();
  };
  return (
    <Dashboard active={'dashboard'}>
      <div className="main-dashboard-container">
        <div className="main-dashboard-outer">

          {/* Top cards section - first row */}
          <div className="card-row">
    {/* Add New Lead Card */}
            <div className="dashboard-card add-lead-card" onClick={handleAddNew}>
              <div className="card-content">
                <h4>Add New Lead</h4>
                <div className="number-container add-lead-container">
                  <div className="card-icon add-icon">
                    <FaUserPlus />
                  </div>
                </div>
                <div className="card-description">
                  Create a new lead entry
                </div>
                <button className="add-lead-button">Add Lead</button>
              </div>
            </div>
 {/* Missed Leads Card */}
            <div className="dashboard-card missed-card" onClick={()=>navigate('/missedLeads')}>
              <div className="card-content">
                <h4>Missed Leads</h4>
                <div className="number-container">
                  <div className="card-icon">
                    <FaClock />
                  </div>
                  <h1>{(totalLeads.length > 0) ? missedLeads?.length : <div className="circle-loader"></div>}</h1>
                </div>
                <div className="card-description">
                  Overdue follow-ups
                </div>
              </div>
            </div>

 {/* Today Reminders Card */}
            <div className="dashboard-card reminder-card" onClick={()=>navigate('/todayRminders')}>
              <div className="card-content">
                <h4>Today's Reminders</h4>
                <div className="number-container">
                  <div className="card-icon">
                    <FaBell />
                  </div>
                  <h1>{(totalLeads.length > 0) ? todayFollowUps?.length : <div className="circle-loader"></div>}</h1>
                </div>
                <div className="card-description">
                  Today's scheduled tasks
                </div>
              </div>
            </div>
    {/* Assigned Leads Card */}
            <div className="dashboard-card assigned-card" onClick={()=>navigate('/leads')}>
              <div className="card-content">
                <h4>Assigned Leads</h4>
                <div className="number-container">
                  <div className="card-icon">
                    <FaUser />
                  </div>
                  <h1>{(totalLeads.length > 0) ? totalLeads.length : <div className="circle-loader"></div>}</h1>
                </div>
                <div className="card-description">
                  Total leads assigned to you
                </div>
              </div>
            </div>
          </div>

      

          {/* Second row of cards */}
          <div className="card-row">
           
            
       

       
            {/* Completed Leads Card */}
            <div className="dashboard-card closed-card" onClick={()=>navigate('/closed')}>
              <div className="card-content">
                <h4>Completed Leads</h4>
                <div className="number-container">
                  <div className="card-icon">
                    <FaCheckCircle />
                  </div>
                  <h1>{(totalLeads.length > 0) ? closedLeads.length : <div className="circle-loader"></div>}</h1>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{width: `${completionRate}%`}}></div>
                </div>
                <div className="card-description">
                  {completionRate}% completion rate
                </div>
              </div>
            </div>

            {/* Negative Leads Card */}
            <div className="dashboard-card negative-card" onClick={()=>navigate('/negative')}>
              <div className="card-content">
                <h4>Negative Leads</h4>
                <div className="number-container">
                  <div className="card-icon">
                    <FaExclamationTriangle />
                  </div>
                  <h1>{(totalLeads.length > 0) ? negativeLeads.length : <div className="circle-loader"></div>}</h1>
                </div>
                <div className="card-description">
                  Unsuccessful conversions
                </div>
              </div>
            </div>
            
          
        
          </div>

          {/* Table and mobile card section */}
          {/* <div className="main-dashboard-bottom">
            <div className="table-title">
              <h2>{tableTitle}</h2>
            </div>
            <div className='main-table-container'>
              <DynamicTable lead={todayLeads} TableTitle={tableTitle} />
            </div>
          </div>

          <div className='main-card-container'>
            <DynamicCard leadCard={todayLeads} TableTitle={tableTitle} />
          </div> */}

        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title="Add New Lead" 
        buttonTitle="Add Lead" 
        leadData={leadData}
      />
    </Dashboard>
  );
}

export default MainDashboard;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Dashboard from '../Components/Dashboard';
import Modal from '../Components/LeadForm';
import { fetchAllFollowUps, fetchLeads } from '../Features/LeadSlice';

import {
  FaUser,
  FaCheckCircle,
  FaExclamationTriangle,
  FaBell,
  FaClock,
  FaUserPlus
} from 'react-icons/fa';

import './CSS/MainDashboard.css';

function MainDashboard() {
  const [tableTitle, setTableTitle] = useState('Today Reminders');
  const [leadData, setLeadData] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const followUps = useSelector((state) => state.leads.followups);
  const leads = useSelector((state) => state.leads.leads);

  const today = new Date().toISOString().split("T")[0];

  // Filter: Today FollowUps
  const todayFollowUps = followUps.followups?.filter(
    (item) => item.nextFollowupDate?.split("T")[0] === today
  );
  const todayLeads = todayFollowUps?.map((item) => item.leadId);

  // Filter: Missed FollowUps (past date & active leads)
  const missedFollowUps = followUps.followups?.filter(
    (item) => item.nextFollowupDate?.split("T")[0] < today
  );

  const missedLeads = missedFollowUps
    ?.filter(item =>
      item.leadId &&
      item.leadId.deleted === false &&
      item.leadId.closed === false &&
      item.leadId.negative === false
    )
    .map(item => item.leadId);

  // Filter: Lead Status
  const closedLeads = leads.filter((item) => item.closed && !item.deleted && !item.negative);
  const negativeLeads = leads.filter((item) => item.negative && !item.deleted && !item.closed);
  const totalLeads = leads.filter((item) => !item.deleted);

  const completionRate = totalLeads.length > 0
    ? Math.round((closedLeads.length / totalLeads.length) * 100)
    : 0;

  useEffect(() => {
    dispatch(fetchAllFollowUps());
    dispatch(fetchLeads());
  }, [dispatch]);

  useEffect(() => {
    const tokenId = localStorage.getItem('Token');
    if (!tokenId) navigate('/');
  }, [navigate]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleAddNew = () => {
    setLeadData({});
    openModal();
  };

  return (
    <Dashboard active="dashboard">
      <div className="main-dashboard-container">
        <div className="main-dashboard-outer">

          {/* Row 1 Cards */}
          <div className="card-row">

            {/* Add New Lead */}
            <div className="dashboard-card add-lead-card" onClick={handleAddNew}>
              <div className="card-content">
                <h4>Add New Lead</h4>
                <div className="number-container add-lead-container">
                  <div className="card-icon add-icon"><FaUserPlus /></div>
                </div>
                <div className="card-description">Create a new lead entry</div>
                <button className="add-lead-button">Add Lead</button>
              </div>
            </div>

            {/* Missed Leads */}
            <div className="dashboard-card missed-card" onClick={() => navigate('/missedLeads')}>
              <div className="card-content">
                <h4>Missed Leads</h4>
                <div className="number-container">
                  <div className="card-icon"><FaClock /></div>
                  <h1>{(totalLeads.length > 0) ? missedLeads?.length : <div className="circle-loader"></div>}</h1>
                </div>
                <div className="card-description">Overdue follow-ups</div>
              </div>
            </div>

            {/* Today's Reminders */}
            <div className="dashboard-card reminder-card" onClick={() => navigate('/todayRminders')}>
              <div className="card-content">
                <h4>Today's Reminders</h4>
                <div className="number-container">
                  <div className="card-icon"><FaBell /></div>
                  <h1>{(totalLeads.length > 0) ? todayFollowUps?.length : <div className="circle-loader"></div>}</h1>
                </div>
                <div className="card-description">Today's scheduled tasks</div>
              </div>
            </div>

            {/* Assigned Leads */}
            <div className="dashboard-card assigned-card" onClick={() => navigate('/leads')}>
              <div className="card-content">
                <h4>Assigned Leads</h4>
                <div className="number-container">
                  <div className="card-icon"><FaUser /></div>
                  <h1>{(totalLeads.length > 0) ? totalLeads.length : <div className="circle-loader"></div>}</h1>
                </div>
                <div className="card-description">Total leads assigned to you</div>
              </div>
            </div>
          </div>

          {/* Row 2 Cards */}
          <div className="card-row">

            {/* Completed Leads */}
            <div className="dashboard-card closed-card" onClick={() => navigate('/closed')}>
              <div className="card-content">
                <h4>Completed Leads</h4>
                <div className="number-container">
                  <div className="card-icon"><FaCheckCircle /></div>
                  <h1>{(totalLeads.length > 0) ? closedLeads.length : <div className="circle-loader"></div>}</h1>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${completionRate}%` }}></div>
                </div>
                <div className="card-description">{completionRate}% completion rate</div>
              </div>
            </div>

            {/* Negative Leads */}
            <div className="dashboard-card negative-card" onClick={() => navigate('/negative')}>
              <div className="card-content">
                <h4>Negative Leads</h4>
                <div className="number-container">
                  <div className="card-icon"><FaExclamationTriangle /></div>
                  <h1>{(totalLeads.length > 0) ? negativeLeads.length : <div className="circle-loader"></div>}</h1>
                </div>
                <div className="card-description">Unsuccessful conversions</div>
              </div>
            </div>
          </div>

          {/* Optional: Table & Mobile Cards (currently commented) */}
          {/* 
          <div className="main-dashboard-bottom">
            <div className="table-title">
              <h2>{tableTitle}</h2>
            </div>
            <div className="main-table-container">
              <DynamicTable lead={todayLeads} TableTitle={tableTitle} />
            </div>
          </div>
          <div className="main-card-container">
            <DynamicCard leadCard={todayLeads} TableTitle={tableTitle} />
          </div>
          */}

        </div>
      </div>

      {/* Lead Modal */}
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

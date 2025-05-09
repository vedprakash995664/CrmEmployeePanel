import React, { useEffect, useState } from 'react';
import Dashboard from '../Components/Dashboard';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Card } from 'primereact/card';
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';

import './CSS/Report.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeads } from '../Features/LeadSlice';
import axios from 'axios';

function Report() {
  const navigate = useNavigate();
  const APi_Url = import.meta.env.VITE_API_URL;
  const dispatch = useDispatch();
  const [followupData, setFollowUpData] = useState([]);

  const leads = useSelector((state) => state.leads.leads);
  const filteredData = leads.filter((item) => item);

  const closedLeads = leads.filter((lead) => lead.closed === true);
  const NegativeLeads = leads.filter((lead) => lead.negative === true);

  const currentEmployeeId = sessionStorage.getItem('employeeId');

  const fetchFollowUps = async () => {
    const response = await axios.get(
      `${APi_Url}/digicoder/crm/api/v1/followup/getfollowedby/${currentEmployeeId}`
    );
    setFollowUpData(response.data.followups);
  };

  const uniqueTagNames = [
    ...new Set(
      filteredData
        .map((item) => item.tags || [])
        .flat()
        .map((tag) => tag.tagName)
        .filter((tagName) => tagName)
    )
  ];

  const today = new Date().toISOString().split('T')[0];
  const followups = followupData.map((item) => item.createdAt);
  const matchedFollowups = followups.filter((createdAt) => {
    const createdDate = new Date(createdAt).toISOString().split('T')[0];
    return createdDate === today;
  });

  const Totalfollowups = followupData.map((item) => item);

  // ✅ NEW LOGIC FOR ACCURATE PENDING LEADS CALCULATION
  const assignedLeads = filteredData.map(
    (lead) =>
      lead.leadAssignedTo === currentEmployeeId &&
      !lead.closed &&
      !lead.deleted
  );

  const followedLeadIds = new Set(followupData.map((f) => f.leadId));

  const pendingLeads = assignedLeads.filter(
    (lead) => !followedLeadIds.has(lead._id)
  );

  useEffect(() => {
    fetchFollowUps();
  }, []);

  useEffect(() => {
    const tokenId = sessionStorage.getItem('Token');
    if (!tokenId) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    dispatch(fetchLeads());
  }, [dispatch]);

  const [visible, setVisible] = useState(false);
  const footerContent = (
    <div>
      <Button
        label="Close"
        icon="pi pi-times"
        onClick={() => setVisible(false)}
        className="p-button-text"
      />
    </div>
  );

  const completionPercentage =
    filteredData.length > 0
      ? Math.round((closedLeads.length / filteredData.length) * 100)
      : 0;

  return (
    <div>
      <Dashboard active={'report'}>
        <div className="report-header">
          <h1>Employee Performance Dashboard</h1>
          <Button
            label="View Assigned Tags"
            icon="pi pi-tags"
            onClick={() => setVisible(true)}
            className="tags-button"
          />
        </div>

        <div className="metrics-grid">
          {/* Assigned Leads Card */}
          <Card className="metric-card">
            <div className="metric-content">
              <i className="pi pi-users metric-icon"></i>
              <div className="metric-details">
                <span className="metric-title">Assigned Leads</span>
                <span className="metric-value">{filteredData.length}</span>
                <span className="metric-description">
                  Total leads assigned to you
                </span>
              </div>
            </div>
          </Card>

          {/* Completed Leads Card */}
          <Card className="metric-card success">
            <div className="metric-content">
              <i className="pi pi-check-circle metric-icon"></i>
              <div className="metric-details">
                <span className="metric-title">Completed Leads</span>
                <span className="metric-value">{closedLeads.length}</span>
                <ProgressBar
                  value={completionPercentage}
                  showValue={false}
                  className="progress-bar"
                />
                <span className="metric-description">
                  {completionPercentage}% completion rate
                </span>
              </div>
            </div>
          </Card>

          {/* Negative Leads Card */}
          <Card className="metric-card warning">
            <div className="metric-content">
              <i className="pi pi-exclamation-triangle metric-icon"></i>
              <div className="metric-details">
                <span className="metric-title">Negative Leads</span>
                <span className="metric-value">{NegativeLeads.length}</span>
                <span className="metric-description">Unsuccessful conversions</span>
              </div>
            </div>
          </Card>

          {/* Today's Work Card */}
          <Card className="metric-card info">
            <div className="metric-content">
              <i className="pi pi-calendar metric-icon"></i>
              <div className="metric-details">
                <span className="metric-title">Today's Follow-ups</span>
                <span className="metric-value">{matchedFollowups.length}</span>
                <span className="metric-description">Actions completed today</span>
              </div>
            </div>
          </Card>

          {/* Total Work Card */}
          <Card className="metric-card primary">
            <div className="metric-content">
              <i className="pi pi-chart-line metric-icon"></i>
              <div className="metric-details">
                <span className="metric-title">Total Follow-ups</span>
                <span className="metric-value">{Totalfollowups.length}</span>
                <span className="metric-description">All your activities</span>
              </div>
            </div>
          </Card>

          {/* Pending Leads Card (Fixed) */}
          <Card className="metric-card danger">
            <div className="metric-content">
              <i className="pi pi-clock metric-icon"></i>
              <div className="metric-details">
                <span className="metric-title">Pending Leads</span>
                <span className="metric-value">{pendingLeads.length}</span>
                <span className="metric-description">Requiring attention</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Tag Viewer Dialog */}
        <Dialog
          header="Your Assigned Tags"
          visible={visible}
          style={{ width: '50vw' }}
          onHide={() => setVisible(false)}
          footer={footerContent}
        >
          <div className="tags-container">
            {uniqueTagNames.map((tag, index) => (
              <Tag
                key={index}
                value={tag}
                className="tag-item"
                severity={getRandomSeverity()}
              />
            ))}
          </div>
        </Dialog>
      </Dashboard>
    </div>
  );
}

// Random tag color utility
function getRandomSeverity() {
  const severities = ['success', 'info', 'warning', 'danger'];
  return severities[Math.floor(Math.random() * severities.length)];
}

export default Report;

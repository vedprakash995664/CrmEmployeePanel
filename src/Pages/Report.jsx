import React, { useEffect, useState } from 'react'
import Dashboard from '../Components/Dashboard'
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

import './CSS/Report.css'
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeads } from '../Features/LeadSlice';
import axios from 'axios';
function Report() {
  const navigate = useNavigate()
  const APi_Url = import.meta.env.VITE_API_URL
  const dispatch = useDispatch();
  const [followupData, setFollowUpData] = useState([])
  const leads = useSelector((state) => state.leads.leads);
  const filteredData = leads.filter((item) => item)

  const closedLeads = leads.filter((lead) => lead.closed === true);
  const NegativeLeads = leads.filter((lead) => lead.negative === true);
  const currentEmployeeId = sessionStorage.getItem('employeeId')
  const fetchFollowUps = async () => {
    const response = await axios.get(`${APi_Url}/digicoder/crm/api/v1/followup/getfollowedby/${currentEmployeeId}`)
    setFollowUpData(response.data.followups)
  }

  const uniqueTagNames = [
    ...new Set(
      filteredData
        .map(item => item.tags || [])       
        .flat()                             
        .map(tag => tag.tagName)            
        .filter(tagName => tagName)         
    )
  ];

  const today = new Date().toISOString().split('T')[0]; // Get today's date in 'YYYY-MM-DD'

  const followups = followupData.map(item => item.createdAt);

  // Filter or compare based on just the date
  const matchedFollowups = followups.filter(createdAt => {
    const createdDate = new Date(createdAt).toISOString().split('T')[0];
    return createdDate === today;
  });
  const Totalfollowups = followupData.map((item) => item)
  
  // Calculate pending leads and ensure they don't go below zero
  let FinalPending = filteredData.length - Totalfollowups.length
  if(FinalPending < 0){
    FinalPending = 0
  }

  useEffect(() => {
    fetchFollowUps();
  }, [])
  useEffect(() => {
    const tokenId = sessionStorage.getItem('Token');
    if (!tokenId) {
      navigate('/')
    }

  }, [navigate])

  // Fetch lead data on component mount
  useEffect(() => {
    dispatch(fetchLeads());
  }, [dispatch]);

  const [visible, setVisible] = useState(false);
  const footerContent = (
    <div>
      <Button label="Close" icon="pi pi-times" onClick={() => setVisible(false)} className="p-button-text" />
    </div>
  );
  return (
    <div>
      <Dashboard active={'report'}>
        <div className="report-title">
          <span>EMPLOYEE REPORT</span>
          <Button label="Assigned Tags" icon="pi pi-external-link" onClick={() => setVisible(true)} className="AssignedTagsBtn" />
        </div>
        <div className="report-bottom">
          <div className="report-card1">
            <div className="report-card11">
              <i className="ri-information-2-fill"></i>
            </div>
            <div className="report-card12">
              <span>Assigned Leads</span>
              <p>{filteredData.length}</p>
            </div>
          </div>
          <div className="report-card1" style={{ backgroundColor: "#3454D1", color: "white" }}>
            <div className="report-card11">
              <i className="ri-verified-badge-fill" style={{ color: "white" }}></i>
            </div>
            <div className="report-card12">
              <span style={{ color: "white" }}>Completed Leads</span>
              <p style={{ color: "white" }}>{closedLeads.length}</p>
            </div>
          </div>
          <div className="report-card1" style={{ backgroundColor: "#3454D1" }}>
            <div className="report-card11">
              {/* <PendingActionsIcon style={{ fontSize: "100px", color: "white" }} /> */}
            </div>
            <div className="report-card12">
              <span style={{ color: "white" }}>Pending Leads</span>
              <p style={{ color: "white" }}>{FinalPending}</p>
            </div>
          </div>
          <div className="report-card1">
            <div className="report-card11">
              {/* <UnpublishedIcon style={{ fontSize: "100px" }} /> */}
            </div>
            <div className="report-card12">
              <span>Negative Leads</span>
              <p>{NegativeLeads.length}</p>
            </div>
          </div>
          <div className="report-card1">
            <div className="report-card11">
              {/* <UnpublishedIcon style={{ fontSize: "100px" }} /> */}
            </div>
            <div className="report-card12">
              <span>Today's Work</span>
              <p>{matchedFollowups.length}</p>
            </div>
          </div>

          <div className="report-card1" style={{ backgroundColor: "#3454D1" }}>
            <div className="report-card11">
              {/* <PendingActionsIcon style={{ fontSize: "100px", color: "white" }} /> */}
            </div>
            <div className="report-card12">
              <span style={{ color: "white" }}>Total Work</span>
              <p style={{ color: "white" }}>{Totalfollowups.length}</p>
            </div>
          </div>
        </div>

        <Dialog className="AssignedTagsContainer" header="Assigned Tags" visible={visible} onHide={() => { if (!visible) return; setVisible(false); }} footer={footerContent}>
          <div className="m-0 tagsOuter">
            {uniqueTagNames.map((tag, index) => (
              <div key={index} className="badge  me-1 AssignedTags">
                {tag}
              </div>
            ))}
          </div>
        </Dialog>
      </Dashboard>
    </div>
  )
}

export default Report
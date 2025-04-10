import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios for API calls
import DynamicTable from '../Components/DynmicTables';
import Modal from '../Components/LeadForm';
import Dashboard from '../Components/Dashboard';
import './CSS/Lead.css';
import DynamicCard from '../Components/DynamicCard';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeads } from '../Features/LeadSlice';

function Leads() {
  const [isModalOpen, setIsModalOpen] = useState(false);  

  const [title, setTitle] = useState('');
  const [buttonTitle, setButtonTitle] = useState('');
  const navigate = useNavigate();
  const [tableTitle, setTableTitle] = useState('Total Leads');
  const dispatch = useDispatch();
  const leads = useSelector((state) => state.leads.leads);
  const filteredData=leads.filter((item)=>item.closed===false && item.deleted===false && item.negative===false)
  
  useEffect(() => {
    const tokenId = sessionStorage.getItem('Token');
    if (!tokenId) {
      navigate('/');
    }
  }, [navigate]);



    // Fetch lead data on component mount
    useEffect(() => {
      dispatch(fetchLeads()); 
    }, [dispatch]);

  const openModal = (isEdit) => {
    setEditMode(isEdit);
    setTitle(isEdit ? "Update Leads" : "Add New Lead");
    setButtonTitle(isEdit ? "Update Lead" : "Add Lead");
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };
  const handleAddNew = () => {
    openModal(false);
    setLeadData({});
  };

  return (
    <div>
      <Dashboard active={'lead'}>
        <div className="content">
          {/* <div className="lead-header">
            <div className="lead-Add-btn">
              <button onClick={handleAddNew}>Add New</button>
            </div>
          </div> */}

          {/* Table Section */}
          <div className="lead-table-container">
            <DynamicTable className='dynamicTable' lead={filteredData} TableTitle={tableTitle} />
          </div> 
          <div className='lead-card-container'>
            <DynamicCard leadCard={filteredData} TableTitle={tableTitle} />
          </div>

          {/* Modal component */}
          <Modal isOpen={isModalOpen} onClose={closeModal} title={title} buttonTitle={buttonTitle} leadData={filteredData} />

          {/* Conditional rendering for sticky note */}
        
        </div>
      </Dashboard>
    </div>
  );
}

export default Leads;

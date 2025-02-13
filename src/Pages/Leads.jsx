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
  const [searchQuery, setSearchQuery] = useState('');
  const [note, setNote] = useState('');
  const [isNoteVisible, setIsNoteVisible] = useState(false); 
  const [stickyNote, setStickyNote] = useState('');

  const [title, setTitle] = useState(''); 
  const [isEditMode, setEditMode] = useState(false);
  const [buttonTitle, setButtonTitle] = useState('');
  const [leadData, setLeadData] = useState([]); 
  const navigate = useNavigate();
  const [tableTitle, setTableTitle] = useState('Total Leads');
  const user = 'Ved Prakash';
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

  const [dropdownActive, setDropdownActive] = useState(false); 
    const toggleDropdown = () => {
      setDropdownActive(!dropdownActive);
    };
  const [isScheduled, setIsScheduled] = useState(false); 

  const label = { inputProps: { 'aria-label': 'Switch demo' } };

  // Handle the switch toggle to show date input
  const handleSwitchChange = (event) => {
    setIsScheduled(event.target.checked); // Update the state based on switch value
  };




  const closeModal = () => {
    setIsModalOpen(false);
    window.location.reload()
  };

  // Handle edit leads
  const handleEdit = (lead) => {
    openModal(true);
    setLeadData(lead);
  };

  const handleAddNew = () => {
    openModal(false);
    setLeadData({});
  };

  const handleView = (lead) => {
    const viewData = lead;
    navigate('fullLeads', { state: { viewData } });
  };

  return (
    <div>
      <Dashboard active={'lead'}>
        <div className="content">
          <div className="lead-header">
            <div className="lead-Add-btn">
              <button onClick={handleAddNew}>Add New</button>
            </div>
          </div>

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

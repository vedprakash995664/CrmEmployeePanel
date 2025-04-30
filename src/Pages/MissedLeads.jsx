import React, { useState, useEffect } from 'react'
import Dashboard from '../Components/Dashboard';
import DynamicTable from '../Components/DynmicTables';
import Modal from '../Components/LeadForm';
import './CSS/MissedLeads.css'
import { useNavigate } from 'react-router-dom';
import DynamicCard from '../Components/DynamicCard';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllFollowUps } from '../Features/LeadSlice';

function MissedLeads() {
  const [isNoteVisible, setIsNoteVisible] = useState(false);
  const [stickyNote, setStickyNote] = useState('');
  const [title, setTitle] = useState('');
  const [buttonTitle, setButtonTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leadData, setLeadData] = useState([]);
  const [tableTitle, setTableTitle] = useState('Missed Leads')
  const navigate = useNavigate()
  const user = 'Ved Prakash';
  const dispatch = useDispatch();
  const followUps = useSelector((state) => state.leads.followups);
  const [isScheduled, setIsScheduled] = useState(false);
  const label = { inputProps: { 'aria-label': 'Switch demo' } };

  // Handle the switch toggle to show date input
  const handleSwitchChange = (event) => {
    setIsScheduled(event.target.checked); // Update the state based on switch value
  };


  useEffect(() => {
    const tokenId = sessionStorage.getItem('Token');
    if (!tokenId) {
      navigate('/')
    }

  }, [navigate])
  const handleEdit = (missed) => {
    openModal(true);
    setLeadData(missed);
  }
  const openModal = () => {
    setButtonTitle("Update Leads");
    setTitle("Update Leads");
    setIsModalOpen(true);  //open modal
  }

  const closeModal = () => {
    setIsModalOpen(false);
  }

  /////-------------------------
   useEffect(() => {  
      dispatch(fetchAllFollowUps());
    }, [dispatch]);
  const today=new Date().toISOString().split("T")[0]
  const leadFinaldata=followUps.followups?.filter((item)=>item.nextFollowupDate?.split("T")[0]<today)
  const finalData=leadFinaldata?.map((item)=>item.leadId)
  const handleNoteChange = (e) => {
    setStickyNote(e.target.value);
  };

  const saveStickyNote = () => {
    setNote(stickyNote);
    setIsNoteVisible(false);
  };

  const cancelStickyNote = () => {
    setStickyNote('');
    setIsNoteVisible(false);
  };

  return (
    <div>
      <Dashboard active={'missedLead'}>
        <div className="content">
          {/* {renderContent()} */}
          <>
            {/* Table Section */}
            <div className="missed-table-container">
              <DynamicTable lead={finalData} TableTitle={tableTitle} />
            </div>
            <div className='missed-card-container'>
             <DynamicCard leadCard={finalData} TableTitle={tableTitle}/> 
            </div>
 
            {/* modal compoent */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title={title} buttonTitle={buttonTitle} leadData={leadData} />
            {/* Conditional rendering for sticky note */}
            {isNoteVisible && (
              <div className="sticky-note-container">
                <textarea
                  value={stickyNote}
                  onChange={handleNoteChange}
                  placeholder="Add a note..."
                  className="sticky-note-textarea"
                />
                <div className="form-row">
                  <label>
                    Priority:
                    <select name="priority" className="sticky-note-select">
                      <option>Select</option>
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </label>

                  <label>
                    Sources:
                    <select name="sources" className="sticky-note-select">
                      <option>Select</option>
                      <option>Social Media</option>
                      <option>Posters</option>
                      <option>Adds</option>
                      <option>Referral</option>
                    </select>
                  </label>
                </div>
                {/* Switch and conditional rendering for the date input */}
                <div>
                  <Switch {...label} onChange={handleSwitchChange} /> <label>Set Reminder</label>
                  {isScheduled && (

                    <input type="date" className="date-input" />

                  )}
                </div>

                <div className="sticky-note-actions">
                  <button onClick={cancelStickyNote} className="cancel-btn">Cancel</button>
                  <button onClick={saveStickyNote} className="save-btn">Save</button>
                </div>
              </div>
            )}
          </>
        </div>
      </Dashboard>
    </div>
  )
}

export default MissedLeads

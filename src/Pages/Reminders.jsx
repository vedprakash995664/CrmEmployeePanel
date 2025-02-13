import React, { useState, useEffect } from 'react'
import Dashboard from '../Components/Dashboard';
import DynamicTable from '../Components/DynmicTables';
import DynamicCard from '../Components/DynamicCard';
import Modal from '../Components/LeadForm';
import './CSS/Reminders.css'
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllFollowUps, fetchLeads } from '../Features/LeadSlice';
function Reminders() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [buttonTitle, setButtonTitle] = useState('');
  const [title, setTitle] = useState('');
  const [leadData, setLeadData] = useState([]);  
  const [tableTitle, setTableTitle] = useState('Today Reminders')
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const followUps = useSelector((state) => state.leads.followups);
  useEffect(() => {
    const tokenId = sessionStorage.getItem('Token');
    if (!tokenId) {
      navigate('/')
    }

  }, [navigate])

  const handleEdit = (reminder) => {   
    openModal(true);
    setLeadData(reminder);
  }
  const openModal = () => {
    setTitle("Update Leads");
    setButtonTitle("Update Leads")
    setIsModalOpen(true); // open modal
  }

  const closeModal = () => {
    setIsModalOpen(false);
  }
  ////--------------------------
    useEffect(() => {
      dispatch(fetchAllFollowUps());
    }, [dispatch]);
const today=new Date().toISOString().split("T")[0]
const leadFinaldata=followUps.followups?.filter((item)=>item.nextFollowupDate?.split("T")[0]===today)
const finalData=leadFinaldata?.map((item)=>item.leadId)
const final = finalData
  ?.map((item) => {
    if (item.deleted === false && item.closed===false && item.negative===false) {
      return item; 
    }
  })
  .filter(item => item !== undefined); 
  return (
    <div>
      <Dashboard active={'reminder'}>
        <div className="content">
          {/* {renderContent()} */}
          <>
            {/* Table Section */}
            <div className="reminder-table-container">
              <DynamicTable lead={final} TableTitle={tableTitle} />
            </div>
            <div className='reminder-card-container'>
              <DynamicCard leadCard={final} TableTitle={tableTitle}/>
            </div>

            {/* modal componet */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title={title} buttonTitle={buttonTitle} leadData={leadData} />
          </>
        </div>
      </Dashboard>
    </div>
  )
}

export default Reminders

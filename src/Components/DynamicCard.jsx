import React, { useState } from 'react'
import './CSS/DynamicCard.css'
import FollowUpNotes from './FollowUpNotes';
import Modal from './LeadForm';
import { useNavigate } from 'react-router-dom';

function DynamicCard({ leadCard, TableTitle }) {
  const APi_Url=import.meta.env.VITE_API_URL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [isEditMode, setEditMode] = useState(false);
  const [buttonTitle, setButtonTitle] = useState('')
  const [leadData, setLeadData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');  // State for the search query
  const [currentPage, setCurrentPage] = useState(1);  // Track the current page
  const [itemsPerPage] = useState(5);  // Number of items per page
  const navigate = useNavigate();

  const openModal = (isEdit) => {
    setEditMode(isEdit);
    setTitle(isEdit ? "Update Lead" : "Add New Lead");
    setButtonTitle(isEdit ? "Update Lead" : "Add Lead");
    setIsModalOpen(true);
  }

  const closeModal = () => {
    setIsModalOpen(false);
  }



  
  const handleEdit = (lead) => {
    const viewdata = lead;
    const fromEdit = 'FromEdit';
    navigate('fullLeads', { state: { TableTitle, fromEdit, viewdata } });
};
  const handleView = (lead) => {
    
    const viewdata = lead;
    navigate('fullLeads', { state: { viewdata, TableTitle } });
  };

  const handleStickyNote = (lead) => {  
    setLeadData(lead);
    setNoteOpen(true);
  }

  const closeNote = () => {
    setNoteOpen(false);
  }

  // Function to handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset to the first page on search
  };

  // Function to filter leads based on the search query
  const filteredLeads = leadCard?.filter(lead => {
    return (
      lead?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      lead?.phone?.toLowerCase().includes(searchQuery.toLowerCase())||
      lead?.priority?.toLowerCase().includes(searchQuery.toLocaleLowerCase())||
      lead?.source?.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase())
    );
  });

  // Paginate the leads to show only the current page's items
  const indexOfLastLead = currentPage * itemsPerPage;
  const indexOfFirstLead = indexOfLastLead - itemsPerPage;
  const currentLeads = filteredLeads?.slice(indexOfFirstLead, indexOfLastLead);

  // Change page handler
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  }

  // Calculate total pages
  const totalPages = Math.ceil(filteredLeads?.length / itemsPerPage);

  return (
    <div className='dynamic-card-outer'>
      {/* Search Box */}
      <div className="dynamic-search-box">
        <input
          type="text"
          placeholder="Search by Name ,Phone ,Priority or Source..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      {/* Display Filtered and Paginated Leads */}
      {currentLeads?.map((lead, index) => (
        <div key={index} className='Dynamic-card'>
          <div className='dynamic-card-details-body'>
            <div className='dynamic-card-details'>
              <dl className='card-data'>
                <dt>Name</dt>
                <dd>{lead.name}</dd>
                <dt>Number</dt>
                <dd>{lead.phone}</dd>
                <div >
                  <dt>Priority</dt>
                  <dd>{lead.priority}</dd>
                  <dt>Sources</dt>
                  <dd>{lead.source}</dd>
                </div>
              </dl>
            </div>
            <div className='dynamic-card-calls'>
              <div style={{ height: "40px", width: "40px", backgroundColor: "#EDF1FF", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>
                <a
                  href={`tel:${lead.phone}`}
                  style={{
                    cursor: 'pointer',
                    textDecoration: 'none',
                    fontSize: '18px',
                    color: '#3454D1',
                  }}
                  className="ri-phone-fill"
                />
              </div>
              <div style={{ height: "40px", width: "40px", backgroundColor: "#EDF1FF", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>
                <a href={`https://wa.me/${lead.phone}`} style={{ textDecoration: "none" }} target="_blank" rel="noopener noreferrer">
                  <button style={{
                    color: "green", border: "none", background: "transparent", fontSize: "20px", cursor: "pointer", position: "relative",
                    bottom: "2px"
                  }}>
                    <i className="ri-whatsapp-line"></i>
                  </button>
                </a>
              </div>
              <div style={{ height: "40px", width: "40px", backgroundColor: "#EDF1FF", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>
                <button onClick={() => handleStickyNote(lead)} style={{ border: "none", background: "transparent" }}>
                  <a
                    style={{
                      cursor: 'pointer',
                      textDecoration: 'none',
                      fontSize: '18px',
                      color: '#657C7B',
                    }}
                    className="ri-sticky-note-add-fill"
                  />
                </button>
              </div>
            </div>
          </div>
          <div className='dynamic-card-footer'>
            <div style={{ height: "40px", width: "40px", backgroundColor: "#EDF1FF", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>
              <button
                style={{ color: "#3454D1", backgroundColor: "transparent", border: "none", fontSize: "25px", cursor: "pointer" }}
                onClick={() => handleEdit(lead)}
              >
                <i className="ri-edit-box-fill"></i>
              </button>
            </div>
          
            <div style={{ height: "40px", width: "40px", backgroundColor: "#EDF1FF", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>
              <button
                onClick={() => handleView(lead)}
                style={{ color: "red", backgroundColor: "transparent", border: "none", fontSize: "25px", cursor: "pointer" }}
              >
                <i className="ri-eye-line"></i>
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Pagination Controls */}
      <div className="pagination">
        <button 
          onClick={() => handlePageChange(currentPage - 1)} 
          disabled={currentPage === 1}
        >
          <i class="ri-arrow-left-line"></i>
        </button>
        <span>{currentPage}</span>
        <button 
          onClick={() => handlePageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
        >
         <i class="ri-arrow-right-line"></i> 
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={title} buttonTitle={buttonTitle} leadData={leadData} />
      <FollowUpNotes isOpenNote={noteOpen} oncloseNote={closeNote} leadData={leadData} />
    </div>
  );
}

export default DynamicCard;

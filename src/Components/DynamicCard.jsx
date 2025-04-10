import React, { useState, useEffect } from 'react';
import './CSS/DynamicCard.css';
import FollowUpNotes from './FollowUpNotes';
import Modal from './LeadForm';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners'; // Optional: import a loading spinner

function DynamicCard({ leadCard, TableTitle }) {
  const APi_Url = import.meta.env.VITE_API_URL;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [isEditMode, setEditMode] = useState(false);
  const [buttonTitle, setButtonTitle] = useState('');
  const [leadData, setLeadData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  const openModal = (isEdit) => {
    setEditMode(isEdit);
    setTitle(isEdit ? 'Update Lead' : 'Add New Lead');
    setButtonTitle(isEdit ? 'Update Lead' : 'Add Lead');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

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
  };

  const closeNote = () => {
    setNoteOpen(false);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const filteredLeads = leadCard?.filter((lead) => {
    return (
      lead?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead?.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead?.priority?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead?.source?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const indexOfLastLead = currentPage * itemsPerPage;
  const indexOfFirstLead = indexOfLastLead - itemsPerPage;
  const currentLeads = filteredLeads?.slice(indexOfFirstLead, indexOfLastLead);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(filteredLeads?.length / itemsPerPage);

  return (
    <div className="dynamic-card-outer">
      <div className="dynamic-search-box">
        <input
          type="text"
          placeholder="Search by Name, Phone, Priority or Source..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      {loading ? (
        <div className="loader-container">
          <ClipLoader size={50} color={'#3454D1'} loading={loading} />
        </div>
      ) : (
        <>
          {currentLeads?.map((lead, index) => {
            const serialNumber = indexOfFirstLead + index + 1;
            return (
              <div key={index} className="Dynamic-card">
                {/* Serial Number Display */}
                  <strong style={{float:'right'}}>#{serialNumber}</strong>
                <div className="dynamic-card-details-body">
                  <div className="dynamic-card-details">
                    <div className="card-body">
                      <p><span className='card-heading'>Name:- </span><span>{lead.name}</span></p>
                      <p><span className='card-heading'>Mobile:- </span> <span>{lead.phone}</span></p>
                      <div className="priority-source">
                        <p><span className='card-heading'>Priority:- </span> <span>{lead.priority}</span></p>
                        <p><span className='card-heading'>Source:- </span> <span>{lead.sources}</span></p>
                      </div>
                      <div className="tags">
                        {/* <span className='card-heading'>Tag:-</span> */}
                        {lead.tags.map((tag, index) => (
                          <span key={index} className="tag">{tag}</span>
                        ))}
                      </div>

                    </div>



                  </div>
                </div>

                <div className="dynamic-card-footer">
                  <div className='action-btn-footer'>
                  <div className="call-icon-wrapper">
                    <a
                      href={`tel:${lead.phone}`}
                      style={{
                        cursor: 'pointer',
                        textDecoration: 'none',
                        fontSize: '15px',
                        color: '#3454D1',
                      }}
                      className="ri-phone-fill"
                    />
                  </div>

                  <div className="call-icon-wrapper">
                    <a
                      href={`https://wa.me/${lead.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none' }}
                    >
                      <button
                        style={{
                          color: 'green',
                          border: 'none',
                          background: 'transparent',
                          fontSize: '15px',
                          cursor: 'pointer',
                          position: 'relative',
                          bottom: '2px',
                        }}
                      >
                        <i className="ri-whatsapp-line"></i>
                      </button>
                    </a>
                  </div>

                  <div className="call-icon-wrapper">
                    <button
                      onClick={() => handleStickyNote(lead)}
                      style={{ border: 'none', background: 'transparent' }}
                    >
                      <a
                        style={{
                          cursor: 'pointer',
                          textDecoration: 'none',
                          fontSize: '15px',
                          color: '#657C7B',
                        }}
                        className="ri-sticky-note-add-fill"
                      />
                    </button>
                  </div>
                  </div>
                  <div className='action-abtn'>
                  <div className="call-icon-wrapper">
                    <button
                      style={{
                        color: '#3454D1',
                        backgroundColor: 'transparent',
                        border: 'none',
                        fontSize: '15px',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleEdit(lead)}
                    >
                      <i className="ri-edit-box-fill"></i>
                    </button>
                  </div>

                  <div className="call-icon-wrapper">
                    <button
                      onClick={() => handleView(lead)}
                      style={{
                        color: 'red',
                        backgroundColor: 'transparent',
                        border: 'none',
                        fontSize: '15px',
                        cursor: 'pointer',
                      }}
                    >
                      <i className="ri-eye-line"></i>
                    </button>
                  </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination Controls */}
          <div className="pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <i className="ri-arrow-left-line"></i>
            </button>
            <span>
              {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <i className="ri-arrow-right-line"></i>
            </button>
          </div>
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={title}
        buttonTitle={buttonTitle}
        leadData={leadData}
      />
      <FollowUpNotes
        isOpenNote={noteOpen}
        oncloseNote={closeNote}
        leadData={leadData}
      />
    </div>
  );
}

export default DynamicCard;

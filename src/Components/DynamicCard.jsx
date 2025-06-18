import React, { useState, useEffect, useMemo } from 'react';
import './CSS/DynamicCard.css';
import FollowUpNotes from './FollowUpNotes';
import Modal from './LeadForm';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MultiSelect } from 'primereact/multiselect';
import { ClipLoader } from 'react-spinners';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTags } from '../Features/LeadSlice';
import { format } from 'timeago.js';
import axios from 'axios';

function DynamicCard({ leadCard, TableTitle }) {
  // State variables
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [isEditMode, setEditMode] = useState(false);
  const [buttonTitle, setButtonTitle] = useState('');
  const [leadData, setLeadData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [statusOptions, setStatusOptions] = useState([]);
  const [selectedStatusValues, setSelectedStatusValues] = useState([]);
  
  // Constants
  const itemsPerPage = 5;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const tagData = useSelector((state) => state.leads.tag);

  // Initialize current page
  const [currentPage, setCurrentPage] = useState(() => {
    const pageFromUrl = parseInt(searchParams.get('page'));
    if (pageFromUrl && !isNaN(pageFromUrl)) {
      return pageFromUrl;
    }
    const savedPage = localStorage.getItem('currentLeadPage');
    return savedPage ? parseInt(savedPage) : 1;
  });

  // Initialize selected tags
  const [selectedTagValues, setSelectedTagValues] = useState(() => {
    const savedTags = localStorage.getItem('selectedTagFilters');
    return savedTags ? JSON.parse(savedTags) : [];
  });

  // Effects
  useEffect(() => {
    searchParams.set('page', currentPage.toString());
    setSearchParams(searchParams);
    localStorage.setItem('currentLeadPage', currentPage.toString());
  }, [currentPage, setSearchParams, searchParams]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    dispatch(fetchTags());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('selectedTagFilters', JSON.stringify(selectedTagValues));
  }, [selectedTagValues]);

// Fetch statuses from API
useEffect(() => {
  const fetchStatuses = async () => {
    try {
      const APi_Url = import.meta.env.VITE_API_URL;
      const addedBy = sessionStorage.getItem('addedBy');
      const response = await axios.get(`${APi_Url}/digicoder/crm/api/v1/leadstatus/getall/${addedBy}`);
      
      // Access the leadStatus array from the response data
      const statuses = response.data.leadStatus || [];
      
      setStatusOptions(statuses.map(status => ({
        name: status.leadStatusText,
        value: status._id
      })));
    } catch (error) {
      console.error('Error fetching statuses:', error);
    }
  };
  fetchStatuses();
}, []);

  useEffect(() => {
    localStorage.setItem('selectedStatusFilters', JSON.stringify(selectedStatusValues));
  }, [selectedStatusValues]);

  // Memoized values
  const tagsOptions = useMemo(() => {
    return tagData
      .filter(tag => tag.tagName.toLowerCase().includes(tagSearchQuery.toLowerCase()))
      .map(tag => ({ name: tag.tagName, value: tag.tagName }));
  }, [tagData, tagSearchQuery]);

  const filteredLeads = useMemo(() => {
    if (!leadCard) return [];

    return leadCard.filter((lead) => {
      // Search query filter
      if (debouncedSearchQuery) {
        const searchLower = debouncedSearchQuery.toLowerCase();
        const matchesSearch = 
          lead?.name?.toLowerCase().includes(searchLower) ||
          lead?.phone?.toLowerCase().includes(searchLower) ||
          lead?.priority?.priorityText?.toLowerCase().includes(searchLower) ||
          lead?.sources?.leadSourcesText?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Tag filter
      if (selectedTagValues.length > 0) {
        if (!lead.tags || !Array.isArray(lead.tags)) return false;
        const hasAllSelectedTags = selectedTagValues.every(selectedTag => {
          return lead.tags.some(tag => {
            const tagName = typeof tag === 'string' ? tag : tag?.tagName;
            return tagName?.toLowerCase() === selectedTag.toLowerCase();
          });
        });
        if (!hasAllSelectedTags) return false;
      }

      // Status filter
      if (selectedStatusValues.length > 0) {
        if (!lead.leadStatus?._id) return false;
        const hasSelectedStatus = selectedStatusValues.includes(lead.leadStatus._id);
        if (!hasSelectedStatus) return false;
      }

      return true;
    });
  }, [leadCard, debouncedSearchQuery, selectedTagValues, selectedStatusValues]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const indexOfLastLead = currentPage * itemsPerPage;
  const indexOfFirstLead = indexOfLastLead - itemsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);

  // Ensure current page is valid
  useEffect(() => {
    if (filteredLeads.length > 0 && currentPage > totalPages) {
      handlePageChange(totalPages);
    }
  }, [filteredLeads.length, totalPages]);

  // Event handlers
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

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
    handlePageChange(1);
  };

  const handleTagSearchChange = (event) => {
    setTagSearchQuery(event.target.value);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="dynamic-card-outer">
        <div className="loader-container">
          <ClipLoader size={50} color={'#3454D1'} loading={loading} />
        </div>
      </div>
    );
  }

  return (
    <div className="dynamic-card-outer">
      {/* Filter Container */}
      <div className="custom-filter-container">
        {/* Status Filter */}
        <div className="custom-filter-box">
          <MultiSelect
            value={selectedStatusValues}
            options={statusOptions}
            optionLabel="name"
            onChange={(e) => {
              setSelectedStatusValues(e.value);
              handlePageChange(1);
            }}
            placeholder="Filter by Status"
            className="custom-input custom-multiselect"
            display="chip"
          />
          {selectedStatusValues.length > 0 && (
            <button 
              className="clear-btn" 
              onClick={() => {
                setSelectedStatusValues([]);
                handlePageChange(1);
              }}
            >
              <i className="ri-close-circle-line"></i>
            </button>
          )}
        </div>

        {/* Tag Filter */}
        <div className="custom-filter-box">
          <MultiSelect
            value={selectedTagValues}
            options={tagsOptions}
            optionLabel="name"
            onChange={(e) => {
              setSelectedTagValues(e.value);
              handlePageChange(1);
            }}
            filter
            placeholder="Filter by Tags"
            className="custom-input custom-multiselect"
          />
          {selectedTagValues.length > 0 && (
            <button 
              className="clear-btn" 
              onClick={() => {
                setSelectedTagValues([]);
                handlePageChange(1);
              }}
            >
              <i className="ri-close-circle-line"></i>
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="custom-filter-box">
          <input
            type="text"
            placeholder="Search by Name, Phone, Priority or Source..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="custom-input custom-search-input"
          />
          {searchQuery && (
            <button 
              className="clear-btn" 
              onClick={() => {
                setSearchQuery('');
                handlePageChange(1);
              }}
            >
              <i className="ri-close-circle-line"></i>
            </button>
          )}
        </div>
      </div>

      {/* Lead Cards */}
      {currentLeads.length > 0 ? (
        currentLeads.map((lead, index) => {
          const serialNumber = indexOfFirstLead + index + 1;
          return (
            <div key={index} className="Dynamic-card">
              <strong style={{ float: 'right' }}>#{serialNumber}</strong>
              
              <div className="dynamic-card-details-body">
                <div className="dynamic-card-details">
                  <div className="card-body">
                    <p>
                      <span className='card-heading'>Name:- </span>
                      <span>{lead.name}</span>
                    </p>
                    <p>
                      <span className='card-heading'>Mobile:- </span>
                      <span>{lead.phone}</span>
                    </p>
                    
                    <div className="priority-source">
                      <p>
                        <span className='card-heading'>Priority:- </span>
                        <span>{lead.priority?.priorityText}</span>
                      </p>
                      <p>
                        <span className='card-heading'>Status:- </span>
                        <span>{lead.leadStatus?.leadStatusText || "NA"}</span>
                      </p>
                    </div>
                    
                    <div className="tags">
                      {lead.tags && Array.isArray(lead.tags) && lead.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="tag">
                          {typeof tag === 'string' ? tag : tag.tagName}
                        </span>
                      ))}
                    </div>
                    
                    <div className="priority-source">
                      <p></p>
                      <p>
                        <br />
                        <span style={{ color: "grey" }}>
                          {lead.latestFollowup?.[0]?.createdAt
                            ? format(lead.latestFollowup[0].createdAt)
                            : 'No Followup'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="dynamic-card-footer">
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
                
                <div className='action-btn-footer'>
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

                  <div className="call-icon-wrapper">
                    <a
                      href={`https://wa.me/${lead.phone.startsWith('+91') 
                        ? lead.phone.replace(/\D/g, '') 
                        : '91' + lead.phone.replace(/\D/g, '')}`}
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
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="no-results">No leads found matching your filters</div>
      )}

      {/* Pagination */}
      {currentLeads.length > 0 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <i className="ri-arrow-left-line"></i>
          </button>
          <span>
            {currentPage} of {totalPages || 1}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <i className="ri-arrow-right-line"></i>
          </button>
        </div>
      )}

      {/* Modals */}
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
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

function DynamicCard({ leadCard, TableTitle }) {
  const API_Url = import.meta.env.VITE_API_URL;
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [isEditMode, setEditMode] = useState(false);
  const [buttonTitle, setButtonTitle] = useState('');
  const [leadData, setLeadData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [itemsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [statusSearchQuery, setStatusSearchQuery] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const tagData = useSelector((state) => state.leads.tag);

  const [currentPage, setCurrentPage] = useState(() => {
    const pageFromUrl = parseInt(searchParams.get('page'));
    if (pageFromUrl && !isNaN(pageFromUrl)) {
      return pageFromUrl;
    }
    
    const savedPage = localStorage.getItem('currentLeadPage');
    return savedPage ? parseInt(savedPage) : 1;
  });

  // Get stored tags from localStorage or default to empty array
  const [selectedTagValues, setSelectedTagValues] = useState(() => {
    const savedTags = localStorage.getItem('selectedTagFilters');
    return savedTags ? JSON.parse(savedTags) : [];
  });

  // Get stored status filters from localStorage or default to empty array
  const [selectedStatusValues, setSelectedStatusValues] = useState(() => {
    const savedStatus = localStorage.getItem('selectedStatusFilters');
    return savedStatus ? JSON.parse(savedStatus) : [];
  });

  // Update URL and localStorage when page changes
  useEffect(() => {
    searchParams.set('page', currentPage.toString());
    setSearchParams(searchParams);
    localStorage.setItem('currentLeadPage', currentPage.toString());
  }, [currentPage, setSearchParams, searchParams]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Fetch tags when component mounts
  useEffect(() => {
    dispatch(fetchTags());
  }, [dispatch]);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  // Update selected rows when select all changes or filtered leads change
  useEffect(() => {
    if (selectAll) {
      setSelectedRows([...filteredLeads]);
    } else {
      setSelectedRows([]);
    }
  }, [selectAll, debouncedSearchQuery, selectedTagValues, selectedStatusValues]);

  // Save selected tags to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('selectedTagFilters', JSON.stringify(selectedTagValues));
  }, [selectedTagValues]);

  // Save selected status to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('selectedStatusFilters', JSON.stringify(selectedStatusValues));
  }, [selectedStatusValues]);

  const tagsOptions = useMemo(() => {  
    return tagData
      .filter(tag =>
        tag.tagName.toLowerCase().includes(tagSearchQuery.toLowerCase())
      )
      .map(tag => ({ name: tag.tagName, value: tag.tagName }));
  }, [tagData, tagSearchQuery]);

  // Generate status options from available lead data
  const statusOptions = useMemo(() => {
    if (!leadCard) return [];
    
    const uniqueStatuses = new Set();
    leadCard.forEach(lead => {
      if (lead.leadStatus?.leadStatusText) {
        uniqueStatuses.add(lead.leadStatus.leadStatusText || "NA");
      }
    });
    
    return Array.from(uniqueStatuses)
      .filter(status => 
        status.toLowerCase().includes(statusSearchQuery.toLowerCase())
      )
      .map(status => ({ name: status, value: status }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [leadCard, statusSearchQuery]);

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
    handlePageChange(1); // Reset to page 1 when search changes
  };

  const handleTagSearchChange = (event) => {
    setTagSearchQuery(event.target.value);
  };

  const handleStatusSearchChange = (event) => {
    setStatusSearchQuery(event.target.value);
  };

  // Function to clear all filters
  const clearAllFilters = () => {
    setSelectedTagValues([]);
    setSelectedStatusValues([]);
    setSearchQuery('');
    setTagSearchQuery('');
    setStatusSearchQuery('');
    handlePageChange(1); // Reset to page 1 when filters are cleared
  };

  // Combined filtering function with memoization
  const filteredLeads = useMemo(() => {
    if (!leadCard) return [];
  
    return leadCard.filter((lead) => {
      // Only include leads that match ALL filtering criteria
      
      // 1. Match search query (if provided)
      if (debouncedSearchQuery) {
        const searchLower = debouncedSearchQuery.toLowerCase();
        const matchesSearch = 
          lead?.name?.toLowerCase().includes(searchLower) ||
          lead?.phone?.toLowerCase().includes(searchLower) ||
          lead?.priority?.priorityText?.toLowerCase().includes(searchLower) ||
          lead?.sources?.leadSourcesText?.toLowerCase().includes(searchLower);
          
        if (!matchesSearch) return false;
      }
      
      // 2. Match ALL selected tags (if any are selected)
      if (selectedTagValues.length > 0) {
        if (!lead.tags || !Array.isArray(lead.tags)) return false;
        
        // Check if the lead has ALL selected tags (AND logic)
        const hasAllSelectedTags = selectedTagValues.every(selectedTag => {
          return lead.tags.some(tag => {
            const tagName = typeof tag === 'string' ? tag : tag?.tagName;
            return tagName?.toLowerCase() === selectedTag.toLowerCase();
          });
        });
        
        if (!hasAllSelectedTags) return false;
      }

      // 3. Match selected status (if any are selected)
      if (selectedStatusValues.length > 0) {
        if (!lead.leadStatus?.leadStatusText || "NA") return false;
        
        const hasSelectedStatus = selectedStatusValues.some(selectedStatus => {
          return lead.leadStatus.leadStatusText || "NA".toLowerCase() === selectedStatus.toLowerCase();
        });
        
        if (!hasSelectedStatus) return false;
      }
      
      // The lead has passed all filter criteria
      return true;
    });
  }, [leadCard, debouncedSearchQuery, selectedTagValues, selectedStatusValues]);

  // Pagination logic
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  
  // Ensure current page is valid based on filtered results
  useEffect(() => {
    if (filteredLeads.length > 0 && currentPage > totalPages) {
      handlePageChange(totalPages);
    }
  }, [filteredLeads.length, totalPages]);
  
  const indexOfLastLead = currentPage * itemsPerPage;
  const indexOfFirstLead = indexOfLastLead - itemsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  // Custom header template for Tag MultiSelect
  const tagPanelHeaderTemplate = (options) => {
    return (
      <div>
        <div className="panelHeaderTemplate">
          <span className="font-bold">Tag Filters</span>
        </div>
        <div className="p-2 flex justify-between items-center">
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Search tags..."
            value={tagSearchQuery}
            onChange={handleTagSearchChange}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    );
  };

  // Custom header template for Status MultiSelect
  const statusPanelHeaderTemplate = (options) => {
    return (
      <div>
        <div className="panelHeaderTemplate">
          <span className="font-bold">Status Filters</span>
        </div>
        <div className="p-2 flex justify-between items-center">
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Search status..."
            value={statusSearchQuery}
            onChange={handleStatusSearchChange}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="dynamic-card-outer">
      <div className="custom-filter-container">
        <div className="custom-filter-box">
          <MultiSelect
            value={selectedTagValues}
            options={tagsOptions}
            optionLabel="name"
            onChange={(e) => {
              setSelectedTagValues(e.value);
              setSelectAll(false);
              handlePageChange(1); // Reset to page 1 when tag filters change
            }}
            filter
            placeholder="Filter by Tags"
            className="custom-input custom-multiselect"
            panelStyle={{ width: "200px" }}
            panelHeaderTemplate={tagPanelHeaderTemplate}
            scrollHeight="200px"
            display="chip"
            itemTemplate={(option) => {
              // Custom template for each option in the dropdown
              return (
                <div className="custom-option-item">
                  <span className="option-label">{option.name}</span>
                </div>
              );
            }}
          />
          {selectedTagValues.length > 0 && (
            <button className="clear-btn" onClick={() => {
              setSelectedTagValues([]);
              handlePageChange(1);
            }}>
              <i className="ri-close-circle-line"></i>
            </button>
          )}
        </div>

        <div className="custom-filter-box">
          <MultiSelect
            value={selectedStatusValues}
            options={statusOptions}
            optionLabel="name"
            onChange={(e) => {
              setSelectedStatusValues(e.value);
              setSelectAll(false);
              handlePageChange(1); // Reset to page 1 when status filters change
            }}
            filter
            placeholder="Filter by Status"
            className="custom-input custom-multiselect"
            panelStyle={{ width: "200px" }}
            panelHeaderTemplate={statusPanelHeaderTemplate}
            scrollHeight="200px"
            display="chip"
            itemTemplate={(option) => {
              // Custom template for each option in the dropdown
              return (
                <div className="custom-option-item">
                  <span className="option-label">{option.name}</span>
                </div>
              );
            }}
          />
          {selectedStatusValues.length > 0 && (
            <button className="clear-btn" onClick={() => {
              setSelectedStatusValues([]);
              handlePageChange(1);
            }}>
              <i className="ri-close-circle-line"></i>
            </button>
          )}
        </div>

        <div className="custom-filter-box">
          <input
            type="text"
            placeholder="Search by Name, Phone, Priority or Source..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="custom-input custom-search-input"
          />
          {searchQuery && (
            <button className="clear-btn" onClick={() => {
              setSearchQuery('');
              handlePageChange(1); // Reset to page 1 when search is cleared
            }}>
              <i className="ri-close-circle-line"></i>
            </button>
          )}
        </div>
{/* 
        {(selectedTagValues.length > 0 || selectedStatusValues.length > 0 || searchQuery) && (
          <div className="custom-filter-box">
            <button className="clear-all-filters-btn" onClick={clearAllFilters}>
              Clear All Filters
            </button>
          </div>
        )} */}
      </div>

      {loading ? (
        <div className="loader-container">
          <ClipLoader size={50} color={'#3454D1'} loading={loading} />
        </div>
      ) : (
        <>
          {currentLeads.length > 0 ? (
            currentLeads.map((lead, index) => {
              const serialNumber = indexOfFirstLead + index + 1;
              return (
                <div key={index} className="Dynamic-card">
                  <strong style={{ float: 'right' }}>#{serialNumber}</strong>
                  <div className="dynamic-card-details-body">
                    <div className="dynamic-card-details">
                      <div className="card-body">
                        <p><span className='card-heading'>Name:- </span><span>{lead.name}</span></p>
                        <p><span className='card-heading'>Mobile:- </span><span>{lead.phone}</span></p>
                        <div className="priority-source">
                          <p><span className='card-heading'>Priority:- </span><span>{lead.priority?.priorityText}</span></p>
                          <p><span className='card-heading'>Status:- </span><span>{lead.leadStatus?.leadStatusText || "NA"}</span></p>
                        </div>
                        <div className="tags">
                          {lead.tags && Array.isArray(lead.tags) && lead.tags.map((tag, index) => (
                            <span key={index} className="tag">
                              {typeof tag === 'string' ? tag : tag.tagName}
                            </span>
                          ))}
                        </div>
                        <div className="priority-source">
                          <p></p>
                          <p> <br />
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
                          href={`https://wa.me/${lead.phone.startsWith('+91') ? lead.phone.replace(/\D/g, '') : '91' + lead.phone.replace(/\D/g, '')}`}
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
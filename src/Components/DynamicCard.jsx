import React, { useState, useEffect, useMemo } from 'react';
import './CSS/DynamicCard.css';
import FollowUpNotes from './FollowUpNotes';
import Modal from './LeadForm';
import { useNavigate } from 'react-router-dom';
import { MultiSelect } from 'primereact/multiselect';
import { ClipLoader } from 'react-spinners';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTags } from '../Features/LeadSlice';

function DynamicCard({ leadCard, TableTitle }) {
  const API_Url = import.meta.env.VITE_API_URL;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [isEditMode, setEditMode] = useState(false);
  const [buttonTitle, setButtonTitle] = useState('');
  const [leadData, setLeadData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const tagData = useSelector((state) => state.leads.tag);

  // Get stored tags from localStorage or default to empty array
  const [selectedTagValues, setSelectedTagValues] = useState(() => {
    const savedTags = localStorage.getItem('selectedTagFilters');
    return savedTags ? JSON.parse(savedTags) : [];
  });

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
  }, [selectAll, debouncedSearchQuery, selectedTagValues]);

  // Save selected tags to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('selectedTagFilters', JSON.stringify(selectedTagValues));
  }, [selectedTagValues]);

  const tagsOptions = useMemo(() => {
    return tagData
      .filter(tag => 
        tag.tagName.toLowerCase().includes(tagSearchQuery.toLowerCase())
      )
      .map(tag => ({ name: tag.tagName, value: tag.tagName }));
  }, [tagData, tagSearchQuery]);

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

  const handleTagSearchChange = (event) => {
    setTagSearchQuery(event.target.value);
  };

  // Function to clear all filters
  const clearAllFilters = () => {
    setSelectedTagValues([]);
    setSearchQuery('');
    setTagSearchQuery('');
    setCurrentPage(1);
  };

  // Combined filtering function with memoization
  const filteredLeads = useMemo(() => {
    if (!leadCard) return [];

    // First filter by search query
    let filtered = leadCard.filter((lead) => {
      const searchLower = debouncedSearchQuery.toLowerCase();
      return (
        !debouncedSearchQuery ||
        lead?.name?.toLowerCase().includes(searchLower) ||
        lead?.phone?.toLowerCase().includes(searchLower) ||
        lead?.priority?.priorityText?.toLowerCase().includes(searchLower) ||
        lead?.source?.leadSourcesText?.toLowerCase().includes(searchLower)
      );
    });

    // Then filter by selected tags if any
    if (selectedTagValues.length > 0) {
      filtered = filtered.filter(item => {
        if (!item.tags || !Array.isArray(item.tags)) return false;
        
        return selectedTagValues.some(selectedTag => {
          return item.tags.some(tag => {
            const tagName = typeof tag === 'string' ? tag : tag?.tagName;
            return tagName?.toLowerCase() === selectedTag.toLowerCase();
          });
        });
      });
    }

    return filtered;
  }, [leadCard, debouncedSearchQuery, selectedTagValues]);

  // Pagination logic
  const indexOfLastLead = currentPage * itemsPerPage;
  const indexOfFirstLead = indexOfLastLead - itemsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Custom header template for MultiSelect
  const panelHeaderTemplate = (options) => {
    return (
      <div>
        <div className="panelHeaderTemplate">
          <span className="font-bold">Tag Filters</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearAllFilters();
            }}
            className="clear-all-btn"
            style={{
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            <i className="ri-close-circle-line"></i>
          </button>
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
              setCurrentPage(1);
            }}
            filter
            placeholder="Filter by Tags"
            className="custom-input custom-multiselect"
            panelStyle={{ width: "250px" }}
            panelHeaderTemplate={panelHeaderTemplate}
            // panelHeaderTemplate={""}
            scrollHeight="200px"
            display="chip"
            itemTemplate={(option) => {
              // Custom template for each option in the dropdown
              return (
                <div className="custom-option-item">
                  <span className="option-label">{option.name}</span>
                  <span className="option-badge">{option.count || 0}</span>
                </div>
              );
            }}
          />
          {selectedTagValues.length > 0 && (
            <button className="clear-btn" onClick={clearAllFilters}>
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
            className="custom-input"
          />
          {searchQuery && (
            <button className="clear-btn" onClick={() => {
              setSearchQuery('');
              setCurrentPage(1);
            }}>
              <i className="ri-close-circle-line"></i>
            </button>
          )}
        </div>
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
                          <p><span className='card-heading'>Source:- </span><span>{lead.sources?.leadSourcesText}</span></p>
                        </div>
                        <div className="tags">
                          {lead.tags && Array.isArray(lead.tags) && lead.tags.map((tag, index) => (
                            <span key={index} className="tag">
                              {typeof tag === 'string' ? tag : tag.tagName}
                            </span>
                          ))}
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
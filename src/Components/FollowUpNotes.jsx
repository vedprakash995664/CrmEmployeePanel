import React, { useState, useEffect, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Switch from '@mui/material/Switch';
import './CSS/FollowUpNotes.css';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeadStatus, fetchPriority } from '../Features/LeadSlice';
import { Spinner } from 'react-bootstrap'; // Import Spinner

function FollowUpNotes({ isOpenNote, oncloseNote, leadData }) {
    const [message, setMessage] = useState('');
    const toast = useRef(null); // Reference for the toast notification
    const [isScheduled, setIsScheduled] = useState(false);
    const [reminder, setReminderDate] = useState('');
    const [priority, setPriority] = useState('');
    const [status, setStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Loader state for Save button

    const dispatch = useDispatch();
    const priorityData = useSelector((state) => state.leads.Priority);
    const leadStatus = useSelector((state) => state.leads.LeadStatus);

    const [priorityOptions, setPriorityOptions] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);
    useEffect(() => {
        dispatch(fetchPriority());
        dispatch(fetchLeadStatus());
    }, [dispatch]);   
    
    const APi_Url=import.meta.env.VITE_API_URL
    
    useEffect(() => {
        if (priorityData && Array.isArray(priorityData)) {
            setPriorityOptions(
                priorityData.map((priority) => ({
                    label: priority.priorityText,
                    value: priority._id
                }))
            );
        }
    }, [priorityData]);

    useEffect(() => {
        if (leadStatus && Array.isArray(leadStatus)) {
            setStatusOptions(
                leadStatus.map((status) => ({
                    label: status.leadStatusText,
                    value: status._id
                }))
            );
        }
    }, [leadStatus]);
    
    // Set default priority based on lead data when modal opens
    useEffect(() => {
        if (isOpenNote && leadData && leadData.priority) {
            // Check if we have the priority ID directly
            if (leadData.priority._id) {
                setPriority(leadData.priority._id);
            } 
            // If we only have the priority object but not the ID structure
            else if (typeof leadData.priority === 'string') {
                setPriority(leadData.priority);
            }
        }
    }, [isOpenNote, leadData]);

    useEffect(() => {
        if (isOpenNote && leadData && leadData.leadStatus) {
            // Check if we have the status ID directly
            if (leadData.leadStatus._id) {
                setStatus(leadData.leadStatus._id);
            } 
            // If we only have the status as a string (like ID)
            else if (typeof leadData.leadStatus === 'string') {
                setStatus(leadData.leadStatus);
            }
        }
    }, [isOpenNote, leadData]);
    

    const handleNoteChange = (e) => {
        setMessage(e.target.value);
    };

    const handlePriorityChange = (e) => {
        setPriority(e.target.value);
    };

    const handleStatusChange = (e) => {
        setStatus(e.target.value);
    };

    const handleReminderDateChange = (e) => {
        setReminderDate(e.target.value);
    };

    const saveStickyNote = async () => {
        setIsLoading(true); // Start the loader
        try {
            const employeeId = sessionStorage.getItem('employeeId');

            if (!leadData || !leadData._id) {
                console.error("Error: leadData is missing or invalid.");
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'Invalid Lead Data', life: 3000 });
                return;
            }

            const data = {
                message,
                priority,
                status,
                followedBy: employeeId,
                reminder: isScheduled ? reminder : null,
            };

            console.log('Sending Data:', data);

            // Axios POST request
            const response = await axios.post(`${APi_Url}/digicoder/crm/api/v1/followup/add/${leadData._id}`, data, {
                headers: { 'Content-Type': 'application/json' },
            });
            const FormApiData={
                priority:priority,
                leadStatus:status
            }
            const leadResponse = await axios.put(
                `${APi_Url}/digicoder/crm/api/v1/lead/update/${leadData._id}`,
                FormApiData,
                {
                  headers: {
                    'Content-Type': 'application/json',
                  },
                }
              );
              console.log('====================================')
              console.log("leadResponse ",leadResponse)
              console.log('====================================')

            console.log('Response from API:', response.data);

            // Show success toast notification
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Note saved successfully!', life: 3000 });

            // Reset state after saving
            setMessage('');
            setPriority('');
            setStatus('');
            setReminderDate('');
            setIsScheduled(false);

            // Close the modal
            oncloseNote();
        } catch (error) {
            console.error('Error saving note:', error);

            // Show error toast notification
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to save note', life: 3000 });
        } finally {
            setIsLoading(false); // Stop the loader
        }
    };

    const cancelStickyNote = () => {
        setMessage('');
        setPriority('');
        setStatus('');
        setReminderDate('');
        setIsScheduled(false);
        oncloseNote();
    };

    const label = { inputProps: { 'aria-label': 'Switch demo' } };

    // Handle the switch toggle to show date input
    const handleSwitchChange = (event) => {
        setIsScheduled(event.target.checked);
    };

    // Reset form fields when modal is closed
    useEffect(() => {
        if (!isOpenNote) {
            setMessage('');
            setStatus('');
            setReminderDate('');
            setIsScheduled(false);
            // Don't reset priority here since we want to set it when modal opens
        }
    }, [isOpenNote]);

    return (
        <>
            <Modal
                show={isOpenNote}
                onHide={oncloseNote}
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Follow Up Notes</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="modal-body-content">
                        {/* Sticky Note Textarea */}
                        <div className="sticky-note-container">
                            <textarea
                                value={message}
                                onChange={handleNoteChange}
                                placeholder="Add a note..."
                                className="sticky-note-textarea"
                            />
                        </div>

                        {/* Form Row for Priority and Sources */}
                        <div className="form-row-notes">
                            <div className="form-group">
                                <label className="form-label">Priority:</label>
                                <select
                                    name="priority"
                                    className="sticky-note-select"
                                    value={priority}
                                    onChange={handlePriorityChange}
                                >
                                    <option value="">Select</option>
                                    {priorityOptions.map((option, index) => (
                                        <option key={index} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Status:</label>
                                <select
                                    name="status"
                                    className="sticky-note-select"
                                    value={status}
                                    onChange={handleStatusChange}
                                >
                                    <option value="">Select</option>
                                    {statusOptions.map((option, index) => (
                                        <option key={index} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Switch for Set Reminder */}
                        <div className="form-group reminder-switch">
                            <Switch {...label} onChange={handleSwitchChange} />
                            <label>Set Reminder</label>
                            {isScheduled && (
                                <input
                                    type="date"
                                    className="date-input"
                                    value={reminder}
                                    onChange={handleReminderDateChange}
                                />
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="sticky-note-actions">
                            <Button variant="secondary" onClick={cancelStickyNote} className="cancel-btn">
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={saveStickyNote}
                                className="save-btn"
                                disabled={isLoading} // Disable Save button while loading
                            >
                                {isLoading ? (
                                    <Spinner animation="border" size="sm" />  // Add spinner here
                                ) : (
                                    'Save'
                                )}
                            </Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
            <Toast ref={toast} />
        </>
    );
}

export default FollowUpNotes;
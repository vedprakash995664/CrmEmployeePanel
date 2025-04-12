import React, { useState, useEffect } from 'react';
import { FilterMatchMode } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import Modal from './LeadForm';
import { useNavigate } from 'react-router-dom';
import FollowUpNotes from './FollowUpNotes';
import { ClipLoader } from 'react-spinners'; // Import ClipLoader for loading animation

export default function DynamicTable({ lead, TableTitle }) {
    const APi_Url = import.meta.env.VITE_API_URL;
    const [showBtn, setShowBtn] = useState(true);
    const [noteOpen, setNoteOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [isEditMode, setEditMode] = useState(false);
    const [buttonTitle, setButtonTitle] = useState('');
    const [leadData, setLeadData] = useState([]);
    const [loading, setLoading] = useState(false); // Loading state for table data
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        phone: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        priority: { value: null, matchMode: FilterMatchMode.EQUALS },
        source: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    });
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(5);

    // Handle global filter change
    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    // Handle pagination change
    const onPageChange = (event) => {
        setFirst(event.first);
        setRows(event.rows);
    };

    // Header with global search
    const renderHeader = () => {
        return (
            <div className="flex justify-content-between gap-3 align-items-center p-2">
                <h5>{TableTitle}</h5>
                <InputText
                    value={globalFilterValue}
                    onChange={onGlobalFilterChange}
                    placeholder="Keyword Search"
                    style={{ width: '100%', maxWidth: '300px', maxHeight: '50px' }}
                />
            </div>
        );
    };

    // Action buttons renderer
    const actionBodyTemplate = (rowData) => {
        return (
            <div className="flex justify-content-around gap-3">
                <div
                    style={{
                        height: '40px',
                        width: '40px',
                        backgroundColor: '#EDF1FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                    }}
                >
                    <button
                        style={{
                            color: '#3454D1',
                            backgroundColor: 'transparent',
                            border: 'none',
                            fontSize: '20px',
                            cursor: 'pointer',
                        }}
                        onClick={() => handleEdit(rowData)}
                    >
                        <i className="ri-edit-box-fill"></i>
                    </button>
                </div>
                <div
                    style={{
                        height: '40px',
                        width: '40px',
                        backgroundColor: '#EDF1FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                    }}
                >
                    <button
                        onClick={() => handleView(rowData)}
                        style={{
                            color: 'red',
                            backgroundColor: 'transparent',
                            border: 'none',
                            fontSize: '20px',
                            cursor: 'pointer',
                        }}
                    >
                        <i className="ri-eye-line"></i>
                    </button>
                </div>
            </div>
        );
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

    const handleEdit = (rowData) => {
        const viewdata = rowData;
        const fromEdit = 'FromEdit';
        navigate('fullLeads', { state: { TableTitle, fromEdit, viewdata } });
    };

    const handleView = (rowData) => {
        const viewdata = rowData;
        navigate('fullLeads', { state: { viewdata, TableTitle } });
    };

    const handleStickyNote = (rowData) => {
        setNoteOpen(true);
        setLeadData(rowData);
    };

    const closeNote = () => {
        setNoteOpen(false);
    };

    useEffect(() => {
        if (TableTitle === 'Closed Lead') {
            setShowBtn(false);
        } else if (TableTitle === 'Negative Lead') {
            setShowBtn(false);
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 1500);
    }, [TableTitle]);

    const header = renderHeader();

    return (
        <div className="card">
            {loading ? (
                // Show loader while data is being fetched
                <div className="flex justify-content-center align-items-center" style={{ height: '200px' }}>
                    <ClipLoader color="#3454D1" size={50} />
                </div>
            ) : (
                // Render the table if data is ready
                <DataTable
                    value={lead}
                    rows={rows}
                    first={first}
                    paginator
                    dataKey="id"
                    filters={filters}
                    filterDisplay="row"
                    globalFilterFields={['name', 'phone', 'priority', 'source']}
                    header={header}
                    emptyMessage="No Leads found."
                    onPage={onPageChange}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                    removableSort
                    style={{ borderRadius: '10px' }}
                >
                    <Column
                        header="SR No."
                        body={(rowData, { rowIndex }) => rowIndex + 1 + first}
                        style={{ width: '10%', padding: '0px 0px 0px 20px' }}
                    ></Column>
                    <Column field="name" header="NAME" sortable style={{ width: '25%' }}></Column>
                    <Column
                        field="phone"
                        header="PHONE"
                        sortable
                        style={{ width: '20%' }}
                        body={(rowData) => (
                            <div className="flex justify-content-between gap-2 items-center">
                                <div style={{ paddingTop: '10px' }}>{rowData?.phone}</div>&emsp;
                                {showBtn && (
                                    <>
                                        <div
                                            style={{
                                                height: '40px',
                                                width: '40px',
                                                backgroundColor: '#EDF1FF',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: '50%',
                                            }}
                                        >
                                            <a
                                                href={`tel:${rowData?.phone}`}
                                                style={{
                                                    cursor: 'pointer',
                                                    textDecoration: 'none',
                                                    fontSize: '18px',
                                                    color: '#3454D1',
                                                }}
                                                className="ri-phone-fill"
                                            />
                                        </div>
                                        <div
                                            style={{
                                                height: '40px',
                                                width: '40px',
                                                backgroundColor: '#EDF1FF',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: '50%',
                                            }}
                                        >
                                            <a href={`https://wa.me/${91 + rowData?.phone}`} target="_blank" rel="noopener noreferrer">
                                                <button
                                                    style={{
                                                        color: 'green',
                                                        border: 'none',
                                                        background: 'transparent',
                                                        fontSize: '20px',
                                                        cursor: 'pointer',
                                                        position: 'relative',
                                                        bottom: '2px',
                                                    }}
                                                >
                                                    <i className="ri-whatsapp-line"></i>
                                                </button>
                                            </a>
                                        </div>
                                        <div
                                            style={{
                                                height: '40px',
                                                width: '40px',
                                                backgroundColor: '#EDF1FF',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: '50%',
                                            }}
                                        >
                                            <button onClick={() => handleStickyNote(rowData)} style={{ border: 'none', background: 'transparent' }}>
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
                                    </>
                                )}
                            </div>
                        )}
                    ></Column>
                    <Column
                        header="PRIORITY"
                        body={(rowData) => {
                            if (!rowData.priority) return "NA";
                            return rowData.priority.priorityText || "NA";
                        }}
                        sortable
                        style={{ width: '10%', textAlign: "center" }}
                    />

                    <Column
                        header="Sources"
                        body={(rowData) => {
                            if (!rowData.sources) return "NA";
                            return rowData.sources.leadSourcesText || "NA";
                        }}
                        sortable
                        style={{ width: '15%' }}
                    />
                    <Column header="ACTION" body={actionBodyTemplate} style={{ width: '15%' }}></Column>
                </DataTable>
            )}

            <Modal isOpen={isModalOpen} onClose={closeModal} title={title} buttonTitle={buttonTitle} leadData={leadData} />
            <FollowUpNotes isOpenNote={noteOpen} oncloseNote={closeNote} leadData={leadData} />
        </div>
    );
}

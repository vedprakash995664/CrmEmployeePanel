import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Dashboard from '../Components/Dashboard';
import DynamicCard from '../Components/DynamicCard';
import DynamicTable from '../Components/DynmicTables';

function PendingLeads() {
    const [pendingLeads, setPendingLeads] = useState([]);
    const APi_Url = import.meta.env.VITE_API_URL;
    const currentEmployeeId = sessionStorage.getItem('employeeId');

    useEffect(() => {
        const fetchPendingLeads = async () => {
            const response = await axios.get(
                `${APi_Url}/digicoder/crm/api/v1/lead/pendingleads/${currentEmployeeId}`
            );
            console.log("abc",response)
            try {

                const allLeads = response.data.leads || [];

                const filteredLeads = allLeads.filter(lead => {
                    const latestFollowups = lead.latestFollowup;

                    if (!latestFollowups || latestFollowups.length === 0) {
                        return true;
                    }

                    const latestFollowup = latestFollowups[latestFollowups.length - 1];

                    // Backend now sends raw followup without populating user details, so use `followedBy`
                    return latestFollowup.followedBy !== currentEmployeeId;
                });

                setPendingLeads(filteredLeads);
                
            } catch (error) {
                console.error('Error fetching pending leads:', error);
            }
        };

        fetchPendingLeads();
    }, [APi_Url, currentEmployeeId]);

    return (
        <Dashboard active={'pending'}>
            <div className="lead-table-container">
                <DynamicTable className="dynamicTable" lead={pendingLeads} TableTitle="Pending Leads" />
            </div>
            <div className="lead-card-container">
                <DynamicCard leadCard={pendingLeads} TableTitle="Pending Leads" />
            </div>
        </Dashboard>
    );
}

export default PendingLeads;

import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Slice to handle leads state
const leadsSlice = createSlice({
  name: 'leads',
  initialState: {
    leads: [],
    Priority: [],
    tag:[],
    LeadStatus:null,
    Employee:null,
    leadSources:[],
    followups:[]
  },

  reducers: {
    setLeads: (state, action) => {
      state.leads = action.payload;
    },
    setPriority: (state, action) => {  
      state.Priority = action.payload;
    },
    setTags: (state, action) => {  
      state.tag = action.payload;
    },
    setLeadStatus: (state, action) => {
      state.LeadStatus = action.payload;
    },
    setEmployee: (state, action) => {
      state.Employee = action.payload;
    },
    setLeadSources: (state, action) => {
      state.leadSources = action.payload;
    },
    setFollowUps: (state, action) => {
      state.followups = action.payload;
    },
    
  },
});

export const { setLeads, setPriority,setLeadStatus,setEmployee ,setLeadSources,setFollowUps,setTags} = leadsSlice.actions;

// Thunk to fetch leads data
export const fetchLeads = () => async (dispatch) => {
  try {
    const APi_Url=import.meta.env.VITE_API_URL
    const addedBy = sessionStorage.getItem('addedBy');
    const response = await axios.get(`${APi_Url}/digicoder/crm/api/v1/lead/getall/${addedBy}`);
    const totalLead=response.data.leads   
    const employeeId=sessionStorage.getItem("employeeId")
    const assignedLead=totalLead.filter((item)=>{
      if(item.leadAssignedTo){
        return item
      }
    })
    const finalAssigned=assignedLead.filter((FinalItem)=>{
      if(FinalItem.leadAssignedTo._id===employeeId){
        return FinalItem;
      }
    })
    dispatch(setLeads(finalAssigned));
  } catch (error) {
    console.error('Error fetching leads:', error);
  }
};


// Thunk to fetch leads data
export const fetchTags = () => async (dispatch) => {
  try {
    const APi_Url=import.meta.env.VITE_API_URL
    const AdminId = sessionStorage.getItem('addedBy');
    const response = await axios.get(`${APi_Url}/digicoder/crm/api/v1/tags/getall/${AdminId}`);
    dispatch(setTags(response.data.tags));
    
  } catch (error) {
    console.error('Error fetching tags:', error);
  }
};
// Thunk to fetch priority data
export const fetchPriority =() =>async(dispatch) => {
  try {
    const APi_Url=import.meta.env.VITE_API_URL
    const addedBy = sessionStorage.getItem('addedBy');
    const response = await axios.get(`${APi_Url}/digicoder/crm/api/v1/priority/get/${addedBy}`);
    // console.log('Priority response:', response.data);    
    dispatch(setPriority(response.data.priorities)); 
  } catch (error) {
    console.error('Error fetching priority data:', error);
  }
};
// Thunk to fetch priority data
export const fetchLeadStatus = () => async (dispatch) => {
  try {
    const APi_Url=import.meta.env.VITE_API_URL
    const addedBy = sessionStorage.getItem('addedBy');
    const response = await axios.get(`${APi_Url}/digicoder/crm/api/v1/leadstatus/getall/${addedBy}`);
    dispatch(setLeadStatus(response.data.leadStatus));
    // console.log(response.data.leadStatus);
    
  } catch (error) {
    console.error('Error fetching priority data:', error);
  }
};
// Thunk to fetch priority data
export const fetchEmployee = () => async (dispatch) => {
  try {
    const APi_Url=import.meta.env.VITE_API_URL
    // console.log('Fetching Employee');
    const addedBy = sessionStorage.getItem('addedBy');
    const response = await axios.get(`${APi_Url}/digicoder/crm/api/v1/employee/getall/${addedBy}`);
    dispatch(setEmployee(response.data.employees));
  } catch (error) {
    console.error('Error fetching Employee data:', error);
  }
};
export const fetchSources = () => async (dispatch) => {
  try {
    const APi_Url=import.meta.env.VITE_API_URL
    // console.log('Fetching Employee');
    const addedBy = sessionStorage.getItem('addedBy');
    const response = await axios.get(`${APi_Url}/digicoder/crm/api/v1/leadSources/getall/${addedBy}`);
    dispatch(setLeadSources(response.data.leadSources));
  } catch (error) {
    console.error('Error fetching Employee data:', error);
  }
};
export const fetchAllFollowUps = () => async (dispatch) => {
  try {
    const APi_Url=import.meta.env.VITE_API_URL
    const addedBy = sessionStorage.getItem('employeeId');
    const response = await axios.get(`${APi_Url}/digicoder/crm/api/v1/followup/getnext/${addedBy}`);
    // console.log(response.data);
    dispatch(setFollowUps(response.data));
  } catch (error) {
    console.error('Error fetching FollowUpsData:', error);
  }
};

export default leadsSlice.reducer;

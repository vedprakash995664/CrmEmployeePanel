import React, { useEffect, useState } from "react";
import "./CSS/Dashboard.css";
import { ToastContainer } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2'; 

const Dashboard = ({ children, active }) => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [dropdownActive, setDropdownActive] = useState(false);
  const [isShow, setIsShow] = useState(false);  
  const userString = sessionStorage.getItem('Emp');
  const name = userString ? JSON.parse(userString) : null;
  
  const navigate = useNavigate();
  
  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  const toggleDropdown = () => {
    setDropdownActive(!dropdownActive);
  };

  const handleIsShow = () => {
    setIsShow(prevState => !prevState);
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handlelogout = () => {
    Swal.fire({
      title: 'Are you sure ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, log me out',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Logged out successfully!',
          icon: 'success',
        }).then(() => {
          sessionStorage.removeItem("Token");
          sessionStorage.removeItem("employeeId");
          sessionStorage.removeItem("addedBy");
          localStorage.removeItem("Employee");
          sessionStorage.removeItem("Emp");
          navigate('/');
        });
      } else {
        Swal.fire({
          title: 'Thanks',
          text: 'You are still logged in.',
          icon: 'info',
        });
      }
    });
  };

  useEffect(() => {
    const tokenId = sessionStorage.getItem('Token');
    if (!tokenId) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <div className={`sidebar ${sidebarActive ? "active" : ""}`}>
        <div className="sidebar-logo"><img src="Images/cr.gif" style={{width:"200px"}} alt="" /></div>
        <div className="navigation">
          <ul className="sidebar-nav-links">
            <Link className="navigation-link" to="/Main">
              <li>
                <button className={`sidebar-link ${active === 'dashboard' && 'active'}`}>
                  <i className="ri-dashboard-horizontal-fill"></i> &nbsp;Dashboard
                </button>
              </li>
            </Link>
            <Link className="navigation-link" to="/leads">
              <li>
                <button className={`sidebar-link ${active === 'lead' && 'active'}`}>
                <i class="ri-information-2-fill"></i> &nbsp;Leads
                </button>
              </li>
            </Link>
            <Link className="navigation-link" to="/todayRminders">
              <li>
                <button className={`sidebar-link ${active === 'reminder' && 'active'}`}>
                  <i className="ri-notification-3-fill"></i>&nbsp;Today Reminders
                </button>
              </li>
            </Link>
            <Link className="navigation-link" to="/missedLeads">
              <li>
                <button className={`sidebar-link ${active === 'missedLead' && 'active'}`}>
                  <i className="ri-mail-unread-fill"></i> &nbsp;Missed Leads
                </button>
              </li>
            </Link>
            <Link className="navigation-link" to="/closed">
              <li>
                <button className={`sidebar-link ${active === 'closedLead' && 'active'}`}>
                <i class="ri-shield-check-fill"></i> &nbsp; Closed Leads
                </button>
              </li>
            </Link>
            <Link className="navigation-link" to="/negative">
              <li>
                <button className={`sidebar-link ${active === 'negative' && 'active'}`}>
                <i class="ri-spam-3-fill"></i> &nbsp; Negative Leads
                </button>
              </li>
            </Link>
            <Link className="navigation-link" to="/calender">
              <li>
                <button className={`sidebar-link ${active === 'calender' && 'active'}`}>
                <i class="ri-calendar-schedule-fill"></i> &nbsp; Calender
                </button>
              </li>
            </Link>

            <Link className="navigation-link" to="/report">
              <li>
                <button className={`sidebar-link ${active === 'report' && 'active'}`}>
                  <i className="ri-file-chart-fill"></i> &nbsp;Report
                </button>
              </li>
            </Link>
          </ul>  
        </div>
        <div className="logout-div">
          <button className="sidebar-linkk" onClick={() => handlelogout()}>
            <i className="ri-logout-circle-line"></i> &nbsp;Logout
          </button>
        </div>
        <button className="sidebar-close-btn" onClick={toggleSidebar}>
          ×
        </button>
      </div>

      <div className="main-content">
        <header className="header">
          <h1 className="header-title">Welcome Back, {name.empName}</h1>
          <button className="hamburger" onClick={toggleSidebar}>
            {sidebarActive ? "×" : "☰"}
          </button>
          <div>
            <div className="sidebar-profile">
              <img 
                src="/Images/ved.jpg" 
                alt="" 
                className="img-fluid" 
                onClick={handleIsShow}
              />
            </div>
            {isShow && (
              <div className="newDiv">
                <div className={`newDiv-item ${active === 'profile' && 'newDiv-active'}`} onClick={handleProfile}><i className="ri-profile-fill" style={{color:"#3454D1"}}></i> Profile</div>
                <div className="newDiv-item logout" onClick={() => handlelogout()}><i className="ri-logout-circle-line" style={{color:"#3454D1"}}></i> Logout</div>
              </div>
            )}
          </div>
        </header>

        <div className="content-wrapper">
          <div className="content">
            {children}
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Dashboard;

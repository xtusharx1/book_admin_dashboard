import { faBookOpen, faHomeAlt, faMagnifyingGlassChart, faTachographDigital, faUsers, faFaceLaughWink, faNoteSticky, faQuestion, faFileCircleQuestion, faSchoolCircleXmark, faBookBookmark, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Link, useLocation } from 'react-router-dom'; // Import useLocation

function Sidebar() {
    const location = useLocation(); // Get current location

    return (
        <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">

            {/* <!-- Sidebar - Brand --> */}
            <a className="sidebar-brand d-flex align-items-center justify-content-center" href="/portal/dashboard">
                <div className="sidebar-brand-icon rotate-n-15">
                    <FontAwesomeIcon icon={faFaceLaughWink} size={"2x"} />
                </div>
                <div className="sidebar-brand-text mx-3">SAINIK BOOK ADMIN </div>
            </a>

            {/* <!-- Divider --> */}
            <hr className="sidebar-divider my-0" />

            {/* <!-- Nav Item - Dashboard --> */}
            <li className={`nav-item ${location.pathname === '/portal/dashboard' ? 'active' : ''}`}>
                <Link className="nav-link" to="/portal/dashboard">
                    <FontAwesomeIcon icon={faTachographDigital} style={{ marginRight: "0.5rem" }} />
                    <span>Dashboard</span>
                </Link>
            </li>
            {/* <!-- Divider --> */}
            <hr className="sidebar-divider my-0" />

            <li className={`nav-item ${location.pathname === '/portal/user-list' ? 'active' : ''}`}>
                <Link className="nav-link" to="/portal/user-list">
                    <FontAwesomeIcon icon={faUsers} style={{ marginRight: "0.5rem" }} />
                    <span>Students</span>
                </Link>
            </li>
            
            <li className={`nav-item ${location.pathname === '/portal/library-list' ? 'active' : ''}`}>
                <Link className="nav-link" to="/portal/library-list">
                    <FontAwesomeIcon icon={faBookOpen} style={{ marginRight: "0.5rem" }} />
                    <span>App Library</span>
                </Link>
            </li>

            {/* <!-- Divider --> */}
            <hr className="sidebar-divider my-0" />

            <li className={`nav-item ${location.pathname === '/portal/salesscreen' ? 'active' : ''}`}>
                <Link className="nav-link" to="/portal/salesscreen">
                    <FontAwesomeIcon icon={faMagnifyingGlassChart} style={{ marginRight: "0.5rem" }} />
                    <span>CRM</span>
                </Link>
            </li>

            {/* <!-- Divider --> */}
            <hr className="sidebar-divider my-0" />

            <li className={`nav-item ${location.pathname === '/portal/Apphome' ? 'active' : ''}`}>
                <Link className="nav-link" to="/portal/Apphome">
                    <FontAwesomeIcon icon={faHomeAlt} style={{ marginRight: "0.5rem" }} />
                    <span>App Content</span>
                </Link>
            </li><hr className="sidebar-divider my-0" />
            <li className={`nav-item ${location.pathname === '/portal/QuestionBank' ? 'active' : ''}`}>
    <Link className="nav-link" to="/portal/QuestionBank">
        <FontAwesomeIcon icon={faFileCircleQuestion} style={{ marginRight: "0.5rem" }} />
        <span>Question Bank</span>
    </Link>
</li>
            <li className={`nav-item ${location.pathname === '/portal/PracticeTest' ? 'active' : ''}`}>
                <Link className="nav-link" to="/portal/PracticeTest">
                    <FontAwesomeIcon icon={faBookBookmark} style={{ marginRight: "0.5rem" }} />
                    <span>Practice Test</span>
                </Link>
            </li>
            <li className={`nav-item ${location.pathname === '/portal/Scholarship-details' ? 'active' : ''}`}>
                <Link className="nav-link" to="/portal/Scholarship-details">
                    <FontAwesomeIcon icon={faFileAlt} style={{ marginRight: "0.5rem" }} />
                    <span>Scholarship Details</span>
                </Link>
            </li>
<li className={`nav-item ${location.pathname === '/portal/Scholarship' ? 'active' : ''}`}>
                <Link className="nav-link" to="/portal/Scholarship">
                    <FontAwesomeIcon icon={faSchoolCircleXmark} style={{ marginRight: "0.5rem" }} />
                    <span>Scholarship Result</span>
                </Link>
            </li>
            
        </ul>
    );
}

export default Sidebar;

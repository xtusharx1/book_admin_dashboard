import React from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser } from '@fortawesome/free-regular-svg-icons';

function Topbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear session cookie
        Cookies.remove('session');
        // Redirect to login page
        navigate('/');
    };

    return (
        <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
            {/* Topbar Navbar */}
            <ul className="navbar-nav ml-auto">
                {/* User Info and Logout Button */}
                <li className="nav-item d-flex align-items-center">
                    <span className="mr-2 d-none d-lg-inline text-gray-600 small">Dabad Academy</span>
                    <FontAwesomeIcon icon={faCircleUser} size={"xl"} className="mr-3" />
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </li>
            </ul>
        </nav>
    );
}

export default Topbar;

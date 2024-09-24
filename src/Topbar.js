import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser } from '@fortawesome/free-regular-svg-icons';
import axios from 'axios';
import './topbar.css'; // Import the CSS for styling

function Topbar() {
    const navigate = useNavigate();
    const [latestCartStudent, setLatestCartStudent] = useState(null); // State to store the latest student with cart items

    useEffect(() => {
        fetchLatestCartStudent();
    }, []);

    const handleLogout = () => {
        Cookies.remove('session');
        navigate('/');
    };
// Helper function to convert UTC date to IST and format it as dd/mm/yyyy
const convertToIST = (utcDate) => {
    const date = new Date(utcDate);

    if (isNaN(date.getTime())) {
      console.error('Invalid date format:', utcDate);
      return 'Invalid date';
    }

    return date.toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' });
  };

    const fetchLatestCartStudent = async () => {
        try {
            const response = await axios.get('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/payments/all'); 
            const orders = response.data;

            const cartItems = orders.filter(order => !order.haspaid && order.iscart);

            const sortedCartItems = cartItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            if (sortedCartItems.length > 0) {
                const latestOrder = sortedCartItems[0]; 
                setLatestCartStudent({
                    studentId: latestOrder.u_id,
                    createdAt: latestOrder.created_at 
                });
            } else {
                setLatestCartStudent(null);
            }
        } catch (error) {
            console.error('Error fetching latest cart student:', error);
        }
    };

    const handleMarqueeClick = () => {
        if (latestCartStudent) {
            navigate(`/portal/user-view/${latestCartStudent.studentId}`);
        }
    };

    return (
        <nav className="navbar topbar">
            {/* Marquee Section */}
            <div className="navbar-marquee" onClick={handleMarqueeClick}>
                {latestCartStudent ? (
                     <p>
                     A new user has items in the cart since {convertToIST(latestCartStudent.createdAt)}. Click here to view the profile.
                  </p>
                    
                ) : (
                    <p>
                        Welcome to Dabad Academy! Stay tuned for upcoming courses and events!
                    </p>
                )}
            </div>

            {/* Topbar Navbar */}
            <ul className="navbar-nav">
                <li className="nav-item d-flex align-items-center">
                    <span className="mr-2 d-none d-lg-inline text-gray-600 small">Dabad Academy</span>
                    <FontAwesomeIcon icon={faCircleUser} size={"xl"} className="mr-3" />
                    <button className="btn btn-danger btn-sm" onClick={handleLogout}>Logout</button>
                </li>
            </ul>
        </nav>
    );
}

export default Topbar;

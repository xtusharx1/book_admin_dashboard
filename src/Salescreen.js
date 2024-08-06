import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Salescreen.css'; // Assuming the CSS is saved in Salescreen.css

export default function Salescreen() {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);
  const [currentTab, setCurrentTab] = useState('orders');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const paymentResponse = await axios.get('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/payments/all');
        const paymentData = paymentResponse.data;

        // Retrieve user and book details based on payment data
        const detailedPayments = await Promise.all(paymentData.map(async (payment) => {
          let userName = 'Unknown User';
          let bookName = 'Unknown Book';
          let date = '';

          if (payment.u_id) {
            try {
              const userResponse = await axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/users/getbyid/${payment.u_id}`);
              userName = userResponse.data.f_name || 'Unknown User';
            } catch (err) {
              // Handle user fetch error
            }
          }

          if (payment.b_id) {
            try {
              const bookResponse = await axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/books/getbook/${payment.b_id}`);
              bookName = bookResponse.data.b_name || 'Unknown Book';
            } catch (err) {
              // Handle book fetch error
            }
          }

          // Determine the date to display based on the current tab
          if (payment.haspaid) {
            date = payment.updated_at; // Orders
          } else {
            date = payment.created_at; // Cart
          }

          // Convert UTC date to IST and format
          const localDate = new Date(date).toLocaleString('en-GB', { 
            timeZone: 'Asia/Kolkata',
            hour12: false 
          });

          return {
            userId: payment.u_id,
            userName: userName,
            bookName: bookName,
            hasPaid: payment.haspaid,
            date: localDate // Display the local date
          };
        }));

        setPayments(detailedPayments);
      } catch (err) {
        setError('Error fetching data');
        // Handle fetch error
      }
    };

    fetchPayments();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  const filteredPayments = currentTab === 'orders'
    ? payments.filter(payment => payment.hasPaid)
    : payments.filter(payment => !payment.hasPaid);

  const handleViewUser = (userId) => {
    navigate(`/portal/user-view/${userId}`);
  };

  return (
    <div className="container">
      <h1 className="title">Sales Dashboard</h1>
      <div className="tabs">
        <button
          className={`tab ${currentTab === 'orders' ? 'active' : ''}`}
          onClick={() => setCurrentTab('orders')}
        >
          Orders
        </button>
        <button
          className={`tab ${currentTab === 'cart' ? 'active' : ''}`}
          onClick={() => setCurrentTab('cart')}
        >
          Cart
        </button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>S. No</th>
            <th>Student Name</th>
            <th>App Name</th>
            <th>Payment Status</th>
            <th>Date</th> {/* Added new column for date */}
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredPayments.map((payment, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{payment.userName}</td>
              <td>{payment.bookName}</td>
              <td>{payment.hasPaid ? 'Paid' : 'Not Paid'}</td>
              <td>{payment.date}</td> {/* Display date */}
              <td>
                <button className="button" onClick={() => handleViewUser(payment.userId)}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

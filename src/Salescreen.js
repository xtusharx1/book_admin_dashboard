import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Salescreen.css'; // Assuming the CSS is saved in Salescreen.css

export default function Salescreen() {
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState({});
  const [followUps, setFollowUps] = useState([]);
  const [error, setError] = useState(null);
  const [currentTab, setCurrentTab] = useState('orders');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const paymentResponse = await axios.get('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/payments/all');
        const paymentData = paymentResponse.data;
    
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
    
          // Use the raw created_at date for sorting
          date = payment.created_at;
    
          const localDate = new Date(date).toLocaleString('en-GB', { 
            timeZone: 'Asia/Kolkata',
            hour12: false 
          });
    
          return {
            userId: payment.u_id,
            userName: userName,
            bookName: bookName,
            hasPaid: payment.haspaid,
            date: localDate, // Display the local date
            rawDate: new Date(date) // Raw date for sorting
          };
        }));
    
        // Sort by raw created_at date in decreasing order (most recent first)
        detailedPayments.sort((a, b) => b.rawDate - a.rawDate);
    
        setPayments(detailedPayments);
      } catch (err) {
        setError('Error fetching payments data');
      }
    };
    

    const fetchUsersAndActivities = async () => {
      try {
        // Fetch users
        const userResponse = await axios.get('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/users/showusers');
        const usersData = userResponse.data;
    
        // Fetch all activities from the provided API
        const activityResponse = await axios.get('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/activities/');
        const activitiesData = activityResponse.data;
    
        // Create a map of user activities by user ID
        const activitiesMap = {};
        activitiesData.forEach(activity => {
          const userId = activity.u_id;
          if (!activitiesMap[userId]) {
            activitiesMap[userId] = [];
          }
          activitiesMap[userId].push(activity);
        });
    
        // Sort activities by date (most recent first) for each user
        Object.keys(activitiesMap).forEach(userId => {
          activitiesMap[userId] = activitiesMap[userId].sort((a, b) => new Date(b.activity_date) - new Date(a.activity_date));
        });
    
        // Sort users:
        // 1. Users with activities by the most recent activity's `activity_date`.
        // 2. Users without activities by their `created_at`.
        const sortedUsers = usersData.sort((a, b) => {
          const aRecentActivityDate = activitiesMap[a.u_id]?.[0]?.activity_date || a.created_at;
          const bRecentActivityDate = activitiesMap[b.u_id]?.[0]?.activity_date || b.created_at;
          const aHasActivities = activitiesMap[a.u_id]?.length > 0;
          const bHasActivities = activitiesMap[b.u_id]?.length > 0;
    
          // Sort users with activities before those without
          if (aHasActivities && !bHasActivities) return -1;
          if (!aHasActivities && bHasActivities) return 1;
    
          // If both have or don't have activities, sort by the date
          return new Date(bRecentActivityDate) - new Date(aRecentActivityDate);
        });
    
        // Update state with sorted users and activities
        setUsers(sortedUsers);
        setActivities(activitiesMap);
    
      } catch (err) {
        console.error('Error fetching users or activities data:', err);
        setError('Error fetching users or activities data');
      }
    };
    
    
    

    const fetchFollowUps = async () => {
      try {
        const followUpResponse = await axios.get('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/followups/');
        const followUpsData = followUpResponse.data;
    
        const today = new Date();
    
        const detailedFollowUps = await Promise.all(followUpsData.map(async (followUp) => {
          let activityName = 'Unknown Activity';
          let userName = 'Unknown User';
          let userId = 'Unknown User ID';
    
          try {
            const activityResponse = await axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/activities/${followUp.activity_id}`);
            const activity = activityResponse.data;
            activityName = activity ? activity.activity_name : 'Unknown Activity';
            userId = activity ? activity.u_id : 'Unknown User ID';
    
            try {
              const userResponse = await axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/users/getbyid/${userId}`);
              const user = userResponse.data;
              userName = user ? user.f_name : 'Unknown User';
            } catch (err) {
              console.error(`Error fetching user for userId ${userId}:`, err);
            }
          } catch (err) {
            console.error(`Error fetching activity for activity_id ${followUp.activity_id}:`, err);
          }
    
          const followupDate = new Date(followUp.followup_date);
          let status = '';
    
          if (followupDate.toDateString() === today.toDateString()) {
            status = 'Today';
          } else if (followupDate > today) {
            status = 'Upcoming';
          } else {
            status = 'Passed';
          }
    
          return {
            followupId: followUp.followup_id,
            userId: userId,
            userName: userName,
            leadStatus: activityName,
            followupTask: followUp.notes,
            followupDate: followupDate.toLocaleDateString('en-GB'),
            isCompleted: followUp.isCompleted,
            status: status,
            rawDate: followupDate // Add rawDate for sorting
          };
        }));
    
        detailedFollowUps.sort((a, b) => {
          // Handle Today entries first in ascending order
          if (a.status === 'Today' && b.status !== 'Today') return -1;
          if (a.status !== 'Today' && b.status === 'Today') return 1;
    
          // Handle Upcoming entries next in ascending order
          if (a.status === 'Upcoming' && b.status !== 'Upcoming') return -1;
          if (a.status !== 'Upcoming' && b.status === 'Upcoming') return 1;
    
          // Handle Passed entries last in descending order
          if (a.status === 'Passed' && b.status !== 'Passed') return 1;
          if (a.status !== 'Passed' && b.status === 'Passed') return -1;
    
          // For all statuses, sort by date
          return a.status === 'Passed'
            ? new Date(b.rawDate) - new Date(a.rawDate) // Descending order for Passed
            : new Date(a.rawDate) - new Date(b.rawDate); // Ascending order for Today and Upcoming
        });
    
        setFollowUps(detailedFollowUps);
      } catch (err) {
        console.error('Error fetching follow-ups data:', err);
        setError('Error fetching follow-ups data');
      }
    };
    
    



    
    if (currentTab === 'Lead Status') {
      fetchUsersAndActivities();
    } else if (currentTab === 'Follow-Up') {
      fetchFollowUps();
    } else {
      fetchPayments();
    }
  }, [currentTab]);

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
      <h1 className="title">CRM Dashboard</h1>
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
        <button
          className={`tab ${currentTab === 'Lead Status' ? 'active' : ''}`}
          onClick={() => setCurrentTab('Lead Status')}
        >
          Lead Status
        </button>
        <button
          className={`tab ${currentTab === 'Follow-Up' ? 'active' : ''}`}
          onClick={() => setCurrentTab('Follow-Up')}
        >
          Follow-Up
        </button>
      </div>
      {currentTab === 'Lead Status' ? (
        <table className="table">
          <thead>
            <tr>
              <th>S. No</th>
              <th>User ID</th>
              <th>Student Name</th>
              <th>Recent Lead Status</th>
              <th>Recent Activity Date</th>
              <th>Notes</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => {
              const recentActivity = activities[user.u_id]?.[0];
              return (
                <tr key={user.u_id}>
                  <td>{index + 1}</td>
                  <td>{user.u_id}</td>
                  <td>{user.f_name}</td>
                  <td>{recentActivity ? recentActivity.activity_name : 'No Activity'}</td>
                  <td>{recentActivity ? new Date(recentActivity.activity_date).toLocaleDateString('en-GB') : 'N/A'}</td>
                  <td>{recentActivity ? recentActivity.notes : 'No Notes'}</td>
                  <td>
                    <button
                      className="view-button"
                      onClick={() => handleViewUser(user.u_id)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : 
      currentTab === 'Follow-Up' ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>S. No</th>
                <th>User ID</th>
                <th>User Name</th>
                <th>Lead Status (Activity Name)</th>
                <th>Follow-Up Task (Note)</th>
                <th>Follow-Up Date</th>
                <th>Status</th> {/* New column for follow-up status */}
                <th>Completed</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {followUps.map((followUp, index) => (
                <tr key={followUp.followupId}>
                  <td>{index + 1}</td>
                  <td>{followUp.userId}</td>
                  <td>{followUp.userName}</td>
                  <td>{followUp.leadStatus}</td>
                  <td>{followUp.followupTask}</td>
                  <td>{followUp.followupDate}</td>
                  <td className={`status ${followUp.status.toLowerCase()}`}>
                    {followUp.status}
                  </td>
                  <td className={`status ${followUp.isCompleted ? 'completed' : 'not-completed'}`}>
                    {followUp.isCompleted ? 'Yes' : 'No'}
                  </td>
                  <td>
                    <button
                      className="view-button"
                      onClick={() => handleViewUser(followUp.userId)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>S. No</th> {/* Added S. No column */}
              <th>User ID</th>
              <th>User Name</th>
              <th>Book Name</th>
              <th>Has Paid</th>
              <th>Date</th>
              <th>Action</th> {/* Added Action column */}
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((payment, index) => (
              <tr key={index}>
                <td>{index + 1}</td> {/* Display S. No */}
                <td>{payment.userId}</td>
                <td>{payment.userName}</td>
                <td>{payment.bookName}</td>
                <td>{payment.hasPaid ? 'Yes' : 'No'}</td>
                <td>{payment.date}</td>
                <td>
                  <button
                    className="view-button"
                    onClick={() => handleViewUser(payment.userId)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

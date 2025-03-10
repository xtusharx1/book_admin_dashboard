import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Salescreen.css'; // Assuming the CSS is saved in Salescreen.css
import {Bar,} from 'react-chartjs-2';

export default function Salescreen() {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState({});
  const [followUps, setFollowUps] = useState([]);
  const [currentTab, setCurrentTab] = useState('orders');
  const [selectedActivity, setSelectedActivity] = useState('All'); // State for selected activity
  const navigate = useNavigate();
  const [activityChartData, setActivityChartData] = useState({ labels: [], datasets: [] });
  const [selectedLabel, setSelectedLabel] = useState('All'); // Add this line
  
  const fetchPayments = async () => {
    try {
      const paymentResponse = await axios.get(
        'http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/payments/all-with-details'
      );
      const paymentData = paymentResponse.data || [];

      const detailedPayments = paymentData.map(payment => {
        const date = payment.created_at || '';
        const rawDate = new Date(date);
        const localDate = isNaN(rawDate.getTime())
          ? 'Invalid Date'
          : rawDate.toLocaleString('en-GB', {
              timeZone: 'Asia/Kolkata',
              hour12: false,
            });

        return {
          sNo: payment.id,
          userId: payment.u_id,
          userName: payment.user?.f_name || 'Unknown User',
          bookName: payment.book?.b_name || 'Unknown Book',
          hasPaid: payment.haspaid || false,
          date: localDate,
          rawDate: rawDate,
          // Additional details if needed
          userEmail: payment.user?.email,
          userPhone: payment.user?.phonenumber,
          bookPrice: payment.book?.sell_price,
          bookDescription: payment.book?.description
        };
      });

      // Sort by date (most recent first)
      const sortedPayments = detailedPayments.sort((a, b) => b.rawDate - a.rawDate);
      
      console.log('Processed Payments:', sortedPayments);
      setPayments(sortedPayments);
    } catch (err) {
      console.error('Error fetching payments:', err.message);
      setError('Error fetching payments data');
    }
  };

  useEffect(() => {
    if (currentTab === 'orders' || currentTab === 'cart') {
      fetchPayments();
    }
  }, [currentTab]);

  const activityData = [
    { activity_name: "Not-interested", count: 0 },
    { activity_name: "Call-not-answered", count: 0 },
    { activity_name: "Online-admission-taken", count: 0 },
    { activity_name: "Interested", count: 0 },
    { activity_name: "Call-answered", count: 0 },
    { activity_name: "Gurgaon-campus-visited", count: 0 },
    { activity_name: "Gurgaon-admission-taken", count: 0 },
    { activity_name: "Delhi-campus-visited", count: 0 },
    { activity_name: "Online-admission-done", count: 0 },
    { activity_name: "Online-demo-taken", count: 0 },
  ];

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        const response = await axios.get('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/activities/activities/count');
        const data = response.data;

        // Check if the response is an array
        if (Array.isArray(data)) {
          // Sort data in descending order based on count
          const sortedData = data.sort((a, b) => b.count - a.count);
          setActivities(sortedData);
          // Prepare chart data
          setActivityChartData({
            labels: sortedData.map(activity => activity.activity_name),
            datasets: [{
              label: 'Activity Count',
              data: sortedData.map(activity => activity.count),
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            }],
          });
        } else {
          console.error('Expected an array but got:', data);
        }
      } catch (error) {
        console.error('Error fetching activity data:', error);
      }
    };

    fetchActivityData();
  }, []);

  const chartOptions = {
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Activity Names', // Title for the x-axis
        },
        ticks: {
          autoSkip: false, // Prevent skipping of labels
          maxRotation: 45, // Rotate labels if they are too long
          minRotation: 45,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Count', // Title for the y-axis
        },
      },
    },
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
  
  
  const fetchUsersAndActivitiesByName = async (activityName) => {
    try {
      setUsers([]); // Clear previous users
      setActivities({}); // Clear previous activities
  
      // Fetch users
      const userResponse = await axios.get('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/users/showusers');
      const usersData = userResponse.data;
  
      // Fetch activities by name
      const activityResponse = await axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/activities/activities/name/${activityName}`);
      const activitiesData = activityResponse.data;
  
      console.log("Fetched Activities:", activitiesData); // Log the raw data
      
      // Sort activities by activity_date in descending order
      activitiesData.sort((a, b) => new Date(b.activity_date) - new Date(a.activity_date));
  
      console.log("Sorted Activities:", activitiesData); // Log after sorting
  
      // Process data...
      const activitiesMap = {};
      activitiesData.forEach(activity => {
        const userId = activity.u_id;
        if (!activitiesMap[userId]) {
          activitiesMap[userId] = [];
        }
        activitiesMap[userId].push(activity);
      });
  
      setUsers(usersData);
      setActivities(activitiesMap);
    } catch (err) {
      console.error('Error fetching users or activities:', err);
      setError('Error fetching users or activities');
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
  
  



  
  useEffect(() => {
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
  window.open(`/portal/user-view/${userId}`, '_blank');
};

  const filteredFollowUps = selectedActivity && selectedActivity !== 'All'
    ? followUps.filter(followUp => followUp.leadStatus === selectedActivity)
    : followUps; // Filter follow-ups based on selected activity

    const filteredUsers = selectedActivity === 'All'
    ? users
    : users.filter(user => {
        const recentActivity = activities[user.u_id]?.[0];
        return recentActivity && recentActivity.activity_name === selectedActivity;
      });


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
  <>
    <div style={{ width: '100%', marginTop: '20px', height: '400px', overflow: 'hidden' }}>
      <h2>Leads Graph</h2>
      <Bar data={activityChartData} options={chartOptions} />
    </div>

    <div>
      <label htmlFor="activityFilter">Filter by Activity: </label>
      <select
        id="activityFilter"
        value={selectedActivity}
        onChange={(e) => {
          const selectedValue = e.target.value;
          setSelectedActivity(selectedValue);

          // Clear table data before fetching new data
          setUsers([]);
          setActivities({});

          if (selectedValue === "All") {
            fetchUsersAndActivities(); // Fetch all activities
          } else {
            fetchUsersAndActivitiesByName(selectedValue); // Fetch by activity name
          }
        }}
      >
        <option value="All">All</option>
        {activityData.map((activity, index) => (
          <option key={index} value={activity.activity_name}>
            {activity.activity_name}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label htmlFor="labelFilter">Filter by Label: </label>
      <select
        id="labelFilter"
        value={selectedLabel}
        onChange={(e) => setSelectedLabel(e.target.value)}
      >
        <option value="All">All</option>
        {[...new Set(filteredUsers.map(user => activities[user.u_id]?.[0]?.description).filter(Boolean))].map((label, index) => (
          <option key={index} value={label}>{label}</option>
        ))}
      </select>
    </div>

    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>S. No</th>
            <th>User ID</th>
            <th>User Name</th>
            <th>Recent Lead Status</th>
            <th>Label</th>
            <th>Recent Activity Date</th>
            <th>Notes</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ textAlign: 'center' }}>No Data Available</td>
            </tr>
          ) : (
            filteredUsers
              .filter(user => {
                const recentActivity = activities[user.u_id]?.[0];
                return selectedLabel === 'All' || recentActivity?.description === selectedLabel;
              })
              .map((user, index) => {
                const recentActivity = activities[user.u_id]?.[0];
                return (
                  <tr key={user.u_id}>
                    <td>{index + 1}</td>
                    <td>{user.u_id}</td>
                    <td>{user.f_name}</td>
                    <td>{recentActivity ? recentActivity.activity_name : 'No Activity'}</td>
                    <td>{recentActivity ? recentActivity.description : 'N/A'}</td>
                    <td>{recentActivity ? new Date(recentActivity.activity_date).toLocaleDateString('en-GB') : 'N/A'}</td>
                    <td>{recentActivity ? recentActivity.notes : 'No Notes'}</td>
                    <td>
                      <button className="view-button" onClick={() => handleViewUser(user.u_id)}>
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
          )}
        </tbody>
      </table>
    </div>
  </>
)  : 
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
                <th>Status</th>
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
      
      ): (
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

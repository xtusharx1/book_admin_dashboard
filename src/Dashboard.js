import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import Card from './Card';
import {
  Chart as ChartJS, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, ArcElement
} from 'chart.js';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet'; 
ChartJS.register(Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, ArcElement);


function Dashboard() {
  const [loginActivityData, setLoginActivityData] = useState([]);
  const [loginDataProcessed, setLoginDataProcessed] = useState({
    labels: [],
    datasets: []
  });
  const [bookData, setBookData] = useState([]);
  const [studentData, setStudentData] = useState([]); 
  const [orderData, setOrderData] = useState([]);
  const [bookSoldData, setBookSoldData] = useState(0);
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [genderFilter, setGenderFilter] = useState('all');
  const [classFilter, setClassFilter] = useState(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [bookSalesData, setBookSalesData] = useState({ labels: [], datasets: [] });
  const [cartCount, setCartCount] = useState(0);
  const [totalscholarshipStudents, setTotalScholarshipStudents] = useState(0);
  const [activityData, setActivityData] = useState([]);

  const [filteractivity, setfilteractivity] = useState('all'); // Default filter

  
  useEffect(() => {
    fetchTotalScholarshipStudents();
    const fetchData = async () => {
      try {
        const bookResponse = await axios.get('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/books/all');
        setBookData(bookResponse.data);

        const studentResponse = await axios.get('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/users/showusers');
        setStudentData(studentResponse.data);

        const orderResponse = await axios.get('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/payments/all');
        const orders = orderResponse.data;

        if (Array.isArray(orders)) {
          setOrderData(orders);

          const bookSoldCount = orders.filter(order => order.haspaid).length;
          setBookSoldData(bookSoldCount);
          const cartItems = orders.filter(order => !order.haspaid && order.iscart);
          setCartCount(cartItems.length);  // Set cart count

          
        } else {
          setOrderData([]);
        }

        setTotalBooks(bookResponse.data.length);
        setTotalStudents(studentResponse.data.length);
        await fetchLoginData(filteractivity);
        await fetchBookSalesData();
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [filteractivity]); 
  

// Fetch the count on component mount
useEffect(() => {
    
}, []);

  
const fetchLoginData = async () => {
  console.log('Fetching login data for filter:', filteractivity); // Log the selected filter
  try {
      const url = getLoginDataUrl(filteractivity);

      const loginResponse = await axios.get(url);

      // Ensure that data is in the expected format before setting it
      if (loginResponse.data) {
          setLoginActivityData(loginResponse.data);
          processLoginData(loginResponse.data);
      } else {
          console.warn('No data returned from API');
      }
  } catch (error) {
      console.error('Error fetching login data:', error);
  }
};
const fetchTotalScholarshipStudents = async () => {
  try {
    const response = await axios.get('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/scholarship-results/scholarship-results/count');
    setTotalScholarshipStudents(response.data.count); // Update state with the count for scholarship students
    console.log('fetch scholarship data successful', response.data.count);
  } catch (error) {
    console.error('Error fetching total scholarship students count:', error);
  }
};

// Helper function to get the appropriate login data URL based on the filter
const getLoginDataUrl = (filter) => {
  console.log('Getting URL for filter:', filter); // Log the received filter
  let url;

  switch (filter) {
      case 'last24':
          url = 'http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/userapplogin/last24';
          break;
      case 'last7':
          url = 'http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/userapplogin/last7';
          break;
      case 'all':
      default:
          url = 'http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/userapplogin/all';
          break;
  }

  return url;
};


  useEffect(() => {
    fetchBookSalesData();
    fetchLoginData();
  }, [orderData]);

  const fetchBookSalesData = async () => {
    try {
      if (!Array.isArray(orderData) || orderData.length === 0) {
        setBookSalesData({
          labels: ['No Data'],
          datasets: [{
            label: 'Book Sales',
            data: [1],
            backgroundColor: ['rgba(255, 99, 132, 0.2)'],
            borderColor: ['rgba(255, 99, 132, 1)'],
            borderWidth: 1
          }]
        });
        return;
      }

      const paidOrders = orderData.filter(order => order.haspaid);

      if (paidOrders.length === 0) {
        setBookSalesData({
          labels: ['No Data'],
          datasets: [{
            label: 'Book Sales',
            data: [1],
            backgroundColor: ['rgba(255, 99, 132, 0.2)'],
            borderColor: ['rgba(255, 99, 132, 1)'],
            borderWidth: 1
          }]
        });
        return;
      }

      const bookSales = paidOrders.reduce((acc, order) => {
        const bookId = order.b_id;
        if (bookId) {
          acc[bookId] = (acc[bookId] || 0) + 1;
        }
        return acc;
      }, {});

      const bookSalesEntries = Object.entries(bookSales);

      if (bookSalesEntries.length === 0) {
        setBookSalesData({
          labels: ['No Data'],
          datasets: [{
            label: 'Book Sales',
            data: [1],
            backgroundColor: ['rgba(255, 99, 132, 0.2)'],
            borderColor: ['rgba(255, 99, 132, 1)'],
            borderWidth: 1
          }]
        });
        return;
      }

      const bookDetailsPromises = bookSalesEntries.map(([bookId]) => {
        return axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/books/getbook/${bookId}`)
          .then(response => ({ bookId, ...response.data }))
          .catch(error => {
            console.error(`Error fetching details for bookId: ${bookId}`, error);
            return { bookId, b_name: 'Unknown' };
          });
      });

      const bookDetailsResponses = await Promise.all(bookDetailsPromises);

      const bookDetails = bookDetailsResponses.reduce((acc, { bookId, b_name }) => {
        acc[bookId] = b_name;
        return acc;
      }, {});

      if (Object.keys(bookDetails).length === 0) {
        setBookSalesData({
          labels: ['No Data'],
          datasets: [{
            label: 'Book Sales',
            data: [1],
            backgroundColor: ['rgba(255, 99, 132, 0.2)'],
            borderColor: ['rgba(255, 99, 132, 1)'],
            borderWidth: 1
          }]
        });
        return;
      }

      const colors = [
        'rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)',
        'rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)'
      ];

      const backgroundColors = bookSalesEntries.map((_, index) => colors[index % colors.length]);
      const borderColors = backgroundColors.map(color => color.replace('0.2', '1'));

      setBookSalesData({
        labels: bookSalesEntries.map(([bookId]) => bookDetails[bookId] || 'Unknown'),
        datasets: [{
          label: 'Book Sales',
          data: bookSalesEntries.map(([_, count]) => count),
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1
        }]
      });
    } catch (error) {
      console.error('Error fetching book sales data:', error);
    }
  };

  
  const filterByDateRange = (data) => {
    if (dateFilter === 'custom') {
      const { start, end } = customDateRange;
      if (start && end) {
        return data.filter(item => {
          const date = new Date(item.created_at);
          return date >= new Date(start) && date <= new Date(end);
        });
      }
    } else if (dateFilter === 'month') {
      const now = new Date();
      return data.filter(item => {
        const date = new Date(item.created_at);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      });
    } else if (dateFilter === 'year') {
      const now = new Date();
      return data.filter(item => {
        const date = new Date(item.created_at);
        return date.getFullYear() === now.getFullYear();
      });
    }
    return data;
  };

  const getStudentsByState = () => {
    const filteredStudents = filterByDateRange(studentData).filter(student =>
      (genderFilter === 'all' || student.gender.toLowerCase() === genderFilter) &&
      (!classFilter || student.c_entry.includes(classFilter))
    );
  
    const studentsByState = filteredStudents.reduce((acc, student) => {
      const state = student.state.trim();
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {});
  
    // Convert the object into an array and sort it in descending order by the number of students
    const sortedEntries = Object.entries(studentsByState).sort((a, b) => b[1] - a[1]);
  
    // Convert the sorted array back into two separate arrays: one for labels (states) and one for data (number of students)
    const sortedLabels = sortedEntries.map(([state]) => state);
    const sortedData = sortedEntries.map(([, count]) => count);
  
    return {
      labels: sortedLabels,
      datasets: [{
        label: 'Students',
        data: sortedData,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    };
  };
  

  const getRegistrationData = () => {
    // Sort studentData by created_at date in ascending order
    const sortedData = [...studentData].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  
    // Filter the sorted data based on the selected date filter
    const filteredData = sortedData.filter(student => {
      const date = new Date(student.created_at);
      if (dateFilter === 'month') {
        return date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear();
      } else if (dateFilter === 'year') {
        return date.getFullYear() === new Date().getFullYear();
      }
      return true;
    });
  
    // Group the filtered data by date
    const groupedData = filteredData.reduce((acc, student) => {
      const date = new Date(student.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
  
    return {
      labels: Object.keys(groupedData),
      datasets: [{
        label: 'Registrations',
        data: Object.values(groupedData),
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      }]
      
    };
  };
  const processLoginData = async (loginData) => {
    try {
      // Count logins per book
      const loginCounts = loginData.reduce((acc, login) => {
        const bookId = login.b_id;
        if (bookId) {
          acc[bookId] = (acc[bookId] || 0) + 1;
        }
        return acc;
      }, {});
  
      let loginEntries = Object.entries(loginCounts);
  
      if (loginEntries.length === 0) {
        setLoginDataProcessed({
          labels: ['No Data'],
          datasets: [{
            label: 'App Downloads',
            data: [1],
            backgroundColor: ['rgba(255, 99, 132, 0.2)'],
            borderColor: ['rgba(255, 99, 132, 1)'],
            borderWidth: 1
          }]
        });
        return;
      }
  
      // Sort the login entries by the number of downloads in descending order
      loginEntries = loginEntries.sort((a, b) => b[1] - a[1]);
  
      // Fetch book details
      const bookDetailsPromises = loginEntries.map(([bookId]) => 
        axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/books/getbook/${bookId}`)
          .then(response => ({ bookId, ...response.data }))
          .catch(error => {
            console.error(`Error fetching details for bookId: ${bookId}`, error);
            return { bookId, b_name: 'Unknown' };
          })
      );
  
      const bookDetailsResponses = await Promise.all(bookDetailsPromises);
  
      const bookDetails = bookDetailsResponses.reduce((acc, { bookId, b_name }) => {
        acc[bookId] = b_name;
        return acc;
      }, {});
  
      const colors = [
        'rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)',
        'rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)'
      ];
  
      const backgroundColors = loginEntries.map((_, index) => colors[index % colors.length]);
      const borderColors = backgroundColors.map(color => color.replace('0.2', '1'));
  
      setLoginDataProcessed({
        labels: loginEntries.map(([bookId]) => bookDetails[bookId] || 'Unknown'),
        datasets: [{
          label: 'App Downloads',
          data: loginEntries.map(([_, count]) => count),
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1
        }]
      });
    } catch (error) {
      console.error('Error processing login data:', error);
    }
  };
  const handlefilteractivityChange = (e) => {
    const selectedFilter = e.target.value;
    setfilteractivity(selectedFilter);
    fetchLoginData(); // Fetch login data with the new filter
    console.log('Selected Filter:', selectedFilter);
  };
  

  const getGenderDistribution = () => {
    const maleCount = studentData.filter(student => student.gender.toLowerCase() === 'male').length;
    const femaleCount = studentData.filter(student => student.gender.toLowerCase() === 'female').length;

    return {
      labels: ['Male', 'Female'],
      datasets: [{
        label: 'Gender Distribution',
        data: [maleCount, femaleCount],
        backgroundColor: ['rgba(54, 162, 235, 0.2)', 'rgba(255, 99, 132, 0.2)'],
        borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1
      }]
    };
  };

  
  // Chart options to display x-axis labels
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

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ marginBottom: '20px' }}>Dashboard</h1>
      <div style={{ 
  display: 'flex', 
  justifyContent: 'space-between', 
  marginBottom: '20px', 
  gap: '20px',
  flexWrap: 'wrap', // Allow cards to wrap if they can't fit in a single line
  overflow: 'hidden', // Prevent scrolling
  width: '100%' // Ensure the container takes full available width
}}>
  <Card style={{ flex: '1 1 20%', minWidth: '180px' }} title="Books Sold" value={bookSoldData} />
  <Card style={{ flex: '1 1 20%', minWidth: '180px' }} title="Cart Count" value={cartCount} />
  <Card style={{ flex: '1 1 20%', minWidth: '180px' }} title="Total Books" value={totalBooks} />
  <Card style={{ flex: '1 1 20%', minWidth: '180px' }} title="Total Students" value={totalStudents} />
  <Card style={{ flex: '1 1 20%', minWidth: '180px' }} title="Total Scholarship Attempts" value={totalscholarshipStudents} />
</div>


      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ width: '48%' }}>
          <h2>Students by State</h2>
          <Bar data={getStudentsByState()} />
          <div style={{ marginTop: '20px' }}>
            <label style={{ marginRight: '10px' }}>Gender: </label>
            <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)} style={{ padding: '5px', marginRight: '20px' }}>
              <option value="all">All</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>

            <label style={{ marginRight: '10px' }}>Class: </label>
            <select value={classFilter} onChange={e => setClassFilter(e.target.value)} style={{ padding: '5px' }}>
              <option value="">All</option>
              <option value="6">Class 6</option>
              <option value="9">Class 9</option>
            </select>
          </div>
        </div>
        <div style={{ width: '48%' }}>
          <h2>User Registrations</h2>
          <Line data={getRegistrationData()} />
          <div style={{ marginTop: '20px' }}>
            <label style={{ marginRight: '10px' }}>Date: </label>
            <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={{ padding: '5px', marginRight: '20px' }}>
              <option value="all">All</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>

            {dateFilter === 'custom' && (
              <div style={{ marginTop: '10px' }}>
                <label style={{ marginRight: '10px' }}>Start Date: </label>
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={e => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                  style={{ padding: '5px', marginRight: '20px' }}
                />

                <label style={{ marginRight: '10px' }}>End Date: </label>
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={e => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                  style={{ padding: '5px' }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <div style={{ width: '48%', height: '400px' }}>
          <h2>Gender Distribution</h2>
          <Doughnut data={getGenderDistribution()} options={{ maintainAspectRatio: false }} />
        </div>
        <div style={{ width: '48%', height: '400px' }}>
          <h2>Book Sales</h2>
          <Pie data={bookSalesData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>
      <br></br><br></br><br></br><br></br>
      <div style={{ height: '400px', width: '100%' }}>
      <label htmlFor="filteractivity">Filter Login Activity:</label>
      <select id="filteractivity" value={filteractivity} onChange={handlefilteractivityChange}>
        <option value="all">All</option>
        <option value="last24">Last 24 Hours</option>
        <option value="last7">Last 7 Days</option>
      </select>
  <h2>App Downloads</h2>
  
  <Bar data={loginDataProcessed} options={{ maintainAspectRatio: false }} />
  
</div>

<br></br><br></br><br></br><br></br>

<a
  href="/portal/locationmap"
  target="_blank" // Open link in a new tab
  rel="noopener noreferrer" // Security recommendation
  style={{
    padding: '0.8rem 1.2rem',
    marginBottom: '1rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    textDecoration: 'none', // Remove underline from the link
    display: 'inline-block',
  }}
>
  Show Map
</a>

    </div>
    
  );
}


export default Dashboard;

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
  const [locations, setLocations] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [filteractivity, setfilteractivity] = useState('all'); // Default filter

  useEffect(() => {
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
            }

            setTotalBooks(bookResponse.data.length);
            setTotalStudents(studentResponse.data.length);

            // Fetch login data based on the current filter
            await fetchLoginData(filteractivity); // Await to maintain order if needed
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    fetchData();
}, [filteractivity]); // Dependency on filteractivity

const fetchLoginData = async () => {
  console.log('Fetching login data for filter:', filteractivity); // Log the selected filter
  try {
      const url = getLoginDataUrl(filteractivity);
      console.log('Using URL:', url); // Log the URL being fetched

      const loginResponse = await axios.get(url);
      console.log('API Response:', loginResponse.data); // Log the response from the API

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

// Helper function to get the appropriate login data URL based on the filter
const getLoginDataUrl = (filter) => {
  console.log('Getting URL for filter:', filter); // Log the received filter
  let url;

  switch (filter) {
      case 'last24':
          url = 'http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/userapplogin/last24';
          console.log('Selected URL for last 24 hours:', url); // Log URL for last 24 hours
          break;
      case 'last7':
          url = 'http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/userapplogin/last7';
          console.log('Selected URL for last 7 days:', url); // Log URL for last 7 days
          break;
      case 'all':
      default:
          url = 'http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/userapplogin/all';
          console.log('Selected URL for all data:', url); // Log URL for all data
          break;
  }

  return url;
};
  

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

  const fetchLocations = async () => {
    try {
      const response = await axios.get('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/locations/all/');
      setLocations(response.data);
    } catch (error) {
      console.error('Error fetching location data:', error);
    }
  };
  const defaultIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    shadowSize: [41, 41]
  });
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

      // Fetch book details for the login entries
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

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ marginBottom: '20px' }}>Dashboard</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Card title="Books Sold" value={bookSoldData} />
        <Card title="Cart Count" value={cartCount} />
        <Card title="Total Books" value={totalBooks} />
        <Card title="Total Students" value={totalStudents} />
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
      <div>
      <label htmlFor="filteractivity">Filter Login Activity:</label>
      <select id="filteractivity" value={filteractivity} onChange={handlefilteractivityChange}>
        <option value="all">All</option>
        <option value="last24">Last 24 Hours</option>
        <option value="last7">Last 7 Days</option>
      </select>

      {/* Login Activity Chart */}
      <h2>Login Activity</h2>
      <div style={{ width: '800px', height: '400px' }}>
        <Bar data={loginDataProcessed} options={{ maintainAspectRatio: false }} />
 
      </div>
    </div>
</div>

{/* <br></br><br></br><br></br><br></br>
<h2>Map</h2>
      <div className="dashboard-map">
        <MapContainer center={[21.1458, 79.0882]} zoom={5} style={{ height: '800px', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {locations.map(location => (
            <Marker
              key={location.location_id}
              position={[location.latitude, location.longitude]}
              icon={defaultIcon}
            >
              <Popup>
               <a href={`/portal/user-view/${location.u_id}`}
                className="btn btn-primary btn-sm"
                style={{
                  padding: '0.5rem',
                  textDecoration: 'none',
                  color: 'white',
                  backgroundColor: '#007bff',
                  borderRadius: '5px',
                  display: 'inline-block',
                }}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Profile
              </a>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div> */}

      
    </div>
    
  );
}


export default Dashboard;

import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS, Tooltip, Legend, CategoryScale, LinearScale, 
  PointElement, LineElement, BarElement, Title, ArcElement
} from 'chart.js';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

ChartJS.register(
  Tooltip, Legend, CategoryScale, LinearScale, 
  PointElement, LineElement, BarElement, Title, ArcElement
);

// Card component with improved styling
const Card = ({ title, value, icon, color }) => (
  <div className="dashboard-card" style={{
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    border: `1px solid ${color || '#e0e0e0'}`,
    borderLeft: `5px solid ${color || '#4A6FDC'}`,
  }}>
    <div>
      <h3 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '16px' }}>{title}</h3>
      <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: color || '#4A6FDC' }}>{value}</p>
    </div>
    {icon && <div style={{ fontSize: '32px', color: color || '#4A6FDC' }}>{icon}</div>}
  </div>
);

function Dashboard() {
  const [loginActivityData, setLoginActivityData] = useState([]);
  const [loginDataProcessed, setLoginDataProcessed] = useState({ labels: [], datasets: [] });
  const [bookData, setBookData] = useState([]);
  const [studentData, setStudentData] = useState([]);
  const [orderData, setOrderData] = useState([]);
  const [bookSoldData, setBookSoldData] = useState(0);
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [genderFilter, setGenderFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [bookSalesData, setBookSalesData] = useState({ labels: [], datasets: [] });
  const [cartCount, setCartCount] = useState(0);
  const [totalscholarshipStudents, setTotalScholarshipStudents] = useState(0);
  const [filteractivity, setFilterActivity] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseUrl = 'http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000';

  // Chart theme configuration
  const chartTheme = {
    backgroundColor: [
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 99, 132, 0.6)',
      'rgba(255, 206, 86, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      'rgba(255, 159, 64, 0.6)',
      'rgba(201, 203, 207, 0.6)',
      'rgba(139, 195, 74, 0.6)',
      'rgba(233, 30, 99, 0.6)',
      'rgba(156, 39, 176, 0.6)'
    ],
    borderColor: [
      'rgba(54, 162, 235, 1)',
      'rgba(255, 99, 132, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)',
      'rgba(201, 203, 207, 1)',
      'rgba(139, 195, 74, 1)',
      'rgba(233, 30, 99, 1)',
      'rgba(156, 39, 176, 1)'
    ]
  };

  useEffect(() => {
    fetchData();
    fetchTotalScholarshipStudents();
  }, [filteractivity]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookResponse, studentResponse, orderResponse] = await Promise.all([
        axios.get(`${baseUrl}/api/books/all`),
        axios.get(`${baseUrl}/api/users/showusers`),
        axios.get(`${baseUrl}/api/payments/all`)
      ]);

      setBookData(bookResponse.data);
      setStudentData(studentResponse.data);
      
      const orders = orderResponse.data;
      if (Array.isArray(orders)) {
        setOrderData(orders);
        const bookSoldCount = orders.filter(order => order.haspaid).length;
        setBookSoldData(bookSoldCount);
        const cartItems = orders.filter(order => !order.haspaid && order.iscart);
        setCartCount(cartItems.length);
      } else {
        setOrderData([]);
      }

      setTotalBooks(bookResponse.data.length);
      setTotalStudents(studentResponse.data.length);
      
      await fetchLoginData();
      await fetchBookSalesData();
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const fetchTotalScholarshipStudents = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/scholarship-results/scholarship-results/count`);
      setTotalScholarshipStudents(response.data.count);
    } catch (error) {
      console.error('Error fetching scholarship students count:', error);
    }
  };

  const fetchLoginData = async () => {
    try {
      const url = getLoginDataUrl(filteractivity);
      const loginResponse = await axios.get(url);
      
      if (loginResponse.data) {
        setLoginActivityData(loginResponse.data);
        processLoginData(loginResponse.data);
      }
    } catch (error) {
      console.error('Error fetching login data:', error);
    }
  };

  const getLoginDataUrl = (filter) => {
    let endpoint;
    switch (filter) {
      case 'last24': endpoint = '/api/userapplogin/last24'; break;
      case 'last7': endpoint = '/api/userapplogin/last7'; break;
      case 'last30': endpoint = '/api/userapplogin/last30'; break;
      case 'all': 
      default: endpoint = '/api/userapplogin/all'; break;
    }
    return `${baseUrl}${endpoint}`;
  };

  const fetchBookSalesData = async () => {
    try {
      console.log("Fetching book sales data from backend...");
  
      const response = await axios.get(`${baseUrl}/api/payments/sales-by-book`);
      const salesData = response.data;
  
      if (!Array.isArray(salesData) || salesData.length === 0) {
        console.log("No sales data found");
        setBookSalesData(getEmptyChartData('Book Sales'));
        return;
      }
  
      // Sort all sales by count (optional, but helps with visualization)
      const sortedBooks = salesData.sort((a, b) => Number(b.salesCount) - Number(a.salesCount));
  
      console.log("Book IDs from API:", sortedBooks.map(b => b.b_id));
  
      // Fetch book names for all book IDs
      const bookDetailsPromises = sortedBooks.map(({ b_id }) => {
        return axios.get(`${baseUrl}/api/books/getbook/${b_id}`)
          .then(res => ({ bookId: b_id, b_name: res.data.b_name }))
          .catch(err => {
            console.error(`Error fetching book ${b_id} details:`, err);
            return { bookId: b_id, b_name: `Book ${b_id}` };
          });
      });
  
      const bookDetails = await Promise.all(bookDetailsPromises);
      const bookNameMap = bookDetails.reduce((acc, { bookId, b_name }) => {
        acc[bookId] = b_name;
        return acc;
      }, {});
  
      const chartData = {
        labels: sortedBooks.map(({ b_id }) => {
          const name = bookNameMap[b_id];
          return name.length > 20 ? name.substring(0, 20) + '...' : name;
        }),
        datasets: [{
          label: 'Book Sales',
          data: sortedBooks.map(({ salesCount }) => Number(salesCount)),
          backgroundColor: chartTheme.backgroundColor,
          borderColor: chartTheme.borderColor,
          borderWidth: 2
        }]
      };
  
      console.log("Setting full book sales chart data:", chartData);
      setBookSalesData(chartData);
  
    } catch (error) {
      console.error("Error in fetchBookSalesData:", error);
      setBookSalesData(getEmptyChartData('Book Sales (Error Loading)'));
    }
  };
  
  const processLoginData = async (loginData) => {
    try {
      const loginCounts = loginData.reduce((acc, login) => {
        const bookId = login.b_id;
        if (bookId) {
          acc[bookId] = (acc[bookId] || 0) + 1;
        }
        return acc;
      }, {});
  
      let loginEntries = Object.entries(loginCounts);
      if (loginEntries.length === 0) {
        setLoginDataProcessed(getEmptyChartData('App Downloads'));
        return;
      }
  
      loginEntries = loginEntries.sort((a, b) => b[1] - a[1]);
  
      const bookDetailsPromises = loginEntries.map(([bookId]) => 
        axios.get(`${baseUrl}/api/books/getbook/${bookId}`)
          .then(response => ({ bookId, ...response.data }))
          .catch(() => ({ bookId, b_name: 'Unknown' }))
      );
  
      const bookDetailsResponses = await Promise.all(bookDetailsPromises);
      const bookDetails = bookDetailsResponses.reduce((acc, { bookId, b_name }) => {
        acc[bookId] = b_name;
        return acc;
      }, {});
  
      setLoginDataProcessed({
        labels: loginEntries.map(([bookId]) => bookDetails[bookId] || 'Unknown'),
        datasets: [{
          label: 'App Downloads',
          data: loginEntries.map(([_, count]) => count),
          backgroundColor: chartTheme.backgroundColor,
          borderColor: chartTheme.borderColor,
          borderWidth: 2
        }]
      });
    } catch (error) {
      console.error('Error processing login data:', error);
    }
  };

  const getEmptyChartData = (label) => ({
    labels: ['No Data'],
    datasets: [{
      label,
      data: [0],
      backgroundColor: chartTheme.backgroundColor[0],
      borderColor: chartTheme.borderColor[0],
      borderWidth: 2
    }]
  });

  const handleFilterActivityChange = (e) => {
    
    setFilterActivity(e.target.value);
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
      (genderFilter === 'all' || student.gender?.toLowerCase() === genderFilter) &&
      (!classFilter || student.c_entry?.includes(classFilter))
    );
  
    const studentsByState = filteredStudents.reduce((acc, student) => {
      const state = student.state?.trim() || 'Unknown';
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {});
  
    const sortedEntries = Object.entries(studentsByState).sort((a, b) => b[1] - a[1]);
    const sortedLabels = sortedEntries.map(([state]) => state);
    const sortedData = sortedEntries.map(([, count]) => count);
  
    return {
      labels: sortedLabels,
      datasets: [{
        label: 'Students',
        data: sortedData,
        backgroundColor: chartTheme.backgroundColor,
        borderColor: chartTheme.borderColor,
        borderWidth: 2
      }]
    };
  };

  const getRegistrationData = () => {
    const sortedData = [...studentData].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const filteredData = sortedData.filter(student => {
      const date = new Date(student.created_at);
      if (dateFilter === 'month') {
        return date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear();
      } else if (dateFilter === 'year') {
        return date.getFullYear() === new Date().getFullYear();
      }
      return true;
    });
  
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
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 2,
        pointRadius: 4,
        tension: 0.4
      }]
    };
  };

  const getGenderDistribution = () => {
    const maleCount = studentData.filter(student => student.gender?.toLowerCase() === 'male').length;
    const femaleCount = studentData.filter(student => student.gender?.toLowerCase() === 'female').length;

    return {
      labels: ['Male', 'Female'],
      datasets: [{
        label: 'Gender Distribution',
        data: [maleCount, femaleCount],
        backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)'],
        borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 2
      }]
    };
  };

  // Enhanced chart options
  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 10,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        },
        displayColors: true
      }
    },
    scales: {
      x: {
        ticks: {
          display: false // Hide X-axis labels
        },
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
    
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '20px',
        color: '#4A6FDC'
      }}>
        Loading dashboard data...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '20px',
        color: '#e53935'
      }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      color: '#333',
      backgroundColor: '#f5f7fa',
      minHeight: '100vh'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '25px'
      }}>
      
       
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px',
        marginBottom: '25px'
      }}>
        <Card title="Books Sold" value={bookSoldData} icon="📚" color="#4CAF50" />
        <Card title="Cart Items" value={cartCount} icon="🛒" color="#FF9800" />
        <Card title="Total Books" value={totalBooks} icon="📖" color="#2196F3" />
        <Card title="Total Students" value={totalStudents} icon="👨‍🎓" color="#9C27B0" />
        <Card title="Scholarship Attempts" value={totalscholarshipStudents} icon="🎓" color="#E91E63" />
      </div>

      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '25px',
        marginBottom: '25px'
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '10px', 
          padding: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Students by State</h2>
            <div style={{ display: 'flex', gap: '15px' }}>
              <select 
                value={genderFilter} 
                onChange={e => setGenderFilter(e.target.value)}
                style={selectStyle}
              >
                <option value="all">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>

              <select 
                value={classFilter} 
                onChange={e => setClassFilter(e.target.value)}
                style={selectStyle}
              >
                <option value="">All Classes</option>
                <option value="6">Class 6</option>
                <option value="9">Class 9</option>
              </select>
            </div>
          </div>
          <div style={{ height: '350px' }}>
            <Bar data={getStudentsByState()} options={chartOptions} />
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '10px', 
          padding: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>User Registrations</h2>
            <div>
              <select 
                value={dateFilter} 
                onChange={e => setDateFilter(e.target.value)}
                style={selectStyle}
              >
                <option value="all">All Time</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>
          
          {dateFilter === 'custom' && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '14px' }}>From:</label>
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={e => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '14px' }}>To:</label>
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={e => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                  style={inputStyle}
                />
              </div>
            </div>
          )}
          
          <div style={{ height: '350px' }}>
            <Line data={getRegistrationData()} options={chartOptions} />
          </div>
        </div>
      </div>

      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '25px',
        marginBottom: '25px'
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '10px', 
          padding: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: '600' }}>Gender Distribution</h2>
          <div style={{ height: '350px' }}>
            <Doughnut data={getGenderDistribution()} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '10px', 
          padding: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: '600' }}>Book Sales</h2>
          <div style={{ height: '350px' }}>
            <Pie data={bookSalesData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '10px', 
        padding: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        marginBottom: '25px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>App Downloads</h2>
          <div>
          <select 
  id="filteractivity" 
  value={filteractivity} 
  onChange={handleFilterActivityChange}
  style={selectStyle}
>
  <option value="all">All Time</option>
  <option value="last24">Last 24 Hours</option>
  <option value="last7">Last 7 Days</option>
  <option value="last30">Last 30 Days</option> {/* ✅ Added this */}
</select>

          </div>
        </div>
        <div style={{ height: '350px' }}>
          <Bar data={loginDataProcessed} options={chartOptions} />
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <a
          href="/portal/locationmap"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '12px 24px',
            backgroundColor: '#4A6FDC',
            color: 'white',
            border: 'none',
            borderRadius: '30px',
            textDecoration: 'none',
            display: 'inline-block',
            fontWeight: '600',
            boxShadow: '0 4px 6px rgba(74, 111, 220, 0.2)',
            transition: 'all 0.3s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#3958B3';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 8px rgba(74, 111, 220, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#4A6FDC';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(74, 111, 220, 0.2)';
          }}
        >
          Open Location Map
        </a>
      </div>
    </div>
  );
}

// Reusable style objects
const selectStyle = {
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid #e0e0e0',
  backgroundColor: 'white',
  fontSize: '14px',
  color: '#333',
  cursor: 'pointer',
  outline: 'none'
};

const inputStyle = {
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid #e0e0e0',
  backgroundColor: 'white',
  fontSize: '14px',
  color: '#333',
  outline: 'none'
};

export default Dashboard;
import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import Card from './Card';
import {
  Chart as ChartJS, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, ArcElement
} from 'chart.js';
import axios from 'axios';

ChartJS.register(Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, ArcElement);

function Dashboard() {
  const [bookData, setBookData] = useState([]);
  const [studentData, setStudentData] = useState([]);
  const [orderData, setOrderData] = useState([]);
  const [bookSoldData, setBookSoldData] = useState(0);
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [genderFilter, setGenderFilter] = useState('all');
  const [classFilter, setClassFilter] = useState(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [bookSalesData, setBookSalesData] = useState({ labels: [], datasets: [] });

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
        } else {
          console.error('Order data is not an array:', orders);
          setOrderData([]);
        }

        setTotalBooks(bookResponse.data.length);
        setTotalStudents(studentResponse.data.length);

        await fetchBookSalesData();
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    fetchBookSalesData();
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

  const getStudentsByState = () => {
    const filteredStudents = studentData.filter(student =>
      (genderFilter === 'all' || student.gender.toLowerCase() === genderFilter) &&
      (!classFilter || student.c_entry.includes(classFilter))
    );

    const studentsByState = filteredStudents.reduce((acc, student) => {
      const state = student.state.trim();
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(studentsByState),
      datasets: [{
        label: 'Students',
        data: Object.values(studentsByState),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    };
  };

  const getRegistrationData = () => {
    const filteredData = studentData.filter(student => {
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
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      }]
    };
  };

  const getGenderDistribution = () => {
    const maleCount = studentData.filter(student => student.gender === 'Male').length;
    const femaleCount = studentData.filter(student => student.gender === 'Female').length;

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
            <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={{ padding: '5px' }}>
              <option value="all">All</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
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

      <div style={{ marginTop: '40px' }}></div> {/* Added space at the bottom */}
    </div>
  );
}

export default Dashboard;

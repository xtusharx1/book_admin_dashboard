import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './PracticeTest.css';

function PracticeTest() {
  const [tests, setTests] = useState([]);
  const [latestTests, setLatestTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const testsResponse = await axios.get('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/tests/summary');
        const testsWithDetails = await Promise.all(
          testsResponse.data.map(async (test) => {
            try {
              const userResponse = await axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/users/getbyid/${test.u_id}`);
              const userName = userResponse.data.f_name || 'Unknown User';
              
              // Convert last_test_date to a valid Date object
              const testDate = new Date(test.last_test_date);
              
              return {
                ...test,
                userName,
                testDate
              };
            } catch (err) {
              console.error(`Error fetching user data for test ID ${test.u_id}:`, err.message);
              return {
                ...test,
                userName: 'Unknown',
                testDate: new Date() // Use the current date as fallback
              };
            }
          })
        );

        // Sort the tests by the testDate (most recent first)
        testsWithDetails.sort((a, b) => b.testDate - a.testDate);

        // Set the tests with details and sorted order
        setTests(testsWithDetails);
        setLatestTests(testsWithDetails); // Set latest tests for display
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tests:', err.message);
        setError('Failed to load tests. Please try again later.');
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="test-list-container">
      <h2 className="heading">Practice Test Details</h2>
      {latestTests.length === 0 ? (
        <p>No tests available.</p>
      ) : (
        <table className="test-table">
          <thead>
            <tr>
              <th style={{ backgroundColor: '#007bff', color: '#ffffff' }}>Serial No.</th>
              <th style={{ backgroundColor: '#007bff', color: '#ffffff' }}>Student Name</th>
              <th style={{ backgroundColor: '#007bff', color: '#ffffff' }}>Last Test Date</th>
              <th style={{ backgroundColor: '#007bff', color: '#ffffff' }}>Test Count</th>
              <th style={{ backgroundColor: '#007bff', color: '#ffffff' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {latestTests.map((test, index) => (
              <tr key={test.u_id} style={{ color: 'grey' }}>
                <td>
                  <Link
                    to={`/portal/Usertestdetails/${test.u_id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    {index + 1}
                  </Link>
                </td>
                <td>
                  <Link
                    to={`/portal/Usertestdetails/${test.u_id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    {test.userName}
                  </Link>
                </td>
                <td>
                  <Link
                    to={`/portal/Usertestdetails/${test.u_id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    {test.testDate.toDateString()}
                  </Link>
                </td>
                <td>
                  <Link
                    to={`/portal/Usertestdetails/${test.u_id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    {test.test_count}
                  </Link>
                </td>
                <td>
    <Link 
      to={`/portal/user-view/${test.u_id}`} 
      className="btn btn-primary btn-sm"
    >
      View Profile
    </Link>
  </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PracticeTest;

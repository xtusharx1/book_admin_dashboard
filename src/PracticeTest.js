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
        const response = await axios.get('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/tests/all');
        const testsWithDetails = await Promise.all(
          response.data.map(async (test) => {
            try {
              const userResponse = await axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/users/getbyid/${test.u_id}`);
              const userName = userResponse.data.f_name;

              if (test.chapter_id.length > 0) {
                const firstChapterId = test.chapter_id[0];
                const firstChapterResponse = await axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/chapters/find/${firstChapterId}`);
                const bookResponse = await axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/books/getbook/${firstChapterResponse.data.b_id}`);
                const bookName = bookResponse.data.b_name;

                return {
                  ...test,
                  userName,
                  bookName,
                  testDate: new Date(test.created_at)
                };
              } else {
                return {
                  ...test,
                  userName,
                  bookName: 'No Chapters',
                  testDate: new Date(test.created_at)
                };
              }
            } catch (err) {
              console.error(`Error fetching user or book data for test ID ${test.test_id}:`, err.message);
              return {
                ...test,
                userName: 'Unknown',
                bookName: 'Unknown',
                testDate: new Date(test.created_at)
              };
            }
          })
        );

        // Group by user and find the latest test for each user, while also counting tests per user
        const latestTestMap = {};
        const testCountMap = {};

        testsWithDetails.forEach((test) => {
          const existingTest = latestTestMap[test.u_id];
          
          // Update latest test
          if (!existingTest || test.testDate > existingTest.testDate) {
            latestTestMap[test.u_id] = test;
          }

          // Increment the test count
          if (!testCountMap[test.u_id]) {
            testCountMap[test.u_id] = 1;
          } else {
            testCountMap[test.u_id] += 1;
          }
        });

        // Add test count to the latest test data
        const latestTestsArray = Object.values(latestTestMap).map(test => ({
          ...test,
          testCount: testCountMap[test.u_id] // Add test count
        }));

        // Sort the latestTestsArray by testDate (newest first)
        latestTestsArray.sort((a, b) => b.testDate - a.testDate);

        setTests(testsWithDetails);
        setLatestTests(latestTestsArray); // Set latest tests for display
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tests:', err.message);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="test-list-container">
      <h2 className="heading">"Practice" Details</h2>
      {latestTests.length === 0 ? (
        <p>No tests available.</p>
      ) : (
        <table className="test-table">
          <thead>
            <tr>
              <th style={{ backgroundColor: '#007bff', color: '#ffffff' }}>Serial No.</th>
              <th style={{ backgroundColor: '#007bff', color: '#ffffff' }}>Student Name</th>
              <th style={{ backgroundColor: '#007bff', color: '#ffffff' }}>Book Name</th>
              <th style={{ backgroundColor: '#007bff', color: '#ffffff' }}>Last Test Date</th>
              <th style={{ backgroundColor: '#007bff', color: '#ffffff' }}>Test Count</th>
            </tr>
          </thead>
          <tbody>
            {latestTests.map((test, index) => (
              <tr key={test.test_id} style={{ color: 'grey' }}>
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
                    {test.bookName}
                  </Link>
                </td>
                <td>
                  <Link
                    to={`/portal/Usertestdetails${test.u_id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    {test.testDate.toDateString()}
                  </Link>
                </td>
                <td>
                  <Link
                    to={`/portal/sertestdetails/${test.u_id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    {test.testCount}
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

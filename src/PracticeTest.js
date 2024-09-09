import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PracticeTest.css'; // Import custom styles

function PracticeTest() {
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('book');

  useEffect(() => {
    // Fetch test data from API when component mounts
    const fetchTests = async () => {
      try {
        const response = await axios.get('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/tests/all');
        const testsWithDetails = await Promise.all(
          response.data.map(async (test) => {
            try {
              const userResponse = await axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/users/getbyid/${test.u_id}`);
              const userName = userResponse.data.f_name;

              // Fetch chapter and book data
              if (test.chapter_id.length > 0) {
                const chapterDetails = await Promise.all(
                  test.chapter_id.map(async (chapterId) => {
                    try {
                      const chapterResponse = await axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/chapters/find/${chapterId}`);
                      return chapterResponse.data.title;
                    } catch (err) {
                      console.error(`Error fetching chapter data for chapter ${chapterId}:`, err.message);
                      return 'Unknown Chapter';
                    }
                  })
                );

                const firstChapterId = test.chapter_id[0];
                const firstChapterResponse = await axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/chapters/find/${firstChapterId}`);
                const bookResponse = await axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/books/getbook/${firstChapterResponse.data.b_id}`);
                const bookName = bookResponse.data.b_name;

                return {
                  ...test,
                  userName,
                  bookName,
                  chapterNames: chapterDetails.join(', '),
                  chapterCount: test.chapter_id.length
                };
              } else {
                return {
                  ...test,
                  userName,
                  bookName: 'No Chapters',
                  chapterNames: 'No Chapters',
                  chapterCount: 0
                };
              }
            } catch (err) {
              console.error(`Error fetching user data for u_id ${test.u_id}:`, err.message);
              return {
                ...test,
                userName: 'Unknown',
                bookName: 'Unknown',
                chapterNames: 'Unknown',
                chapterCount: 0
              };
            }
          })
        );

        testsWithDetails.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setTests(testsWithDetails);
        setFilteredTests(testsWithDetails); // Set filtered tests initially
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tests:', err.message);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  // Function to format time_taken
  const formatTimeTaken = (timeTaken) => {
    const { minutes = 0, seconds = 0 } = timeTaken; // Destructure with default values
    if (minutes > 0) {
      return `${minutes} min${minutes > 1 ? 's' : ''} ${seconds} sec`;
    }
    return `${seconds} sec`;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = tests.filter((test) => {
      if (searchBy === 'book') {
        return test.bookName.toLowerCase().includes(lowerCaseSearchTerm);
      } else if (searchBy === 'student') {
        return test.userName.toLowerCase().includes(lowerCaseSearchTerm);
      }
      return false;
    });
    setFilteredTests(filtered);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="test-list-container">
      <h2 className="heading">Test Details</h2>
      <form onSubmit={handleSearch} className="search-form">
        <i className="fas fa-search icon"></i>
        <input
          type="text"
          placeholder={`Search by ${searchBy === 'book' ? 'Book Name' : 'Student Name'}`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={searchBy} onChange={(e) => setSearchBy(e.target.value)}>
          <option value="book">Book Name</option>
          <option value="student">Student Name</option>
        </select>
        <button type="submit">
          <i className="fas fa-filter icon"></i>
          Search
        </button>
      </form>
      {filteredTests.length === 0 ? (
        <p>No tests available.</p>
      ) : (
        <table className="test-table">
          <thead>
          <tr>
              <th style={{ backgroundColor: '#007bff', color: '#ffffff' }}>Serial No.</th>
              <th style={{ backgroundColor: '#007bff', color: '#ffffff' }}>Student Name</th>
              <th style={{ backgroundColor: '#007bff', color: '#ffffff' }}>Book Name</th>
              <th style={{ backgroundColor: '#007bff', color: '#ffffff' }}>Chapters</th>
              <th style={{ backgroundColor: '#007bff', color: '#ffffff' }}>Number of Chapters</th>
              <th style={{ backgroundColor: '#007bff', color: '#ffffff' }}>Total Questions</th>
              <th style={{ backgroundColor: '#007bff', color: '#ffffff' }}>Correct Answers</th>
              <th style={{ backgroundColor: '#007bff', color: '#ffffff' }}>Wrong Answers</th>
              <th style={{ backgroundColor: '#007bff', color: '#ffffff' }}>Time Taken</th>
              <th style={{ backgroundColor: '#007bff', color: '#ffffff' }}>Result (%)</th>
              <th style={{ backgroundColor: '#007bff', color: '#ffffff' }}>Test Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredTests.map((test, index) => (
              <tr key={test.test_id} style={{ color: 'grey' }}> {/* Set text color to grey */}
                <td>{index + 1}</td> {/* Serial Number */}
                <td>{test.userName}</td>
                <td>{test.bookName}</td>
                <td className="chapter-cell">{test.chapterNames}</td>
                <td>{test.chapterCount}</td> {/* Display number of chapters */}
                <td>{test.total_questions}</td>
                <td>{test.correct_answers}</td>
                <td>{test.wrong_answers}</td>
                <td>{formatTimeTaken(test.time_taken)}</td> {/* Format time */}
                <td>{test.result}%</td>
                <td>{new Date(test.test_date).toDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PracticeTest;

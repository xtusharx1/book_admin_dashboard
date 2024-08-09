import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Userlist() {
  const [userList, setUserList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");

  // Fetch users from API
  useEffect(() => {
    getUsers();
  }, []);

  // Filter users when searchQuery, genderFilter, or userList changes
  useEffect(() => {
    filterUsers();
  }, [searchQuery, genderFilter, userList]);

  const getUsers = async () => {
    try {
      const response = await axios.get("http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/users/showusers");
      if (response.data && Array.isArray(response.data)) {
        const sortedUsers = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setUserList(sortedUsers);
        setFilteredList(sortedUsers);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching users:", error);
    }
  };

  const filterUsers = () => {
    let filtered = userList;

    if (genderFilter !== "All") {
      filtered = filtered.filter(user => user.gender === genderFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.f_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.c_school.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.c_entry.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredList(filtered);
  };

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleGenderChange = (event) => {
    setGenderFilter(event.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  // Inline CSS styles
  const searchButtonStyles = {
    backgroundColor: '#4e73df',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    cursor: 'pointer',
    borderRadius: '5px'
  };

  const clearButtonStyles = {
    backgroundColor: 'transparent',
    color: '#000',
    border: 'none',
    cursor: 'pointer',
    fontSize: '20px',
    marginLeft: '-40px'
  };

  const tableStyles = {
    width: '100%',
    borderCollapse: 'collapse',
    borderRadius: '10px',
    overflow: 'hidden',
    marginTop: '20px'
  };

  const thStyles = {
    backgroundColor: '#4e73df',
    color: 'white',
    padding: '10px',
    textAlign: 'left',
    fontWeight: 'bold',
    whiteSpace: 'nowrap'
  };

  const tdStyles = {
    padding: '8px',
    borderBottom: '1px solid #ddd',
    whiteSpace: 'nowrap',
    verticalAlign: 'middle'
  };

  const actionTdStyles = {
    ...tdStyles,
    display: 'flex',
    gap: '5px',
    justifyContent: 'center',
    width: '150px', // Adjust width as needed
  };

  const noDataStyles = {
    textAlign: 'center',
    padding: '20px',
    color: '#888',
    fontSize: '18px'
  };

  return (
    <>
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">Student List</h1>
      </div>
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Student Data</h6>
        </div>
        <div className="card-body">
          <div className="mb-3" style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Search Name, School, Class, or State"
              value={searchQuery}
              onChange={handleSearchInputChange}
              className="form-control"
              style={{ width: '70%' }}
            />
            {searchQuery && (
              <button onClick={clearSearch} style={clearButtonStyles}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
            <select
              value={genderFilter}
              onChange={handleGenderChange}
              className="form-control"
              style={{ width: '30%' }}
            >
              <option value="All">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <button style={searchButtonStyles}>
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </div>
          {isLoading ? (
            <img src="https://media.giphy.com/media/ZO9b1ntYVJmjZlsWlm/giphy.gif" alt="Loading" />
          ) : (
            <div className="table-responsive">
              <table style={tableStyles} id="dataTable" cellSpacing="0">
                <thead>
                  <tr>
                    <th style={thStyles}>S No</th>
                    <th style={thStyles}>ID</th>
                    <th style={thStyles}>Name</th>
                    <th style={thStyles}>Phone Number</th>
                    <th style={thStyles}>Gender</th>
                    <th style={thStyles}>Class Entry</th>
                    <th style={thStyles}>School Choice</th>
                    <th style={thStyles}>State</th>
                    <th style={thStyles}>City</th>
                    <th style={thStyles}>Date of Birth</th>
                    <th style={thStyles}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.length === 0 ? (
                    <tr>
                      <td colSpan="11" style={noDataStyles}>No users found</td>
                    </tr>
                  ) : (
                    filteredList.map((user, index) => (
                      <tr key={user.u_id}>
                        <td style={tdStyles}>{index + 1}</td>
                        <td style={tdStyles}>{user.u_id}</td>
                        <td style={tdStyles}>{user.f_name}</td>
                        <td style={tdStyles}>{user.phonenumber}</td>
                        <td style={tdStyles}>{user.gender}</td>
                        <td style={tdStyles}>{user.c_entry}</td>
                        <td style={tdStyles}>{user.c_school}</td>
                        <td style={tdStyles}>{user.state}</td>
                        <td style={tdStyles}>{user.city}</td>
                        <td style={tdStyles}>{new Date(user.dob).toLocaleDateString()}</td>
                        <td style={actionTdStyles}>
                          <Link to={`/portal/user-view/${user.u_id}`} className="btn btn-primary btn-sm">View</Link>
                          <Link to={`/portal/user-edit/${user.u_id}`} className="btn btn-info btn-sm">Edit</Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Userlist;

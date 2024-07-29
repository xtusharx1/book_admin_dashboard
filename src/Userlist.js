import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import debounce from 'lodash.debounce';

function Userlist() {
  const [userList, setUserList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getUsers();
    console.log("Welcome to Userlist");
  }, []);

  const getUsers = async () => {
    try {
      const response = await axios.get("http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/users/showusers");
      console.log("Fetched users response:", response);
      if (response.data && Array.isArray(response.data)) {
        setUserList(response.data);
        setFilteredList(response.data);
        console.log("Users set in state:", response.data);
      } else {
        console.error("Unexpected response format:", response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query) => {
      const filtered = userList.filter(user =>
        user.f_name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredList(filtered);
    }, 300), [userList]
  );

  const handleSearchInputChange = (event) => {
    const value = event.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilteredList(userList);
  };

  // Inline CSS styles
  const tableStyles = {
    width: '100%',
    borderCollapse: 'collapse',
  };

  const thTdStyles = {
    border: '1px solid #ddd',
    padding: '8px',
    textAlign: 'left',
  };

  const thStyles = {
    ...thTdStyles,
    backgroundColor: '#007bff',
    color: 'white',
    position: 'sticky',
    top: 0,
  };

  const tdStyles = {
    ...thTdStyles,
  };

  const noDataStyles = {
    textAlign: 'center',
    padding: '10px',
    fontStyle: 'italic',
  };

  const searchContainerStyles = {
    position: 'relative',
    maxWidth: '300px',
  };

  const searchInputStyles = {
    width: '100%',
    padding: '10px 40px 10px 10px',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    fontSize: '16px',
  };

  const searchButtonStyles = {
    position: 'absolute',
    top: '50%',
    right: '10px',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  };

  const clearButtonStyles = {
    position: 'absolute',
    top: '50%',
    right: '40px',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
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
          <div className="mb-3" style={searchContainerStyles}>
            <input
              type="text"
              placeholder="Search Name"
              value={searchQuery}
              onChange={handleSearchInputChange}
              className="form-control"
              style={searchInputStyles}
            />
            {searchQuery && (
              <button onClick={clearSearch} style={clearButtonStyles}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
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
                      <td colSpan="10" style={noDataStyles}>No users found</td>
                    </tr>
                  ) : (
                    filteredList.map((user) => (
                      <tr key={user.u_id}>
                        <td style={tdStyles}>{user.u_id}</td>
                        <td style={tdStyles}>{user.f_name}</td>
                        <td style={tdStyles}>{user.phonenumber}</td>
                        <td style={tdStyles}>{user.gender}</td>
                        <td style={tdStyles}>{user.c_entry}</td>
                        <td style={tdStyles}>{user.c_school}</td>
                        <td style={tdStyles}>{user.state}</td>
                        <td style={tdStyles}>{user.city}</td>
                        <td style={tdStyles}>{new Date(user.dob).toLocaleDateString()}</td>
                        <td style={tdStyles}>
                          <Link to={`/portal/user-view/${user.u_id}`} className="btn btn-primary btn-sm mr-1">View</Link>
                          <Link to={`/portal/user-edit/${user.u_id}`} className="btn btn-info btn-sm mr-1">Edit</Link>
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

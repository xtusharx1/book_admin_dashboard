import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Userlist.css'; // Import your CSS file

function Userlist() {
  const [userList, setUserList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 50;

  useEffect(() => {
    getUsers();
  }, []);

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

  const convertToIST = (utcDate) => {
    const date = new Date(utcDate);

    if (isNaN(date.getTime())) {
      console.error('Invalid date format:', utcDate);
      return 'Invalid date';
    }

    return date.toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' });
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

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredList.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(filteredList.length / usersPerPage);

  return (
    <div className="userlist-container">
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Student Data</h6>
        </div>
        <div className="card-body">
          <div className="search-filter-container">
            <input
              type="text"
              placeholder="Search Name, School, Class, or State"
              value={searchQuery}
              onChange={handleSearchInputChange}
              className="form-control search-input"
            />
            {searchQuery && (
              <button onClick={clearSearch} className="clear-button">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
            <select
              value={genderFilter}
              onChange={handleGenderChange}
              className="form-control select-filter"
            >
              <option value="All">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <button className="search-button">
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </div>
          {isLoading ? (
            <img src="https://media.giphy.com/media/ZO9b1ntYVJmjZlsWlm/giphy.gif" alt="Loading" />
          ) : (
            <div className="table-responsive">
              <table className="table" id="dataTable" cellSpacing="0">
                <thead>
                  <tr>
                    <th>S No</th>
                    <th>Name</th>
                    <th>Phone Number</th>
                    <th>Gender</th>
                    <th>Class Entry</th>
                    <th>School Choice</th>
                    <th>State</th>
                    <th>Date of Birth</th>
                    <th>Registration Time</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="no-data">No users found</td>
                    </tr>
                  ) : (
                    currentUsers.map((user, index) => (
                      <tr key={user.u_id}>
                        <td>{index + 1 + indexOfFirstUser}</td>
                        <td>{user.f_name}</td>
                        <td>{user.phonenumber}</td>
                        <td>{user.gender}</td>
                        <td>{user.c_entry}</td>
                        <td>{user.c_school}</td>
                        <td>{user.state}</td>
                        <td>{new Date(user.dob).toLocaleDateString()}</td>
                        <td>{convertToIST(user.created_at)}</td>
                        <td className="action-buttons">
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
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
                onClick={() => paginate(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Userlist;

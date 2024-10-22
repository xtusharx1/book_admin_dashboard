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
  const [phoneSearch, setPhoneSearch] = useState(""); // New state for phone number search
  const [genderFilter, setGenderFilter] = useState("All");
  const [stateSearch, setStateSearch] = useState(""); // State search input
  const [schoolSearch, setSchoolSearch] = useState(""); // School Choice search input
  const [classFilter, setClassFilter] = useState("All"); // Class filter
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 50;

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, phoneSearch, genderFilter, stateSearch, schoolSearch, classFilter, userList]);

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
    return date.toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' });
  };

  const filterUsers = () => {
    let filtered = userList;

    // Apply gender filter
    if (genderFilter !== "All") {
      filtered = filtered.filter(user => user.gender === genderFilter);
    }

    // Apply state search filter
    if (stateSearch) {
      filtered = filtered.filter(user => user.state.toLowerCase().includes(stateSearch.toLowerCase()));
    }

    // Apply school search based on "School Choice"
    if (schoolSearch) {
      filtered = filtered.filter(user => user.c_school.toLowerCase().includes(schoolSearch.toLowerCase()));
    }

    // Apply class filter
    if (classFilter !== "All") {
      filtered = filtered.filter(user => user.c_entry.includes(classFilter)); // Match "6" or "9" for class entry
    }

    // Apply search query filter (by Name)
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.f_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply phone number search filter
    if (phoneSearch) {
      filtered = filtered.filter(user =>
        user.phonenumber.includes(phoneSearch)
      );
    }

    setFilteredList(filtered);
  };

  // Handlers for search inputs and filters
  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handlePhoneSearchChange = (event) => {
    setPhoneSearch(event.target.value);
  };

  const handleGenderChange = (event) => {
    setGenderFilter(event.target.value);
  };

  const handleClassChange = (event) => {
    setClassFilter(event.target.value);
  };

  const handleStateSearchChange = (event) => {
    setStateSearch(event.target.value);
  };

  const handleSchoolSearchChange = (event) => {
    setSchoolSearch(event.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const clearPhoneSearch = () => {
    setPhoneSearch("");
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const generatePageNumbers = (totalPages, currentPage) => {
    const pageNumbers = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show first 3 pages
      pageNumbers.push(1, 2, 3);

      if (currentPage > 5) {
        pageNumbers.push('...');
      }

      const startPage = Math.max(4, currentPage - 1);
      const endPage = Math.min(totalPages - 3, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (currentPage < totalPages - 4) {
        pageNumbers.push('...');
      }

      // Show last 3 pages
      pageNumbers.push(totalPages - 2, totalPages - 1, totalPages);
    }

    return pageNumbers;
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
              placeholder="Search Name"
              value={searchQuery}
              onChange={handleSearchInputChange}
              className="form-control search-input"
            />
            {searchQuery && (
              <button onClick={clearSearch} className="clear-button">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}

            {/* Phone Number Search */}
            <input
              type="text"
              placeholder="Search Phone Number"
              value={phoneSearch}
              onChange={handlePhoneSearchChange}
              className="form-control search-input"
            />
            {phoneSearch && (
              <button onClick={clearPhoneSearch} className="clear-button">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}

            {/* State Search */}
            <input
              type="text"
              placeholder="Search State"
              value={stateSearch}
              onChange={handleStateSearchChange}
              className="form-control search-input"
            />

            {/* School Choice Search */}
            <input
              type="text"
              placeholder="Search School Choice"
              value={schoolSearch}
              onChange={handleSchoolSearchChange}
              className="form-control search-input"
            />

            <select
              value={genderFilter}
              onChange={handleGenderChange}
              className="form-control select-filter"
            >
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>

            <select
              value={classFilter}
              onChange={handleClassChange}
              className="form-control select-filter"
            >
              <option value="All">All Classes</option>
              <option value="6">Class 6</option>
              <option value="9">Class 9</option>
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
            {generatePageNumbers(totalPages, currentPage).map((page, index) => (
              <button
                key={index}
                className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                onClick={() => {
                  if (page !== '...') paginate(page);
                }}
                disabled={page === '...'}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Userlist;

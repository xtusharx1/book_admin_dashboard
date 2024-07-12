import { faUser } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Userlist() {
  const [userList, setUserList] = useState([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    // On Load
    getUsers();
    console.log("Welcome to Userlist");
  }, []);

  const getUsers = async () => {
    try {
      const response = await axios.get("http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/users/showusers");
      console.log("Fetched users response:", response); // Logging the full response
      if (response.data && Array.isArray(response.data)) {
        setUserList(response.data);
        console.log("Users set in state:", response.data); // Logging the data set in state
      } else {
        console.error("Unexpected response format:", response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete the data?");
    if (confirmDelete) {
      try {
        await axios.delete(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/users/${id}`);
        getUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  return (
    <>
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">Student-List</h1>
        <Link to="/portal/create-user" className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
          <FontAwesomeIcon icon={faUser} className="creatinguser mr-2" />
          Create User
        </Link>
      </div>
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Student Data</h6>
        </div>
        <div className="card-body">
          {isLoading ? (
            <img src="https://media.giphy.com/media/ZO9b1ntYVJmjZlsWlm/giphy.gif" alt="Loading" />
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
                <thead>
                  <tr>
                    <th>Id</th>
                    <th>Name</th>
                    <th>E-Mail</th>
                    <th>Phone Number</th>
                    <th>Gender</th>
                    <th>Date of Birth</th>
                    <th>City</th>
                    <th>State</th>
                    <th>Class Entry</th>
                    <th>School Choice</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {userList.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="text-center">No users found</td>
                    </tr>
                  ) : (
                    userList.map((user) => (
                      <tr key={user.u_id}>
                        <td>{user.u_id}</td>
                        <td>{user.f_name}</td>
                        <td>{user.email}</td>
                        <td>{user.phonenumber}</td>
                        <td>{user.gender}</td>
                        <td>{new Date(user.dob).toLocaleDateString()}</td>
                        <td>{user.city}</td>
                        <td>{user.state}</td>
                        <td>{user.c_entry}</td>
                        <td>{user.c_school}</td>
                        <td>
                          <Link to={`/portal/user-view/${user.u_id}`} className="btn btn-primary btn-sm mr-1">View</Link>
                          <Link to={`/portal/user-edit/${user.u_id}`} className="btn btn-info btn-sm mr-1">Edit</Link>
                          <button onClick={() => handleDelete(user.u_id)} className="btn btn-danger btn-sm mr-1">Delete</button>
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

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faUser } from '@fortawesome/free-solid-svg-icons';

function CallbackRequest() {
    const [callbacks, setCallbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modeFilter, setModeFilter] = useState('all');

    const API_BASE_URL = "http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api";

    useEffect(() => {
        fetchCallbacks();
    }, []);

    const fetchCallbacks = async () => {
        setLoading(true);
        try {
            // Fetch callback requests from the API
            const response = await axios.get(`${API_BASE_URL}/student-callback`);
            const callbackData = response.data;
            
            // For each callback, fetch the user data
            const enhancedCallbacks = await Promise.all(
                callbackData.map(async (callback) => {
                    try {
                        const userResponse = await axios.get(`${API_BASE_URL}/users/getbyid/${callback.s_id}`);
                        const userData = userResponse.data;
                        
                        // Combine callback and user data
                        return {
                            ...callback,
                            name: userData.f_name,
                            phone: userData.phonenumber,
                            email: userData.email
                        };
                    } catch (error) {
                        console.error(`Error fetching user data for ID ${callback.s_id}:`, error);
                        return {
                            ...callback,
                            name: 'Unknown User',
                            phone: 'N/A',
                            email: 'N/A'
                        };
                    }
                })
            );
            
            setCallbacks(enhancedCallbacks);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching callback requests:', error);
            setCallbacks([]);  // Set empty array on error
            setLoading(false);
        }
    };

    const filteredCallbacks = modeFilter === 'all' 
        ? callbacks 
        : callbacks.filter(callback => callback.preferred_mode === modeFilter);

    const handleFilterChange = (e) => {
        setModeFilter(e.target.value);
    };

    return (
        <div className="container-fluid">
            <h1 className="h3 mb-2 text-gray-800">Callback Requests</h1>
            <p className="mb-4">Manage student callback requests and inquiries.</p>

            {/* DataTable */}
            <div className="card shadow mb-4">
                <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                    <h6 className="m-0 font-weight-bold text-primary">Callback Request List</h6>
                    <div className="form-inline">
                        <label htmlFor="modeFilter" className="mr-2">Filter by Mode:</label>
                        <select 
                            className="form-control form-control-sm text-dark" 
                            id="modeFilter" 
                            value={modeFilter} 
                            onChange={handleFilterChange}
                            style={{ 
                                color: '#000', 
                                fontWeight: 'normal', 
                                opacity: 1,
                                height: 'calc(1.8125rem + 6px)', // Increase height slightly
                                paddingTop: '0.25rem',
                                paddingBottom: '0.25rem',
                                lineHeight: '1.5'
                            }}
                        >
                            <option value="all">All Modes</option>
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                        </select>
                    </div>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div className="text-center">
                            <div className="spinner-border text-primary" role="status">
                                <span className="sr-only">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
                                <thead>
                                    <tr>
                                        <th width="5%">S.No</th>
                                        <th>Name</th>
                                        <th>Phone</th>
                                        <th>Email</th>
                                        <th>Request Date</th>
                                        <th>Preferred Mode</th>
                                        <th>Start Date</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCallbacks.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="text-center">No callback requests found</td>
                                        </tr>
                                    ) : (
                                        filteredCallbacks.map((callback, index) => (
                                            <tr key={callback.id}>
                                                <td>{index + 1}</td>
                                                <td>{callback.name}</td>
                                                <td>{callback.phone}</td>
                                                <td>{callback.email}</td>
                                                <td>{new Date(callback.created_at).toLocaleString()}</td>
                                                <td>{callback.preferred_mode}</td>
                                                <td>{callback.start_date}</td>
                                                <td>
                                                    <Link
                                                        to={`/portal/user-view/${callback.s_id}`}
                                                        className="btn btn-primary btn-sm"
                                                        title="View student profile"
                                                    >
                                                        <FontAwesomeIcon icon={faUser} className="mr-1" /> View Profile
                                                    </Link>
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
        </div>
    );
}

export default CallbackRequest;

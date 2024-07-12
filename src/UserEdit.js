import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function UserEdit() {
    const params = useParams();
    const [isLoading, setLoading] = useState(false);
    const [userData, setUserData] = useState({
        u_id: '',
        f_name: '',
        email: '',
        phonenumber: '',
        gender: '',
        dob: '',
        state: '',
        city: '',
        c_entry: '',
        c_school: ''
    });

    useEffect(() => {
        getUserData();
    }, []);

    const getUserData = async () => {
        try {
            const response = await axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/users/getbyid/${params.id}`);
            if (response.data) {
                setUserData(response.data); // Assuming response.data directly contains user details
            } else {
                console.error('User not found');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData({ ...userData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await axios.put('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/users/updateuser', userData);
            setLoading(false);
            // Redirect to user list or success page after update
            window.location.href = '/portal/user-list';
        } catch (error) {
            console.error('Error updating user:', error);
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h2>Edit User</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>User ID</label>
                    <input
                        type="text"
                        className="form-control"
                        name="u_id"
                        value={userData.u_id}
                        disabled
                    />
                </div>
                <div className="form-group">
                    <label>Full Name</label>
                    <input
                        type="text"
                        className="form-control"
                        name="f_name"
                        value={userData.f_name}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={userData.email}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label>Gender</label>
                    <input
                        type="text"
                        className="form-control"
                        name="gender"
                        value={userData.gender}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label>Date of Birth</label>
                    <input
                        type="date"
                        className="form-control"
                        name="dob"
                        value={userData.dob ? userData.dob.split('T')[0] : ''}
                        onChange={handleInputChange}
                    />
                </div>
                
                <div className='row'>
                    <div className='col-sm-6'>
                    <div className="form-group">
                    <label>State</label>
                    <input
                        type="text"
                        className="form-control"
                        name="state"
                        value={userData.state}
                        onChange={handleInputChange}
                    />
                </div>
                    </div>
                    <div className='col-sm-6'><div className="form-group">
                    <label>City</label>
                    <input
                        type="text"
                        className="form-control"
                        name="city"
                        value={userData.city}
                        onChange={handleInputChange}
                    />
                </div></div>
                </div>
             
                <div className="form-group">
                    <label>Class Entry</label>
                    <input
                        type="text"
                        className="form-control"
                        name="c_entry"
                        value={userData.c_entry}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label>School Choice</label>
                    <input
                        type="text"
                        className="form-control"
                        name="c_school"
                        value={userData.c_school}
                        onChange={handleInputChange}
                    />
                </div>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? 'Updating...' : 'Update'}
                </button>
            </form>
        </div>
    );
}

export default UserEdit;

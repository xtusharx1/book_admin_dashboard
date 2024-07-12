import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function UserView() {
    const params = useParams();
    const [user, setUser] = useState(null);
    const [payments, setPayments] = useState([]);
    const [isLoadingUser, setLoadingUser] = useState(true);
    const [isLoadingPayments, setLoadingPayments] = useState(true);

    useEffect(() => {
        // On Load
        getUser();
        getPayments();
        console.log("Welcome to UserView");
    }, []);

    const getUser = async () => {
        try {
            const response = await axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/users/getbyid/${params.id}`);
            console.log("Fetched user:", response.data); // Logging the fetched user data
            setUser(response.data);
            setLoadingUser(false);
        } catch (error) {
            console.error("Error fetching user:", error);
            setLoadingUser(false);
        }
    };

    const getPayments = async () => {
        try {
            const response = await axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/payments/user/${params.id}`);
            console.log("Fetched payments:", response.data); // Logging the fetched payments data
            setPayments(response.data);
            setLoadingPayments(false);
        } catch (error) {
            console.error("Error fetching payments:", error);
            setLoadingPayments(false);
        }
    };

    return (
        <>
            <div>UserView - {params.id}</div>
            {/* Render user details */}
            <div className="card shadow mb-4">
                <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">User Details</h6>
                </div>
                <div className="card-body">
                    {isLoadingUser ? (
                        <img src="https://media.giphy.com/media/ZO9b1ntYVJmjZlsWlm/giphy.gif" alt="Loading" />
                    ) : (
                        user ? (
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
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
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
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p>No user found</p>
                        )
                    )}
                </div>
            </div>

            {/* Render payments */}
            <div className="card shadow mb-4">
                <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">Payment Details</h6>
                </div>
                <div className="card-body">
                    {isLoadingPayments ? (
                        <img src="https://media.giphy.com/media/ZO9b1ntYVJmjZlsWlm/giphy.gif" alt="Loading" />
                    ) : (
                        payments.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
                                    <thead>
                                        <tr>
                                            <th>Payment ID</th>
                                            <th>User ID</th>
                                            <th>Book ID</th>
                                            <th>Has Paid</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map(payment => (
                                            <tr key={payment.id}>
                                                <td>{payment.id}</td>
                                                <td>{payment.u_id}</td>
                                                <td>{payment.b_id}</td>
                                                <td>{payment.haspaid ? 'Yes' : 'No'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p>No payments found for this user.</p>
                        )
                    )}
                </div>
            </div>
        </>
    );
}

export default UserView;

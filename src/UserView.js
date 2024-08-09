import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './userview.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function UserView() {
    const params = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [payments, setPayments] = useState([]);
    const [cart, setCart] = useState([]);
    const [totalSpend, setTotalSpend] = useState(0);
    const [appDownloads, setAppDownloads] = useState([]);
    const [isLoadingUser, setLoadingUser] = useState(true);
    const [isLoadingPayments, setLoadingPayments] = useState(true);
    const [isLoadingCart, setLoadingCart] = useState(true);
    const [isLoadingApps, setLoadingApps] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([getUser(), getPayments(), getAppDownloads()]);
        };
        fetchData();
    }, []);

    const getUser = async () => {
        try {
            const response = await axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/users/getbyid/${params.id}`);
            setUser(response.data);
        } catch (error) {
            //console.error("Error fetching user:", error);
        } finally {
            setLoadingUser(false);
        }
    };

    const getPayments = async () => {
        try {
            const response = await axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/payments/user/${params.id}`);
            const allPayments = response.data;

            const orders = [];
            const cartItems = [];
            const bookDetailsPromises = [];

            allPayments.forEach(payment => {
                bookDetailsPromises.push(
                    axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/books/getbook/${payment.b_id}`)
                        .then(bookResponse => ({
                            ...payment,
                            bookName: bookResponse.data.b_name,
                            sellPrice: parseFloat(bookResponse.data.sell_price)
                        }))
                );
            });

            const paymentsWithDetails = await Promise.all(bookDetailsPromises);

            paymentsWithDetails.forEach(payment => {
                if (payment.haspaid) {
                    orders.push(payment);
                } else {
                    cartItems.push(payment);
                }
            });

            const total = orders.reduce((sum, payment) => sum + payment.sellPrice, 0);
            setTotalSpend(total);
            setPayments(orders);
            setCart(cartItems);
        } catch (error) {
            //console.error("Error fetching payments:", error);
        } finally {
            setLoadingPayments(false);
            setLoadingCart(false);
        }
    };

    const getAppDownloads = async () => {
        try {
            const response = await axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/userapplogin/user/${params.id}`);
            const appLogins = response.data;

            const bookDetailsPromises = appLogins.map(login =>
                axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/books/getbook/${login.b_id}`)
                    .then(bookResponse => ({
                        ...login,
                        bookName: bookResponse.data.b_name,
                    }))
            );

            const appsWithDetails = await Promise.all(bookDetailsPromises);
            setAppDownloads(appsWithDetails);
        } catch (error) {
            //console.error("Error fetching app downloads:", error);
        } finally {
            setLoadingApps(false);
        }
    };

    const handleEditClick = () => {
        navigate(`/portal/user-edit/${params.id}`);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        return date.toLocaleString('en-GB', options).replace(',', '');
    };

    return (
        <div className="user-view-container">
            <div className="user-details">
                {isLoadingUser ? (
                    <img src="https://media.giphy.com/media/ZO9b1ntYVJmjZlsWlm/giphy.gif" alt="Loading" />
                ) : (
                    user && (
                        <div className="profile-details">
                            <div className="profile-header">
                                <div className="profile-initials">{user.f_name.charAt(0)}{user.l_name && user.l_name.charAt(0)}</div>
                                <h2>{user.f_name} {user.l_name}</h2>
                                <p>{user.school}</p>
                            </div>
                            <div className="profile-contact">
                                <p><i className="fa fa-envelope"></i> {user.email}</p>
                                <p><i className="fa fa-phone"></i> {user.phonenumber}</p>
                                <p><i className="fa fa-map-marker"></i> {user.city}, {user.state}</p>
                            </div>
                            <div className="profile-other">
                                <p>Gender: {user.gender}</p>
                                <p>DOB: {formatDate(user.dob)}</p>
                                <p>Student Class: {user.c_entry}</p>
                                <p>First Choice Sainik School: {user.c_school}</p>
                                <p>Registration Time:{user.created_at}</p>
                            </div>
                            <button className="edit-button" onClick={handleEditClick}>Edit</button>
                        </div>
                    )
                )}
            </div>
            
            <div className="user-orders-cart">
                <div className="user-orders">
                    <h3>Orders</h3>
                    {isLoadingPayments ? (
                        <img src="https://media.giphy.com/media/ZO9b1ntYVJmjZlsWlm/giphy.gif" alt="Loading" />
                    ) : (
                        payments.length > 0 ? (
                            <>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>S No</th>
                                            <th>Book Name</th>
                                            <th>Date</th>
                                            <th>Order Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map((payment, index) => (
                                            <tr key={payment.id}>
                                                <td>{index + 1}</td>
                                                <td>{payment.bookName}</td>
                                                <td>{formatDate(payment.updated_at)}</td>
                                                <td>₹{payment.sellPrice.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="total-spend">
                                    <p>Total Spend: ₹{totalSpend.toFixed(2)}</p>
                                </div>
                            </>
                        ) : (
                            <p>No orders placed yet</p>
                        )
                    )}
                </div>
                <div className="user-cart">
                    <h3>Cart</h3>
                    {isLoadingCart ? (
                        <img src="https://media.giphy.com/media/ZO9b1ntYVJmjZlsWlm/giphy.gif" alt="Loading" />
                    ) : (
                        cart.length > 0 ? (
                            <>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>S No</th>
                                            <th>Book Name</th>
                                            <th>Date</th>
                                            <th>Cart Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cart.map((payment, index) => (
                                            <tr key={payment.id}>
                                                <td>{index + 1}</td>
                                                <td>{payment.bookName}</td>
                                                <td>{formatDate(payment.created_at)}</td>
                                                <td>₹{payment.sellPrice.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="total-cart-value">
                                    <p>Total Cart Value: ₹{cart.reduce((sum, payment) => sum + payment.sellPrice, 0).toFixed(2)}</p>
                                </div>
                            </>
                        ) : (
                            <p>No items in cart</p>
                        )
                    )}
                </div>
            </div>
            
            <div className="user-app-downloads">
                <h3>App Downloads</h3>
                {isLoadingApps ? (
                    <img src="https://media.giphy.com/media/ZO9b1ntYVJmjZlsWlm/giphy.gif" alt="Loading" />
                ) : (
                    appDownloads.length > 0 ? (
                        <ul>
                            {appDownloads.map((app, index) => (
                                <li key={app.id}>
                                    <div className="app-info">
                                        <h4>{app.bookName}</h4>
                                        <p>Logged in at: {formatDate(app.createdAt)}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No app downloads found for this user.</p>
                    )
                )}
            </div>

            <div className="user-activity">
                <h3>Activity</h3>
                <div className="activity-list">
                    {/* Add activity items here */}
                </div>
                <button className="add-activity-button">+</button>
            </div>
        </div>
    );
}

export default UserView;

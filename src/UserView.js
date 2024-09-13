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
    const [activities, setActivities] = useState([]);
    const [followUps, setFollowUps] = useState({});

    const [isLoadingUser, setLoadingUser] = useState(true);
    const [isLoadingPayments, setLoadingPayments] = useState(true);
    const [isLoadingCart, setLoadingCart] = useState(true);
    const [isLoadingApps, setLoadingApps] = useState(true);
    const [isLoadingActivities, setLoadingActivities] = useState(true);
    const [isLoadingFollowUps, setLoadingFollowUps] = useState(true);

    const [leadStatus, setLeadStatus] = useState('Call Not Answered');
    const [leadLabel, setLeadLabel] = useState('SSQ24');
    const [followUpDate, setFollowUpDate] = useState('');
    const [notes, setNotes] = useState('');
    const [selectedActivity, setSelectedActivity] = useState('');
    const [editingFollowUp, setEditingFollowUp] = useState(null); // To store the follow-up being edited
const [editFollowUpDate, setEditFollowUpDate] = useState('');
const [editNotes, setEditNotes] = useState('');
const [editIsCompleted, setEditIsCompleted] = useState(false);
const [newActivityNotes, setNewActivityNotes] = useState(''); // Define state for new activity notes



    useEffect(() => {
        const fetchData = async () => {
            try {
                await Promise.all([getUser(), getPayments(), getAppDownloads(), getActivities()]);
                // Ensure activities are fetched and set before calling getFollowUps
                if (activities.length > 0) {
                    getFollowUps();
                } else {
                    console.log('No activities found. Skipping follow-ups fetch.');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [params.id, activities]); // Added activities to dependencies
    

    const getUser = async () => {
        try {
            const response = await axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/users/getbyid/${params.id}`);
            setUser(response.data);
        } catch (error) {
            console.error("Error fetching user:", error);
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
            const bookDetailsPromises = allPayments.map(payment =>
                axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/books/getbook/${payment.b_id}`)
                    .then(bookResponse => ({
                        ...payment,
                        bookName: bookResponse.data.b_name,
                        sellPrice: parseFloat(bookResponse.data.sell_price)
                    }))
            );

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
            console.error("Error fetching payments:", error);
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
            console.error("Error fetching app downloads:", error);
        } finally {
            setLoadingApps(false);
        }
    };

    const getActivities = async () => {
        try {
            const response = await axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/activities/user/${params.id}`);
            setActivities(response.data);
        } catch (error) {
            console.error("Error fetching activities:", error);
        } finally {
            setLoadingActivities(false);
        }
    };
    
    const getFollowUps = async () => {
        if (!activities || activities.length === 0) {
            console.warn("No activities found. Skipping follow-ups fetch.");
            setLoadingFollowUps(false);
            return;
        }
    
        try {
            const responses = await Promise.all(
                activities.map(activity => 
                    activity.activity_id ? axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/followups/activity/${activity.activity_id}`) 
                    : Promise.resolve({ data: [] })
                )
            );
    
            const groupedFollowUps = {};
            activities.forEach((activity, index) => {
                groupedFollowUps[activity.activity_id] = responses[index]?.data || [];
            });
    
            setFollowUps(groupedFollowUps);
        } catch (error) {
            console.error("Error fetching follow-ups:", error);
        } finally {
            setLoadingFollowUps(false);
        }
    };

    const handleEditClick = () => {
        navigate(`/portal/user-edit/${params.id}`);
    };

    const handleAddActivity = async () => {
        const newActivity = {
            u_id: params.id,
            activity_name: leadStatus,
            description: leadLabel,
            activity_date: new Date(),
            notes: newActivityNotes, // Add notes to the new activity
        };
        try {
            const response = await axios.post(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/activities/add`, newActivity);
            setActivities(prevActivities => [...prevActivities, response.data]);
            setLeadStatus('Call Not Answered'); // Reset form fields
            setLeadLabel('SSQ24');
            setNewActivityNotes(''); // Clear the notes field
        } catch (error) {
            console.error("Error adding activity:", error);
        }
    };
    const handleEditFollowUp = (followUp) => {
        setEditingFollowUp(followUp);
        setEditFollowUpDate(followUp.followup_date.split('T')[0]); // Format to YYYY-MM-DD
        setEditNotes(followUp.notes);
        setEditIsCompleted(followUp.isCompleted); // Initialize slider state
    };
    
    
    const handleUpdateFollowUp = async () => {
        if (!editingFollowUp) return;
    
        const updatedFollowUp = {
            ...editingFollowUp,
            followup_date: editFollowUpDate,
            notes: editNotes,
            isCompleted: editIsCompleted, // Include completed status
        };
    
        try {
            const response = await axios.put(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/followups/update/${editingFollowUp.followup_id}`, updatedFollowUp);
            
            // Update the state with the updated follow-up
            setFollowUps(prevFollowUps => ({
                ...prevFollowUps,
                [editingFollowUp.activity_id]: prevFollowUps[editingFollowUp.activity_id].map(fu =>
                    fu.followup_id === editingFollowUp.followup_id ? response.data : fu
                )
            }));
            
            // Clear editing state
            setEditingFollowUp(null);
            setEditFollowUpDate('');
            setEditNotes('');
            setEditIsCompleted(false); // Reset slider state
        } catch (error) {
            console.error("Error updating follow-up:", error);
        }
    };
    
        
    const handleAddFollowUp = async () => {
        const newFollowUp = {
            followup_date: followUpDate || new Date(),
            notes: notes,
        };
        try {
            // Replace with the correct endpoint
            const response = await axios.post(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/followups/activity/${selectedActivity}/add`, newFollowUp);
            setFollowUps(prevFollowUps => ({
                ...prevFollowUps,
                [selectedActivity]: [...(prevFollowUps[selectedActivity] || []), response.data]
            }));
            setFollowUpDate('');  // Clear input fields after saving
            setNotes('');
        } catch (error) {
            console.error("Error adding follow-up:", error);
        }
    };

    const formatDate = (dateString, includeTime = true) => {
        const date = new Date(dateString);

        // Check if the date is invalid
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }

        const options = includeTime ? { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false 
        } : { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric'
        };

        return date.toLocaleString('en-GB', options).replace(',', '');
    };

    return (
        <div className="user-view-container">
            {/* User Details */}
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
                                <p>DOB: {formatDate(user.dob, false)}</p>
                                <p>Student Class: {user.c_entry}</p>
                                <p>First Choice Sainik School: {user.c_school}</p>
                                <p>Registration Time: {formatDate(user.created_at)}</p>
                            </div>
                            <button className="edit-button" onClick={handleEditClick}>Edit</button>
                        </div>
                    )
                )}
            </div>
            
            {/* Orders and Cart */}
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
                                            <th>Order Value (in ₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map((payment, index) => (
                                            <tr key={payment.payment_id}>
                                                <td>{index + 1}</td>
                                                <td>{payment.bookName}</td>
                                                <td>{formatDate(payment.updated_at)}</td>
                                                <td> ₹{payment.sellPrice}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <br />
                                <h4 className="total-spend">Total Spend: ₹ {totalSpend}</h4>
                            </>
                        ) : (
                            <p>No orders found for this user.</p>
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
                                            <th>Cart Value (in ₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cart.map((item, index) => (
                                            <tr key={item.cart_id}>
                                                <td>{index + 1}</td>
                                                <td>{item.bookName}</td>
                                                <td>{formatDate(item.created_at)}</td>
                                                <td>₹{item.sellPrice}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        ) : (
                            <p>No items in cart for this user.</p>
                        )
                    )}
                </div>
            </div>

                            {/* App Downloads */}
                    <div className="app-downloads">
                        <h3>App Downloads</h3>
                        {isLoadingApps ? (
                            <img src="https://media.giphy.com/media/ZO9b1ntYVJmjZlsWlm/giphy.gif" alt="Loading" />
                        ) : (
                            appDownloads.length > 0 ? (
                                <ul>
                                    {appDownloads.map((download) => (
                                        <li key={download.id}>
                                            <p>Book Name: {download.bookName}</p>
                                            <p>Date of Download: {formatDate(download.createdAt)}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No app downloads found for this user.</p>
                            )
                        )}
                    </div>
                    <div className="user-activity">
    {/* Lead Status Section */}
    <div className="lead-status-row">
        <h3 className="lead-status-header">Lead Status</h3>
        {isLoadingActivities ? (
            <div className="loading-container">
                <img src="https://media.giphy.com/media/ZO9b1ntYVJmjZlsWlm/giphy.gif" alt="Loading" />
            </div>
        ) : (
            activities.length > 0 ? (
                activities
                    .slice() // Create a copy of the array to avoid mutating the original array
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Sort activities by created_at date in descending order
                    .map((activity) => (
                        <div className="activity-card" key={activity.activity_id}>
                            <h4 className="activity-title">{activity.activity_name} ({activity.description})</h4>
                            <p className="activity-date">Activity Created at : {formatDate(activity.activity_date)}</p>
                            <div className="activity-notes"> 
                                <strong>Notes:</strong> {activity.notes || 'No notes available'} 
                            </div>
                            
                            {editingFollowUp && (
    <div className="edit-follow-up-form">
        <h4>Edit Follow-Up</h4>
        <div className="form-group">
            <label htmlFor="editFollowUpDate">Follow-Up Date</label>
            <input
                type="date"
                id="editFollowUpDate"
                value={editFollowUpDate}
                onChange={(e) => setEditFollowUpDate(e.target.value)}
            />
        </div>
        <div className="form-group">
            <label htmlFor="editNotes">Notes</label>
            <textarea
                id="editNotes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
            />
        </div>
        <div className="form-group">
            <label htmlFor="isCompleted">Completed</label>
            <input
                type="checkbox"
                id="isCompleted"
                checked={editIsCompleted}
                onChange={(e) => setEditIsCompleted(e.target.checked)}
            />
        </div>
        <button onClick={handleUpdateFollowUp}>Update Follow-Up</button>
        <button onClick={() => setEditingFollowUp(null)}>Cancel</button>
    </div>
)}

                            <table className="follow-up-table">
                                <thead>
                                    <tr>
                                        <th>Serial No.</th>
                                        <th>Follow-Up Task</th>
                                        <th>Follow-Up Date</th>
                                        <th>Status</th>
                                        <th>Completed</th>
                                        <th>Action  </th>
                                    </tr>
                                </thead>
                                <tbody>
    {followUps[activity.activity_id] && followUps[activity.activity_id].length > 0 ? (
        followUps[activity.activity_id]
            .slice()
            .sort((a, b) => {
                const today = new Date().setHours(0, 0, 0, 0);
                const dateA = new Date(a.followup_date).setHours(0, 0, 0, 0);
                const dateB = new Date(b.followup_date).setHours(0, 0, 0, 0);
                
                const statusA = dateA === today ? 'Today' :
                                dateA > today ? 'Upcoming' : 'Passed';
                const statusB = dateB === today ? 'Today' :
                                dateB > today ? 'Upcoming' : 'Passed';

                if (statusA === statusB) {
                    if (statusA === 'Passed') {
                        return dateB - dateA;
                    } else {
                        return dateA - dateB;
                    }
                } else {
                    if (statusA === 'Today') return -1;
                    if (statusB === 'Today') return 1;
                    if (statusA === 'Upcoming') return -1;
                    return 1;
                }
            })
            .map((followUp, index) => {
                const today = new Date().setHours(0, 0, 0, 0);
                const followUpDate = new Date(followUp.followup_date).setHours(0, 0, 0, 0);
                const status = followUpDate === today ? 'Today' :
                                followUpDate > today ? 'Upcoming' : 'Passed';
                const completedStatus = followUp.isCompleted ? 'Yes' : 'No';

                const statusColor = status === 'Today' ? 'green' : 
                                    status === 'Upcoming' ? 'blue' : 
                                    'red';
                const completedColor = completedStatus === 'Yes' ? 'green' : 'red';

                return (
                    <tr key={followUp.followup_id}>
                        <td>{index + 1}</td>
                        <td>{followUp.notes}</td>
                        <td>{formatDate(followUp.followup_date, false)}</td>
                        <td style={{ color: statusColor }}>{status}</td>
                        <td style={{ color: completedColor }}>{completedStatus}</td>
                        <td>
    <button className="edit-button" onClick={() => handleEditFollowUp(followUp)}>Edit</button>
</td>

                    </tr>
                );
            })
    ) : (
        <tr>
            <td colSpan="6" className="no-followups">No follow-ups found for this activity.</td>
        </tr>
    )}
</tbody>



                            </table>
                        </div>
                    ))
            ) : (
                <p className="no-activities">No activities found for this user.</p>
            )
        )}
    </div>

    {/* Add Activity and Add Follow-Up Forms */}
    <div className="forms-row">
        <div className="form-column">
            <div className="activity-add-form">
                <h4>Add New Activity</h4>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="leadStatus">Lead Status</label>
                        <select
                            id="leadStatus"
                            value={leadStatus}
                            onChange={(e) => setLeadStatus(e.target.value)}
                        >
                            <option value="Call-not-answered">Call Not Answered</option>
                            <option value="Call-answered">Call Answered</option>
                            <option value="Interested">Interested</option>
                            <option value="Online-demo-taken">Online Demo Taken</option>
                            <option value="Online-admission-done">Online Admission Done</option>
                            <option value="Gurgaon-campus-visited">Gurgaon Campus Visited</option>
                            <option value="Delhi-campus-visited">Delhi Campus Visited</option>
                            <option value="Online-admission-taken">Online Admission Taken</option>
                            <option value="Delhi-admission-taken">Delhi Admission Taken</option>
                            <option value="Gurgaon-admission-taken">Gurgaon Admission Taken</option>
                            <option value="Not-interested">Not Interested</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="leadLabel">Lead Label</label>
                        <select
                            id="leadLabel"
                            value={leadLabel}
                            onChange={(e) => setLeadLabel(e.target.value)}
                        >
                            <option>SSQ24</option>
                            <option>SSQ25</option>  
                        </select>
                    </div>
                    <div className="form-group"> 
                        <label htmlFor="activityNotes">Notes</label> 
                        <textarea
                            id="activityNotes"
                            value={newActivityNotes} 
                            onChange={(e) => setNewActivityNotes(e.target.value)} 
                            placeholder="Add notes for this activity" 
                        />
                    </div>
                </div>
                <button className="add-activity-button" onClick={handleAddActivity}>Add Activity</button>
            </div>
        </div>
        <div className="form-column">
            <div className="follow-up-add-form">
                <h4>Add Follow-Up</h4>
                <div className="form-group">
                    <label htmlFor="activitySelect">Select Activity</label>
                    <select
                        id="activitySelect"
                        value={selectedActivity}
                        onChange={(e) => setSelectedActivity(e.target.value)}
                    >
                        <option value="">Select an Activity</option>
                        {activities.map(activity => (
                            <option key={activity.activity_id} value={activity.activity_id}>
                                {activity.activity_name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="followUpDate">Follow-Up Date</label>
                    <input
                        type="date"
                        id="followUpDate"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="notes">Notes</label>
                    <textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>
                <button className="add-followup-button" onClick={handleAddFollowUp}>Add Follow-Up</button>
            </div>
        </div>
    </div>
</div>
  
            </div>
    );
}

export default UserView;

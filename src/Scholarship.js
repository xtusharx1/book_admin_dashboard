import React, { useState, useEffect } from "react";
import axios from "axios";

const Scholarship = () => {
  const [activeTab, setActiveTab] = useState("class6");
  const [data, setData] = useState([]);
  const [userNames, setUserNames] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // API URLs
  const urls = {
    class6: "http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/scholarship-results/scholarship-results/class/6",
    class9: "http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/scholarship-results/scholarship-results/class/9",
    getUser: (u_id) => `http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/users/getbyid/${u_id}`,
    viewProfile: (u_id) => `/portal/user-view/${u_id}`,
  };

  // Fetch data for active tab
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get(urls[activeTab]);
        const results = response.data;
        if (results.message?.includes("No results found")) {
          setData([]);
        } else {
          setData(results);
          // Fetch user names for all results
          const userPromises = results.map((item) =>
            axios.get(urls.getUser(item.u_id)).then((res) => ({
              u_id: item.u_id,
              name: res.data.f_name, // Extract `f_name` as name
            }))
          );
          const users = await Promise.all(userPromises);
          const userMap = users.reduce((acc, user) => {
            acc[user.u_id] = user.name;
            return acc;
          }, {});
          setUserNames(userMap);
        }
      } catch (err) {
        setError("No Data Found");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  // Render content
  const renderContent = () => {
    if (loading) {
      return <p>Loading...</p>;
    }
    if (error) {
      return <p style={{ color: "red" }}>{error}</p>;
    }
    if (data.length === 0) {
      return <p>No results found for {activeTab === "class6" ? "Class 6" : "Class 9"}.</p>;
    }

    return (
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Total Questions</th>
            <th style={styles.th}>Correct Answers</th>
            <th style={styles.th}>Time Taken (seconds)</th>
            <th style={styles.th}>Result (%)</th>
            <th style={styles.th}>View Profile</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.result_id}>
              <td style={styles.td}>
                {userNames[item.u_id] || "Fetching..."}
              </td>
              <td style={styles.td}>{item.total_questions}</td>
              <td style={styles.td}>{item.correct_answers}</td>
              <td style={styles.td}>{item.time_taken}</td>
              <td style={styles.td}>
                {((item.correct_answers / item.total_questions) * 100).toFixed(2)}%
              </td>
              <td style={styles.td}>
                <a
                  href={urls.viewProfile(item.u_id)}
                  style={styles.profileLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Profile
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={styles.title}>Scholarship Results</h1>
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab("class6")}
          style={{
            ...styles.tabButton,
            backgroundColor: activeTab === "class6" ? "#007BFF" : "#f2f2f2",
            color: activeTab === "class6" ? "#fff" : "#007BFF",
          }}
        >
          Class 6
        </button>
        <button
          onClick={() => setActiveTab("class9")}
          style={{
            ...styles.tabButton,
            backgroundColor: activeTab === "class9" ? "#007BFF" : "#f2f2f2",
            color: activeTab === "class9" ? "#fff" : "#007BFF",
          }}
        >
          Class 9
        </button>
      </div>
      {renderContent()}
    </div>
  );
};

// Styles
const styles = {
  title: { textAlign: "center", color: "#007BFF" },
  tabs: { display: "flex", justifyContent: "center", marginBottom: "20px" },
  tabButton: {
    padding: "10px 20px",
    border: "none",
    cursor: "pointer",
    margin: "0 5px",
    fontSize: "16px",
    borderRadius: "5px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  },
  th: {
    padding: "12px",
    border: "1px solid #ddd",
    textAlign: "left",
    fontSize: "16px",
    backgroundColor: "#f2f2f2",
  },
  td: {
    padding: "12px",
    border: "1px solid #ddd",
    fontSize: "14px",
  },
  profileLink: {
    color: "#007BFF",
    textDecoration: "none",
    fontWeight: "bold",
  },
};

export default Scholarship;

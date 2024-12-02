import React, { useState, useEffect } from "react";
import {
  Box,
  CircularProgress,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Input,
} from "@mui/material";
import axios from "axios";
import Papa from "papaparse"; // Importing PapaParse for CSV parsing
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook

const ScholarshipDetails = () => {
  const [tabValue, setTabValue] = useState(0); // To control the active tab
  const [class6Details, setClass6Details] = useState([]); // Store Class 6 test details
  const [class9Details, setClass9Details] = useState([]); // Store Class 9 test details
  const [class6QuestionsCount, setClass6QuestionsCount] = useState(0); // Store count of Class 6 questions
  const [class9QuestionsCount, setClass9QuestionsCount] = useState(0); // Store count of Class 9 questions
  const [loadingClass6, setLoadingClass6] = useState(false); // Control loading state for Class 6
  const [loadingClass9, setLoadingClass9] = useState(false); // Control loading state for Class 9
  const [error, setError] = useState(null); // Handle errors
  const [openDialog, setOpenDialog] = useState(false); // Control dialog open/close
  const [currentTest, setCurrentTest] = useState(null); // Store current test being edited
  const [updatedTestDetails, setUpdatedTestDetails] = useState({
    duration: "",
    class: "",
    number_of_questions: "",
  });
  const navigate = useNavigate();
  // CSV processing state
  const [csvFile, setCsvFile] = useState(null); // Store the selected CSV file
  const [csvQuestions, setCsvQuestions] = useState([]); // Store parsed questions from CSV

  // Fetch data for a specific class (Test Details)
  const fetchTestDetails = async (classId) => {
    try {
      setError(null);
      if (classId === 6) {
        setLoadingClass6(true);
      } else if (classId === 9) {
        setLoadingClass9(true);
      }

      const url = `http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/scholarship-details/test-details/class/${classId}`;
      const response = await axios.get(url);

      // Store the data in the appropriate state
      if (classId === 6) {
        setClass6Details(response.data);
      } else if (classId === 9) {
        setClass9Details(response.data);
      }
    } catch (e) {
      console.error("Error fetching data:", e);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      if (classId === 6) {
        setLoadingClass6(false);
      } else if (classId === 9) {
        setLoadingClass9(false);
      }
    }
  };

  // Fetch the number of questions for a specific class
  const fetchQuestionsCount = async (classId) => {
    try {
      const url = `http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/scholarship-questions/scholarship-questions/class/${classId}`;
      const response = await axios.get(url);
      
      // Store the number of questions in the appropriate state
      if (classId === 6) {
        setClass6QuestionsCount(response.data.length);
      } else if (classId === 9) {
        setClass9QuestionsCount(response.data.length);
      }
    } catch (e) {
      console.error("Error fetching questions:", e);
      setError("Failed to fetch questions. Please try again later.");
    }
  };

  // Pre-load Class 6 data when the component mounts
  useEffect(() => {
    fetchTestDetails(6); // Fetch Class 6 data on initial mount
    fetchQuestionsCount(6); // Fetch Class 6 question count on initial mount
  }, []);

  // Handle tab change to load data dynamically
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 0 && class6Details.length === 0 && !loadingClass6) {
      fetchTestDetails(6); // Fetch Class 6 data if not already loaded
      fetchQuestionsCount(6); // Fetch Class 6 question count if not already loaded
    } else if (newValue === 1 && class9Details.length === 0 && !loadingClass9) {
      fetchTestDetails(9); // Fetch Class 9 data if not already loaded
      fetchQuestionsCount(9); // Fetch Class 9 question count if not already loaded
    }
  };

  // Render the test details for each class
  const renderDetails = (details) => {
    if (details.length === 0) {
      return <Typography>No test details available.</Typography>;
    }

    return details.map((test) => (
      <Card key={test.test_id} style={{ marginBottom: "16px" }}>
        <CardContent>
          <Typography>Class: {test.class}</Typography>
          <Typography>Duration: {test.duration} minutes</Typography>
          <Typography>Number of Questions: {test.number_of_questions}</Typography>

          {/* Edit button */}
          <Button
            variant="outlined"
            color="primary"
            onClick={() => handleEdit(test)}
            style={{ marginTop: "10px" }}
          >
            Edit
          </Button>
        </CardContent>
      </Card>
    ));
  };

  // Handle Edit button click
  const handleEdit = (test) => {
    setCurrentTest(test);
    setUpdatedTestDetails({
      duration: test.duration,
      class: test.class,
      number_of_questions: test.number_of_questions,
    });
    setOpenDialog(true); // Open the dialog
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedTestDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  // Handle updating test details via the API
  const handleUpdate = async () => {
    if (currentTest) {
      try {
        const response = await axios.put(
          `http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/scholarship-details/test-details/${currentTest.test_id}`,
          updatedTestDetails
        );

        if (response.status === 200) {
          alert("Test updated successfully");
          setOpenDialog(false); // Close the dialog
          // Reload the test details for the current class
          if (tabValue === 0) fetchTestDetails(6);
          if (tabValue === 1) fetchTestDetails(9);
        }
      } catch (error) {
        console.error("Error updating test:", error);
        setError("Failed to update test details.");
      }
    }
  };
  const handleCsvUpload = async () => {
    if (!csvFile) {
      alert("Please select a CSV file.");
      return;
    }
  
    try {
      // Step 1: Determine the classId based on the selected tab
      const classId = tabValue === 0 ? 6 : 9;  // 0 -> Class 6, 1 -> Class 9
  
      // Step 2: Parse CSV using PapaParse with classId
      const questions = await processCSV(csvFile, classId);
      setCsvQuestions(questions); // Store the parsed questions
  
      // Log the processed CSV data to verify it's correctly formatted
      console.log("Processed CSV Data:", questions);
  
      alert("CSV processed successfully! Ready to import.");
  
      // Step 3: Send each question to the backend API one by one
      for (let question of questions) {
        console.log("Question to be sent to API:", question); // Log each question
  
        // Ensure the correct format before sending
        const formattedQuestion = {
          class: question.class,
          question_text: question.question_text,
          option1: question.option1,
          option2: question.option2,
          option3: question.option3,
          option4: question.option4,
          correct_option: question.correct_option,
        };
  
        const response = await axios.post(
          "http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/scholarship-questions/scholarship-questions",
          formattedQuestion
        );
  
        // Log the successful response from the server
        console.log("Server response:", response.data);
      }
  
      alert("Questions imported successfully!");
    } catch (error) {
      console.error("Error processing CSV:", error);
  
      if (error.response) {
        console.error("Server Error Response:", error.response.data);
        alert(`Server Error: ${error.response.data.message}`);
      } else if (error.request) {
        console.error("No response from server. Request data:", error.request);
        alert("No response from the server. Please check your internet connection.");
      } else {
        console.error("Error Details:", error.message);
        alert(`Error: ${error.message}`);
      }
    }
  };
  
  const processCSV = (file, classId) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        complete: (result) => {
          console.log("Raw Parsed CSV Result:", result);
  
          try {
            const formattedQuestions = result.data.map((row) => ({
              class: `${classId}`,  // Dynamically set class based on classId
              question_text: row['Question Text'],
              option1: row['Option 1'],
              option2: row['Option 2'],
              option3: row['Option 3'],
              option4: row['Option 4'],
              correct_option: row['Correct Option']
            }));
  
            console.log("Formatted Questions:", formattedQuestions);
  
            resolve(formattedQuestions);
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => {
          reject(error);
        },
        header: true, // Ensure headers are considered
      });
    });
  };
  


  

  return (
    <Box sx={{ width: "90%", margin: "auto", marginTop: "20px" }}>
      <Tabs value={tabValue} onChange={handleTabChange} centered>
        <Tab label="Class 6" />
        <Tab label="Class 9" />
      </Tabs>

      {/* Display loading spinner while fetching data */}
      {(loadingClass6 || loadingClass9) ? (
        <Box sx={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" style={{ textAlign: "center", marginTop: "20px" }}>
          {error}
        </Typography>
      ) : (
        <Box sx={{ marginTop: "20px" }}>
          {tabValue === 0 && (
            <>
              {renderDetails(class6Details)} {/* Render Class 6 */}
              <Typography variant="h6">Total Questions: {class6QuestionsCount}</Typography>
            </>
          )}
          {tabValue === 1 && (
            <>
              {renderDetails(class9Details)} {/* Render Class 9 */}
              <Typography variant="h6">Total Questions: {class9QuestionsCount}</Typography>
            </>
          )}
          <button
        onClick={() => navigate("/portal/ScholarshipQuestions")} // Navigate to the page to add question manually
        className="btn btn-primary" // You can style it using Bootstrap or your custom classes
      >
        View
      </button>
        </Box>
      )}

      {/* Dialog to edit test details */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Edit Test Details</DialogTitle>
        <DialogContent>
          <TextField
            label="Duration"
            name="duration"
            value={updatedTestDetails.duration}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            type="number"
          />
          <TextField
            label="Class"
            name="class"
            value={updatedTestDetails.class}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Number of Questions"
            name="number_of_questions"
            value={updatedTestDetails.number_of_questions}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            type="number"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleUpdate} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* CSV Upload Section */}
      <Box sx={{ marginTop: "20px" }}>
        <Input
          type="file"
          accept=".csv"
          onChange={(e) => setCsvFile(e.target.files[0])}
          sx={{ marginBottom: "10px" }}
        />
        <Button onClick={handleCsvUpload} variant="contained" color="primary">
          Import Questions from CSV
        </Button>
        <div style={{ textAlign: "center", marginTop: "20px" }}>
      <button
        onClick={() => navigate("/portal/addScholarshipQuestions")} // Navigate to the page to add question manually
        className="btn btn-primary" // You can style it using Bootstrap or your custom classes
      >
        Add Question Manually
      </button>
    </div>

      </Box>
    </Box>
  );
};

export default ScholarshipDetails;

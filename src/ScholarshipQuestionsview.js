import React, { useEffect, useState } from 'react';
import { Box, Tabs, Tab, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button } from '@mui/material';

const ScholarshipQuestions = () => {
  const [activeTab, setActiveTab] = useState(0); // 0 for Class 6, 1 for Class 9
  const [questions, setQuestions] = useState([]);

  const fetchQuestions = async (classNumber) => {
    try {
      const response = await fetch(
        `http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/scholarship-questions/scholarship-questions/class/${classNumber}`
      );
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  useEffect(() => {
    const classNumber = activeTab === 0 ? 6 : 9;
    fetchQuestions(classNumber);
  }, [activeTab]);

  const renderImage = (url) => {
    if (url && (url.startsWith('http') || url.startsWith('https'))) {
      return <img src={url} alt="question-image" style={{ width: '100px', height: 'auto' }} />;
    }
    return null;
  };

  const handleDelete = async (q_id) => {
    try {
      // Delete request to API
      const response = await fetch(
        `http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/scholarship-questions/scholarship-questions/${q_id}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        // Remove the question from the UI after successful deletion
        setQuestions(questions.filter(question => question.q_id !== q_id));
      } else {
        console.error('Error deleting question');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const renderQuestions = () => {
    if (questions.length === 0) {
      return <Typography>No Questions Available</Typography>;
    }
    return (
      <Table sx={{ width: "100%", marginTop: "20px" }}>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Question</TableCell>
            <TableCell>Option 1</TableCell>
            <TableCell>Option 2</TableCell>
            <TableCell>Option 3</TableCell>
            <TableCell>Option 4</TableCell>
            <TableCell>Correct Option</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {questions.map((question) => (
            <TableRow key={question.q_id}>
              <TableCell>{question.q_id}</TableCell>
              <TableCell>
                <div dangerouslySetInnerHTML={{ __html: question.question_text }} />
                {renderImage(question.question_text)} {/* Display image for question */}
              </TableCell>
              <TableCell>
                {question.option1}
                {renderImage(question.option1)} {/* Display image for option */}
              </TableCell>
              <TableCell>
                {question.option2}
                {renderImage(question.option2)} {/* Display image for option */}
              </TableCell>
              <TableCell>
                {question.option3}
                {renderImage(question.option3)} {/* Display image for option */}
              </TableCell>
              <TableCell>
                {question.option4}
                {renderImage(question.option4)} {/* Display image for option */}
              </TableCell>
              <TableCell>{question.correct_option}</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleDelete(question.q_id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <Box sx={{ marginTop: "20px", padding: "20px", maxWidth: "1200px", marginLeft: "auto", marginRight: "auto" }}>
      <Tabs
        value={activeTab}
        onChange={(event, newValue) => setActiveTab(newValue)}
        centered
        sx={{
          marginBottom: "20px",
          '& .MuiTabs-indicator': {
            backgroundColor: '#3f51b5', // Custom color for the active tab
          },
        }}
      >
        <Tab label="Class 6" />
        <Tab label="Class 9" />
      </Tabs>
      {renderQuestions()}
    </Box>
  );
};

export default ScholarshipQuestions;

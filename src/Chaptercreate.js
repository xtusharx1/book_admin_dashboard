import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Papa from 'papaparse'; // Add papaparse library for CSV parsing

function ChapterCreate() {
  const navigate = useNavigate();
  const { b_id } = useParams(); // Fetching b_id from URL params

  const [formData, setFormData] = useState({
    b_id: parseInt(b_id),
    c_no: 1,
    title: '',
    file: null,
    questionBank: null, // Added for CSV file
  });

  const [loading, setLoading] = useState(true);

  const fileInputRef = useRef(null); // Reference for the file input
  const questionBankRef = useRef(null); // Reference for the question bank file input

  // Function to fetch existing chapters and calculate next chapter number
  const fetchChaptersAndSetNextNumber = async () => {
    try {
      const response = await axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/chapters/findbybook/${b_id}`);
      const chapters = response.data; // Array of existing chapters for the book
      if (chapters.length > 0) {
        const maxChapterNumber = Math.max(...chapters.map(chapter => chapter.c_no));
        setFormData(prevState => ({
          ...prevState,
          c_no: maxChapterNumber + 1 // Incrementing to calculate next chapter number
        }));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching chapters:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChaptersAndSetNextNumber();
  }, []); // Fetch chapters on component mount

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'c_no') {
      // Ensure c_no input is valid integer
      const intValue = parseInt(value);
      setFormData({ ...formData, [name]: isNaN(intValue) ? 1 : intValue });
    } else if (name === 'file') {
      setFormData({ ...formData, file: files[0] });
    } else if (name === 'questionBank') {
      setFormData({ ...formData, questionBank: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const processCSV = (file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (parsedData) => {
          // Log the raw parsed data
          console.log('Parsed CSV Data:', parsedData);
  
          // Convert CSV rows into the required JSON format
          const formattedData = parsedData.data.map((row, index) => {
            // Log each row to verify its structure
            console.log(`Row ${index + 1}:`, row);
  
            return {
              chapter_id: formData.b_id,
              question_text: row['question_text'] || '',
              option1: row['option1'] || '',
              option2: row['option2'] || '',
              option3: row['option3'] || '',
              option4: row['option4'] || '',
              correct_option: row['correct_option'] || ''
            };
          });
  
          // Log the formatted data
          console.log('Formatted Data:', formattedData);
  
          resolve(formattedData);
        },
        error: (error) => {
          console.error('CSV Parsing Error:', error);
          reject(error);
        }
      });
    });
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Step 1: Create the Chapter by Uploading PDF
    const chapterData = new FormData();
    chapterData.append('b_id', formData.b_id);
    chapterData.append('c_no', formData.c_no);
    chapterData.append('title', formData.title);
    if (formData.file) {
      chapterData.append('file', formData.file);
    }
  
    try {
      // Create the chapter
      const chapterResponse = await axios.post(
        `http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/chapters/addchapter`,
        chapterData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
  
      // Extract the chapter ID from the response
      const createdChapter = chapterResponse.data;
      const chapterId = createdChapter.id; // Assuming 'id' is the field in the response that contains the chapter ID
      console.log('Created Chapter:', createdChapter);
  
      // Step 2: Process and Upload Questions Using the Chapter ID
      if (formData.questionBank) {
        try {
          const questions = await processCSV(formData.questionBank);
  
          // Send questions to the API
          await axios.post(
            `http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/questions/add`,
            { chapter_id: chapterId, questions },
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
          console.log('Question bank uploaded successfully');
        } catch (error) {
          console.error('Error processing or uploading CSV:', error);
        }
      }
  
      // Update the next chapter number and reset the form
      fetchChaptersAndSetNextNumber();
      resetForm();
    } catch (error) {
      console.error('Error creating chapter or uploading question bank:', error);
    }
  };
  
  const resetForm = () => {
    setFormData(prevState => ({
      ...prevState,
      title: '',
      file: null,
      questionBank: null,
      c_no: prevState.c_no + 1 // Increment to the next chapter number
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset the file input field
    }
    if (questionBankRef.current) {
      questionBankRef.current.value = ''; // Reset the question bank file input field
    }
  };

  const handleFinish = () => {
    navigate(`/portal/Book-view/${b_id}`);
  };

  if (loading) {
    return <div>Loading...</div>; // Optionally show a loading indicator while fetching data
  }

  return (
    <div className="container mt-4">
      <h2>Create New Chapter</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Chapter Number:</label>
          <input
            type="number"
            className="form-control"
            name="c_no"
            value={formData.c_no}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Title:</label>
          <input
            type="text"
            className="form-control"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Upload PDF:</label>
          <input
            type="file"
            className="form-control"
            name="file"
            accept="application/pdf"
            onChange={handleChange}
            ref={fileInputRef} // Set ref to the file input
            required
          />
        </div>
        <div className="form-group">
          <label>Upload Question Bank (CSV):</label>
          <input
            type="file"
            className="form-control"
            name="questionBank"
            accept=".csv"
            onChange={handleChange}
            ref={questionBankRef} // Set ref to the question bank file input
          />
        </div>
        <button type="submit" className="btn btn-primary mr-2">Create</button>
        <button type="button" className="btn btn-success" onClick={handleFinish}>Finish</button>
        <Link to={`/portal/Book-view/${b_id}`} className="btn btn-secondary ml-2">Cancel</Link>
      </form>
    </div>
  );
}

export default ChapterCreate;

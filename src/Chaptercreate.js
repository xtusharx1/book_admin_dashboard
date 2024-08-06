import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ChapterCreate() {
  const navigate = useNavigate();
  const { b_id } = useParams(); // Fetching b_id from URL params

  const [formData, setFormData] = useState({
    b_id: parseInt(b_id),
    c_no: 1,
    title: '',
    file: null,
  });

  const [loading, setLoading] = useState(true);

  const fileInputRef = useRef(null); // Reference for the file input

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
      //console.error('Error fetching chapters:', error);
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
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('b_id', formData.b_id);
    data.append('c_no', formData.c_no);
    data.append('title', formData.title);
    data.append('file', formData.file);

    // Log formData to ensure all fields are populated
    console.log('Submitting form data:', {
      b_id: formData.b_id,
      c_no: formData.c_no,
      title: formData.title,
      file: formData.file,
    });

    try {
      const response = await axios.post(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/chapters/addchapter`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const createdChapter = response.data;
      console.log('Created Chapter:', createdChapter);
      fetchChaptersAndSetNextNumber(); // Fetch chapters again to update next chapter number
      resetForm(); // Reset the form after successful submission
    } catch (error) {
      //console.error('Error creating chapter:', error);
    }
  };

  const resetForm = () => {
    setFormData(prevState => ({
      ...prevState,
      title: '',
      file: null,
      c_no: prevState.c_no + 1 // Increment to the next chapter number
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset the file input field
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
        <button type="submit" className="btn btn-primary mr-2">Create</button>
        <button type="button" className="btn btn-success" onClick={handleFinish}>Finish</button>
        <Link to={`/portal/Book-view/${b_id}`} className="btn btn-secondary ml-2">Cancel</Link>
      </form>
    </div>
  );
}

export default ChapterCreate;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function BookCreate() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    b_name: '',
    description: '',
    author: '',
    b_url: '',
    img_file: null,
    sell_price: '',
    max_price: ''
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'img_file') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });

    try {
      const response = await axios.post('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/books/addbook', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const createdBook = response.data;
      console.log('Created Book:', createdBook);
      navigate(`/portal/Chapter-create/${createdBook.b_id}`);
    } catch (error) {
      //console.error('Error creating book:', error);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Create New Book</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Book Name:</label>
          <input
            type="text"
            className="form-control"
            name="b_name"
            value={formData.b_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Description:</label>
          <input
            type="text"
            className="form-control"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Author:</label>
          <input
            type="text"
            className="form-control"
            name="author"
            value={formData.author}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Book URL:</label>
          <input
            type="url"
            className="form-control"
            name="b_url"
            value={formData.b_url}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Image:</label>
          <input
            type="file"
            className="form-control"
            name="img_file"
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Sell Price:</label>
          <input
            type="text"
            className="form-control"
            name="sell_price"
            value={formData.sell_price}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Max Price:</label>
          <input
            type="text"
            className="form-control"
            name="max_price"
            value={formData.max_price}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary mr-2">Create</button>
        <Link to="/portal/Library-list" className="btn btn-secondary">Cancel</Link>
      </form>
    </div>
  );
}

export default BookCreate;

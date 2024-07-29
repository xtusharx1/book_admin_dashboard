import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Apphome.css';

export default function Apphome() {
  const [events, setEvents] = useState([]);
  const [headlines, setHeadlines] = useState([]);
  const [images, setImages] = useState([]);
  const [form, setForm] = useState({ event_name: '', date_event: '' });
  const [headlineForm, setHeadlineForm] = useState({ title: '', t_placement: '' });
  const [imageForm, setImageForm] = useState({ t_placement: '', description: '', img_file: null });
  const [editMode, setEditMode] = useState(false);
  const [editHeadlineMode, setEditHeadlineMode] = useState(false);
  const [editImageMode, setEditImageMode] = useState(false);
  const [currentEventName, setCurrentEventName] = useState('');
  const [currentHeadlineTitle, setCurrentHeadlineTitle] = useState('');
  const [currentImageId, setCurrentImageId] = useState('');

  useEffect(() => {
    fetchEvents();
    fetchHeadlines();
    fetchImages();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/timelines/timeline');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchHeadlines = async () => {
    try {
      const response = await axios.get('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/headlines/headlines');
      setHeadlines(response.data);
    } catch (error) {
      console.error('Error fetching headlines:', error);
    }
  };

  const fetchImages = async () => {
    try {
      const response = await axios.get('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/images/imagesget');
      setImages(response.data);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleHeadlineInputChange = (e) => {
    setHeadlineForm({ ...headlineForm, [e.target.name]: e.target.value });
  };

  const handleImageInputChange = (e) => {
    if (e.target.name === 'img_file') {
      setImageForm({ ...imageForm, img_file: e.target.files[0] });
    } else {
      setImageForm({ ...imageForm, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editMode) {
      await updateEvent();
    } else {
      await createEvent();
    }
    fetchEvents();
    resetForm();
  };

  const handleHeadlineSubmit = async (e) => {
    e.preventDefault();
    if (editHeadlineMode) {
      await updateHeadline();
    } else {
      await createHeadline();
    }
    fetchHeadlines();
    resetHeadlineForm();
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('t_placement', imageForm.t_placement);
    formData.append('description', imageForm.description);
    if (imageForm.img_file) {
      formData.append('img_file', imageForm.img_file);
    }

    if (editImageMode) {
      await updateImage(formData);
    } else {
      await createImage(formData);
    }
    fetchImages();
    resetImageForm();
  };

  const createEvent = async () => {
    try {
      await axios.post('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/timelines/timeline', form);
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const updateEvent = async () => {
    try {
      await axios.put(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/timelines/timeline/${currentEventName}`, form);
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const deleteEvent = async (event_name) => {
    try {
      await axios.delete(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/timelines/timeline/${event_name}`);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };
  
  const editEvent = (event) => {
    setForm({
      event_name: event.event_name,
      date_event: event.date_event.substring(0, 10)
    });
    setEditMode(true);
    setCurrentEventName(event.event_name);
  };

  const createHeadline = async () => {
    try {
      await axios.post('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/headlines/headlines', headlineForm);
    } catch (error) {
      console.error('Error creating headline:', error);
    }
  };

  const updateHeadline = async () => {
    try {
      await axios.put(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/headlines/headlines/${currentHeadlineTitle}`, headlineForm);
    } catch (error) {
      console.error('Error updating headline:', error);
    }
  };

  const deleteHeadline = async (title) => {
    try {
      await axios.delete(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/headlines/headlines/${title}`);
      fetchHeadlines();
    } catch (error) {
      console.error('Error deleting headline:', error);
    }
  };

  const editHeadline = (headline) => {
    setHeadlineForm({
      title: headline.title,
      t_placement: headline.t_placement
    });
    setEditHeadlineMode(true);
    setCurrentHeadlineTitle(headline.title);
  };

  const createImage = async (formData) => {
    try {
      await axios.post('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/images/imagesadd', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (error) {
      console.error('Error creating image:', error);
    }
  };

  const updateImage = async (formData) => {
    try {
      await axios.put(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/images/imagesupdate/${currentImageId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (error) {
      console.error('Error updating image:', error);
    }
  };

  const deleteImage = async (id) => {
    try {
      await axios.delete(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/images/imagesdelete/${id}`);
      fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const editImage = (image) => {
    setImageForm({
      t_placement: image.t_placement,
      description: image.description,
      img_file: null // Reset img_file since it's not editable
    });
    setEditImageMode(true);
    setCurrentImageId(image.img_id);
  };

  const resetForm = () => {
    setForm({ event_name: '', date_event: '' });
    setEditMode(false);
    setCurrentEventName('');
  };

  const resetHeadlineForm = () => {
    setHeadlineForm({ title: '', t_placement: '' });
    setEditHeadlineMode(false);
    setCurrentHeadlineTitle('');
  };

  const resetImageForm = () => {
    setImageForm({ t_placement: '', description: '', img_file: null });
    setEditImageMode(false);
    setCurrentImageId('');
  };

  const formatDate = (date) => {
    const d = new Date(date);
    let day = d.getDate();
    let month = d.getMonth() + 1;
    const year = d.getFullYear();

    if (day < 10) {
      day = `0${day}`;
    }
    if (month < 10) {
      month = `0${month}`;
    }

    return `${day}/${month}/${year}`;
  };

  
  const renderImageTable = (placement) => (
    <table className="table">
      <thead>
        <tr>
          <th>Image</th>
          <th>Description</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {images
          .filter(image => image.t_placement === placement)
          .map((image) => (
            <tr key={image.img_id}>
              <td>
                <img
                  src={image.img_path}
                  alt={image.description}
                  onError={(e) => { e.target.src = 'placeholder_image_url' }} // Placeholder on error
                  style={{ maxWidth: '100px', maxHeight: '100px' }}
                />
              </td>
              <td>{image.description}</td>
              <td>
                <center>
                  <button onClick={() => editImage(image)} className="btn btn-secondary">Edit</button>
                  <button onClick={() => deleteImage(image.img_id)} className="btn btn-danger">Delete</button>
                </center>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );

  return (
    <div>
      <div className="container">
        <h2>Exam Timeline </h2>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="event_name">Event Name:</label>
            <input
              type="text"
              id="event_name"
              name="event_name"
              value={form.event_name}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>


          <div className="form-group">
            <label htmlFor="date_event">Date of Event:</label>
            <input
              type="text"
              id="date_event"
              name="date_event"
              value={form.date_event}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            {editMode ? 'Update Event' : 'Create Event'}
          </button>
        </form>
        <h2>Timeline</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Event Name</th>
            <th>Date of Event</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
            {events.map((event) => (
              <tr key={event.event_id}>
                <td>{event.event_name}</td>
                <td>{event.date_event}</td> {/* Display date_event as it is */}
                <td>
                  <center>
                    <button onClick={() => editEvent(event)} className="btn btn-secondary">Edit</button>
                    <button onClick={() => deleteEvent(event.event_name)} className="btn btn-danger">Delete</button>
                  </center>
                </td>
              </tr>
            ))}
          </tbody>

      </table>
        <h2>Headlines</h2>
        <form onSubmit={handleHeadlineSubmit} className="form">
          <div className="form-group">
            <label htmlFor="title">Headline Title:</label>
            <input
              type="text"
              id="title"
              name="title"
              value={headlineForm.title}
              onChange={handleHeadlineInputChange}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="t_placement">Placement:</label>
            <select
              id="t_placement"
              name="t_placement"
              value={headlineForm.t_placement}
              onChange={handleHeadlineInputChange}
              className="form-control"
              required
            >
              <option value="">Select Placement</option>
              <option value="title">Table Title</option>
              <option value="ad">Ad</option>
              <option value="carousel">Carousel</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">
            {editHeadlineMode ? 'Update Headline' : 'Create Headline'}
          </button>
        </form>
        <h2>Headline List</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Placement</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {headlines.map((headline) => (
            <tr key={headline.title}>
              <td>{headline.title}</td>
              <td>{headline.t_placement}</td>
              <td>
                <center>
                  <button onClick={() => editHeadline(headline)} className="btn btn-secondary">Edit</button>
                  <button onClick={() => deleteHeadline(headline.title)} className="btn btn-danger">Delete</button>
                </center>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

        <h2>Image Upload</h2>
        <form onSubmit={handleImageSubmit} className="form">
          <div className="form-group">
            <label htmlFor="t_placement">Placement:</label>
            <select
              id="t_placement"
              name="t_placement"
              value={imageForm.t_placement}
              onChange={handleImageInputChange}
              className="form-control"
              required
            >
              <option value="">Select Placement</option>
              <option value="banner">Banner</option>
              <option value="ad">Ad</option>
              <option value="carousel">Carousel</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <input
              type="text"
              id="description"
              name="description"
              value={imageForm.description}
              onChange={handleImageInputChange}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="img_file">Image File:</label>
            <input
              type="file"
              id="img_file"
              name="img_file"
              onChange={handleImageInputChange}
              className="form-control"
              accept="image/*"
              required={!editImageMode}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            {editImageMode ? 'Update Image' : 'Upload Image'}
          </button>
        </form>
        <h2>Image List</h2>
      {['banner', 'ad', 'carousel'].map((placement) => (
        <div key={placement}>
          <h3>{placement.charAt(0).toUpperCase() + placement.slice(1)}</h3>
          {renderImageTable(placement)}</div>
      ))}
      </div>

    </div>
  );
}

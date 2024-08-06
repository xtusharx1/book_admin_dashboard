import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function BookEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(false);
    const [bookData, setBookData] = useState({
        b_id: '',
        b_name: '',
        description: '',
        author: '',
        b_url: '',
        img_path: '',
        sell_price: '',
        max_price: '',
        img_file: null
    });

    useEffect(() => {
        getBookData();
    }, [id]);

    const getBookData = async () => {
        try {
            const response = await axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/books/getbook/${id}`);
            if (response.data) {
                setBookData(response.data);
            } else {
                //console.error('Book not found');
            }
        } catch (error) {
            //console.error('Error fetching book data:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'img_file') {
            setBookData({ ...bookData, img_file: files[0], img_path: URL.createObjectURL(files[0]) });
        } else {
            setBookData({ ...bookData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formDataToSend = new FormData();
        Object.keys(bookData).forEach(key => {
            if (key === 'img_file' && bookData[key]) {
                formDataToSend.append(key, bookData[key]);
                formDataToSend.append('img_path', bookData.img_path);
            } else if (key !== 'img_file') {
                formDataToSend.append(key, bookData[key]);
            }
        });

        try {
            setLoading(true);
            await axios.put(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/books/books/${id}`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setLoading(false);
            navigate(`/portal/chapter-edit/${id}`);
        } catch (error) {
            //console.error('Error updating book:', error);
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h2>Edit Book</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Book ID</label>
                    <input
                        type="text"
                        className="form-control"
                        name="b_id"
                        value={bookData.b_id}
                        disabled
                    />
                </div>
                <div className="form-group">
                    <label>Book Name</label>
                    <input
                        type="text"
                        className="form-control"
                        name="b_name"
                        value={bookData.b_name}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <input
                        type="text"
                        className="form-control"
                        name="description"
                        value={bookData.description}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label>Author</label>
                    <input
                        type="text"
                        className="form-control"
                        name="author"
                        value={bookData.author}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label>URL</label>
                    <input
                        type="url"
                        className="form-control"
                        name="b_url"
                        value={bookData.b_url}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label>Image</label>
                    <input
                        type="file"
                        className="form-control"
                        name="img_file"
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label>Image Path (URL)</label>
                    <input
                        type="text"
                        className="form-control"
                        name="img_path"
                        value={bookData.img_path}
                        disabled
                    />
                </div>
                <div className="form-group">
                    <label>Sell Price</label>
                    <input
                        type="text"
                        className="form-control"
                        name="sell_price"
                        value={bookData.sell_price}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label>Max Price</label>
                    <input
                        type="text"
                        className="form-control"
                        name="max_price"
                        value={bookData.max_price}
                        onChange={handleInputChange}
                    />
                </div>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? 'Updating...' : 'Update'}
                </button>
            </form>
        </div>
    );
}

export default BookEdit;

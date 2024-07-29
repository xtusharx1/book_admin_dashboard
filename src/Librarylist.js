import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import debounce from 'lodash.debounce'; // You need to install lodash.debounce

function LibraryList() {
  const [bookList, setBookList] = useState([]);
  const [filteredBookList, setFilteredBookList] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // On Load
    getBooks();
    console.log("Welcome to LibraryList");
  }, []);

  const getBooks = async () => {
    try {
      const response = await axios.get("http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/books/all");
      console.log("Fetched books response:", response); // Logging the full response
      if (response.data && Array.isArray(response.data)) {
        // Sort books by id ascending
        const sortedBooks = response.data.sort((a, b) => a.b_id - b.b_id);
        setBookList(sortedBooks);
        setFilteredBookList(sortedBooks); // Set filteredBookList as well
        console.log("Books set in state:", response.data); // Logging the data set in state
      } else {
        console.error("Unexpected response format:", response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching books:", error);
      setLoading(false);
    }
  };

  // Debounced search function
  const handleSearch = useCallback(
    debounce((query) => {
      // Filter books based on search query
      const filtered = bookList.filter(book =>
        book.b_name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredBookList(filtered);
    }, 300), // Debounce delay in milliseconds
    [bookList]
  );

  const handleSearchInputChange = (event) => {
    const { value } = event.target;
    setSearchQuery(value);
    handleSearch(value);
  };

  const deleteBook = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this book?");
    if (!isConfirmed) {
      return;
    }
    
    try {
      await axios.delete(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/books/books/${id}`);
      setBookList(bookList.filter(book => book.b_id !== id));
      setFilteredBookList(filteredBookList.filter(book => book.b_id !== id));
      console.log(`Deleted book with id ${id}`);
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  };

  // Inline CSS styles
  const tableStyles = {
    width: '100%',
    borderCollapse: 'collapse',
  };

  const thTdStyles = {
    border: '1px solid #ddd',
    padding: '8px',
    textAlign: 'left',
  };

  const thStyles = {
    ...thTdStyles,
    backgroundColor: '#007bff',
    color: 'white',
    position: 'sticky',
    top: 0,
  };

  const tdStyles = {
    ...thTdStyles,
  };

  const noDataStyles = {
    textAlign: 'center',
    padding: '10px',
    fontStyle: 'italic',
  };

  const descriptionStyles = {
    whiteSpace: 'pre-wrap', // Ensure text wraps and preserves whitespace
    wordWrap: 'break-word', // Break long words to fit within the container
  };

  // Style for search bar
  const searchBarStyles = {
    maxWidth: '300px', // Adjust the width as needed
    width: '100%',
    marginRight: '10px',
  };

  return (
    <>
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800"></h1>
        <Link to="/portal/Book-create" className="btn btn-primary btn-sm">Create Book</Link>
      </div>
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">App List</h6>
        </div>
        <div className="card-body">
          <div className="mb-3 d-flex align-items-center">
            <div className="input-group" style={searchBarStyles}>
              <input
                type="text"
                placeholder="Search App"
                value={searchQuery}
                onChange={handleSearchInputChange}
                className="form-control"
                aria-label="Search"
              />
              <div className="input-group-append">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
              </div>
            </div>
          </div>
          {isLoading ? (
            <img src="https://media.giphy.com/media/ZO9b1ntYVJmjZlsWlm/giphy.gif" alt="Loading" />
          ) : (
            <div className="table-responsive">
              <table style={tableStyles} className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
                <thead>
                  <tr>
                    <th style={thStyles}>Id</th>
                    <th style={thStyles}>App Name</th>
                    <th style={thStyles}>Description</th>
                    <th style={thStyles}>Author</th>
                    <th style={thStyles}>Play Store URL</th>
                    <th style={thStyles}>Book Cover</th>
                    <th style={thStyles}>Sell Price</th>
                    <th style={thStyles}>Max Price</th>
                    <th style={thStyles}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookList.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={noDataStyles}>No books found</td>
                    </tr>
                  ) : (
                    filteredBookList.map((book) => (
                      <tr key={book.b_id}>
                        <td style={tdStyles}>{book.b_id}</td>
                        <td style={tdStyles}>{book.b_name}</td>
                        <td style={{ ...tdStyles, ...descriptionStyles }}>{book.description}</td>
                        <td style={tdStyles}>{book.author}</td>
                        <td style={tdStyles}><a href={book.b_url} target="_blank" rel="noopener noreferrer">Link</a></td>
                        <td style={tdStyles}><a href={book.img_path} target="_blank" rel="noopener noreferrer"><img src={book.img_path} alt="Book Cover" style={{ maxWidth: '100px' }} /></a></td>
                        <td style={tdStyles}>{book.sell_price}</td>
                        <td style={tdStyles}>{book.max_price}</td>
                        <td style={tdStyles}>
                          <Link to={`/portal/Book-view/${book.b_id}`} className="btn btn-primary btn-sm mr-1">View</Link>
                          <Link to={`/portal/Book-edit/${book.b_id}`} className="btn btn-info btn-sm mr-1">Edit</Link>
                          <button onClick={() => deleteBook(book.b_id)} className="btn btn-danger btn-sm">Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default LibraryList;

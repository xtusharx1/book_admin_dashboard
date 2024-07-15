import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function LibraryList() {
  const [bookList, setBookList] = useState([]);
  const [isLoading, setLoading] = useState(true);

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
        setBookList(response.data);
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

  const deleteBook = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this book?");
    if (!isConfirmed) {
      return;
    }
    
    try {
      await axios.delete(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/books/${id}`);
      setBookList(bookList.filter(book => book.b_id !== id));
      console.log(`Deleted book with id ${id}`);
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  };

  return (
    <>
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">Library</h1>
        <Link to="/portal/book-create" className="btn btn-primary btn-sm">Create Book</Link>
      </div>
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Book Data</h6>
        </div>
        <div className="card-body">
          {isLoading ? (
            <img src="https://media.giphy.com/media/ZO9b1ntYVJmjZlsWlm/giphy.gif" alt="Loading" />
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
                <thead>
                  <tr>
                    <th>Id</th>
                    <th>Name</th>
                    <th>Publisher</th>
                    <th>Author</th>
                    <th>URL</th>
                    <th>Image Path</th>
                    <th>E-Book Price</th>
                    <th>Paperback Price</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookList.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center">No books found</td>
                    </tr>
                  ) : (
                    bookList.map((book) => (
                      <tr key={book.b_id}>
                        <td>{book.b_id}</td>
                        <td>{book.b_name}</td>
                        <td>{book.publisher}</td>
                        <td>{book.author}</td>
                        <td><a href={book.b_url} target="_blank" rel="noopener noreferrer">Link</a></td>
                        <td>{book.img_path}</td>
                        <td>{book.eb_price}</td>
                        <td>{book.pb_price}</td>
                        <td>
                          <Link to={`/portal/Book-view/`} className="btn btn-primary btn-sm mr-1">View</Link>
                          <Link to={`/portal/book-edit/${book.b_id}`} className="btn btn-info btn-sm mr-1">Edit</Link>
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

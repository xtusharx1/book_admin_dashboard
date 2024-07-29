import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function Bookview() {
    const params = useParams();
    const [book, setBook] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [isLoadingBook, setLoadingBook] = useState(true);
    const [isLoadingChapters, setLoadingChapters] = useState(true);

    useEffect(() => {
        getBook();
        getChapters();
    }, []);

    const getBook = async () => {
        try {
            const response = await axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/books/getbook/${params.id}`);
            console.log("Fetched book:", response.data);
            setBook(response.data);
            setLoadingBook(false);
        } catch (error) {
            console.error("Error fetching book:", error);
            setLoadingBook(false);
        }
    };

    const getChapters = async () => {
        try {
            const response = await axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/chapters/findbybook/${params.id}`);
            console.log("Fetched chapters:", response.data);
            const sortedChapters = response.data.sort((a, b) => a.c_no - b.c_no);
            setChapters(sortedChapters);
            setLoadingChapters(false);
        } catch (error) {
            console.error("Error fetching chapters:", error);
            setLoadingChapters(false);
        }
    };

    return (
        <>
            

            {/* Render book details */}
            <div className="card shadow mb-4">
                <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">Book Details</h6>
                </div>
                <div className="card-body">
                    {isLoadingBook ? (
                        <img src="https://media.giphy.com/media/ZO9b1ntYVJmjZlsWlm/giphy.gif" alt="Loading" />
                    ) : (
                        book ? (
                            <div className="table-responsive">
                                <table className="table table-bordered" id="bookTable" width="100%" cellSpacing="0">
                                    <tbody>
                                        <tr>
                                            <th>Book ID</th>
                                            <td>{book.b_id}</td>
                                        </tr>
                                        <tr>
                                            <th>Book Name</th>
                                            <td>{book.b_name}</td>
                                        </tr>
                                        <tr>
                                            <th>Description</th>
                                            <td>{book.description}</td>
                                        </tr>
                                        <tr>
                                            <th>Author</th>
                                            <td>{book.author}</td>
                                        </tr>
                                        <tr>
                                            <th>Sell Price</th>
                                            <td>{book.sell_price}</td>
                                        </tr>
                                        <tr>
                                            <th>Max Price</th>
                                            <td>{book.max_price}</td>
                                        </tr>
                                        <tr>
                                            <th>Book URL</th>
                                            <td><a href={book.b_url} target="_blank" rel="noopener noreferrer">{book.b_name}</a></td>
                                        </tr>
                                        {book.img_path && (
                                            <tr>
                                                <th>Book Cover</th>
                                                <td><img src={book.img_path} alt="Book Cover" style={{ maxWidth: '200px', maxHeight: '200px' }} /></td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p>No book found</p>
                        )
                    )}
                </div>
            </div>

            {/* Render chapters */}
            <div className="card shadow mb-4">
                <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">Chapters</h6>
                </div>
                <div className="card-body">
                    {isLoadingChapters ? (
                        <img src="https://media.giphy.com/media/ZO9b1ntYVJmjZlsWlm/giphy.gif" alt="Loading" />
                    ) : (
                        chapters.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-bordered" id="chaptersTable" width="100%" cellSpacing="0">
                                    <thead>
                                        <tr>
                                            <th>Chapter Number</th>
                                            <th>Title</th>
                                            <th>Chapter URL</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {chapters.map(chapter => (
                                            <tr key={chapter.id}>
                                                <td>{chapter.c_no}</td>
                                                <td>{chapter.title}</td>
                                                <td><a href={chapter.c_url} target="_blank" rel="noopener noreferrer">View Chapter</a></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p>No chapters found for this book.</p>
                        )
                    )}
                </div>
            </div>
        </>
    );
}

export default Bookview;

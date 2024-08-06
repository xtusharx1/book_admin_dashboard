import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function ChapterEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(false);
    const [chapters, setChapters] = useState([]);

    useEffect(() => {
        fetchChapters();
    }, []);

    const fetchChapters = async () => {
        try {
            const response = await axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/chapters/findbybook/${id}`);
            if (response.data && response.data.length > 0) {
                const sortedChapters = response.data.sort((a, b) => a.c_no - b.c_no);
                setChapters(sortedChapters);
            } else {
                //console.error('Chapters not found');
                setChapters([]);
            }
        } catch (error) {
            //console.error('Error fetching chapters:', error);
        }
    };

    const handleInputChange = (e, index) => {
        const { name, value } = e.target;
        const updatedChapters = [...chapters];
        updatedChapters[index] = { ...updatedChapters[index], [name]: value };
        setChapters(updatedChapters);
    };

    const handleUpdateChapter = async (chapter, index) => {
        setLoading(true);
        try {
            await axios.put(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/chapters/update/${chapter.id}`, chapter);
            console.log('Chapter updated successfully');
        } catch (error) {
            //console.error('Error updating chapter:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteChapter = async (chapterId) => {
        setLoading(true);
        try {
            await axios.delete(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/chapters/delete/${chapterId}`);
            console.log('Chapter deleted successfully');
            fetchChapters(); // Refresh the chapters after deletion
        } catch (error) {
            //console.error('Error deleting chapter:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateChapter = () => {
        navigate(`/portal/Chapter-create/${id}`);
    };

    const handleFinish = () => {
        navigate(`/portal/Book-view/${id}`);
    };

    return (
        <div className="container mt-4">
            <h2>Edit Chapters</h2>
            {chapters.length > 0 ? (
                chapters.map((chapter, index) => (
                    <form key={chapter.id || index} onSubmit={(e) => { e.preventDefault(); handleUpdateChapter(chapter, index); }} className="chapter-edit-form">
                        <div className="form-row mb-2">
                            <div className="form-group col">
                                <label className="mr-2">Chapter Number:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="c_no"
                                    value={chapter.c_no}
                                    onChange={(e) => handleInputChange(e, index)}
                                />
                            </div>
                            <div className="form-group col">
                                <label className="mr-2">Title:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="title"
                                    value={chapter.title}
                                    onChange={(e) => handleInputChange(e, index)}
                                />
                            </div>
                            <div className="form-group col">
                                <label className="mr-2">Chapter URL:</label>
                                <input
                                    type="url"
                                    className="form-control"
                                    name="c_url"
                                    value={chapter.c_url}
                                    onChange={(e) => handleInputChange(e, index)}
                                />
                            </div>
                            <div className="form-group col-auto align-self-end">
                                <button type="submit" className="btn btn-primary mr-2" disabled={isLoading}>
                                    {isLoading ? 'Updating...' : 'Update'}
                                </button>
                                <button type="button" className="btn btn-danger" onClick={() => handleDeleteChapter(chapter.id)} disabled={isLoading}>
                                    {isLoading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </form>
                ))
            ) : (
                <div>
                    <p>No chapters found for this book.</p>
                </div>
            )}
            <div className="mt-4">
                <button className="btn btn-primary mr-2" onClick={handleCreateChapter}>Add Chapter</button>
                <button className="btn btn-success" onClick={handleFinish}>Finish</button>
            </div>
        </div>
    );
}

export default ChapterEdit;

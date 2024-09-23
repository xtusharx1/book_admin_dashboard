import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Papa from 'papaparse'; // Import papaparse for CSV parsing
import Spinner from 'react-bootstrap/Spinner'; // Import Spinner component

function ChapterEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(false);
    const [chapters, setChapters] = useState([]);
    const [csvFiles, setCsvFiles] = useState({}); // State to store CSV files for each chapter
    const [error, setError] = useState(null); // State to store error messages

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
                setChapters([]);
            }
        } catch (error) {
            console.error('Error fetching chapters:', error);
            setError('Failed to fetch chapters. Please try again later.');
        }
    };

    const handleInputChange = (e, index) => {
        const { name, value } = e.target;
        const updatedChapters = [...chapters];
        updatedChapters[index] = { ...updatedChapters[index], [name]: value };
        setChapters(updatedChapters);
    };

    const handleFileChange = (e, index) => {
        const file = e.target.files[0];
        setCsvFiles(prevState => ({ ...prevState, [index]: file }));
    };

    
// Superscript map for exponents
const superscriptMap = {
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹'
};

// Convert text with superscripts
const convertToSuperscript = (text) => {
    return text.replace(/\^(\d+)/g, (_, digits) => {
        return Array.from(digits).map(digit => superscriptMap[digit] || digit).join('');
    });
};

// Check if text contains math symbols that need formatting
const hasMathSymbols = (text) => {
    return /[\^√±×÷≤≥∞∑π≈→]/.test(text); // Detects math symbols
};

// Format text with math symbols for LaTeX rendering
const formatMathSymbols = (text) => {
    return text
        .replace(/√/g, '\\sqrt{}')        // Square root
        .replace(/±/g, '\\pm')            // Plus-minus
        .replace(/×/g, '\\times')         // Multiplication
        .replace(/÷/g, '/')               // Division
        .replace(/≤/g, '\\leq')           // Less than or equal to
        .replace(/≥/g, '\\geq')           // Greater than or equal to
        .replace(/∞/g, '\\infty')         // Infinity
        .replace(/∑/g, '\\sum')           // Summation
        .replace(/π/g, '\\pi')            // Pi
        .replace(/≈/g, '\\approx')        // Approximately equal to
        .replace(/_/g, '\\_')             // Underscore
        .replace(/→/g, '\\rightarrow');   // Arrow
};

// Function to process text with symbols (keeping original symbols)
const processText = (text) => {
    // Apply superscript conversion
    const superscriptText = convertToSuperscript(text);
    // Return the processed text (symbols are kept as they are)
    return superscriptText;
};

// Process CSV data with formatting
const processCSV = (file, chapterId) => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (parsedData) => {
                const formattedData = parsedData.data.map(row => ({
                    chapter_id: chapterId,
                    question_text: processText(row['question_text'] || ''), // Apply formatting and superscript
                    option1: processText(row['option1'] || ''),               // Apply formatting and superscript
                    option2: processText(row['option2'] || ''),               // Apply formatting and superscript
                    option3: processText(row['option3'] || ''),               // Apply formatting and superscript
                    option4: processText(row['option4'] || ''),               // Apply formatting and superscript
                    correct_option: processText(row['correct_option'] || '')  // Apply formatting and superscript
                }));
                console.log('Formatted CSV Data:', formattedData); // Debugging line
                resolve(formattedData);
            },
            error: (error) => {
                console.error('CSV Parsing Error:', error);
                reject(error);
            }
        });
    });
};

    const handleUploadCSV = async (chapterId, index) => {
        if (!csvFiles[index]) {
            alert('Please select a CSV file for this chapter.');
            return;
        }
    
        setLoading(true);
        try {
            const csvData = await processCSV(csvFiles[index], chapterId);
            const response = await axios.post(
                `http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/questions/add`,
                { chapter_id: chapterId, questions: csvData },
                { headers: { 'Content-Type': 'application/json' } }
            );
            console.log(`CSV data for chapter ${chapterId} uploaded successfully`, response.data);
            alert('CSV data uploaded successfully!');
        } catch (error) {
            console.error(`Error processing or uploading CSV for chapter ${chapterId}:`, error);
            setError('Failed to upload CSV data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateChapter = async (chapter, index) => {
        setLoading(true);
        try {
            await axios.put(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/chapters/update/${chapter.id}`, chapter);
            console.log('Chapter updated successfully');
            alert('Chapter updated successfully!');
        } catch (error) {
            console.error('Error updating chapter:', error);
            setError('Failed to update chapter. Please try again.');
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
            alert('Chapter deleted successfully!');
        } catch (error) {
            console.error('Error deleting chapter:', error);
            setError('Failed to delete chapter. Please try again.');
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
            {error && <div className="alert alert-danger">{error}</div>}
            {isLoading && <Spinner animation="border" role="status"><span className="sr-only">Loading...</span></Spinner>}
            
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
                                <label className="d-block">Add Questions:</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    accept=".csv"
                                    onChange={(e) => handleFileChange(e, index)}
                                />
                                <button
                                    type="button"
                                    className="btn btn-primary mt-2"
                                    onClick={() => handleUploadCSV(chapter.id, index)}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Uploading...' : 'Upload CSV'}
                                </button>
                                <button type="submit" className="btn btn-primary mr-2 mt-2" disabled={isLoading}>
                                    {isLoading ? 'Updating...' : 'Update'}
                                </button>
                                <button type="button" className="btn btn-danger mt-2" onClick={() => handleDeleteChapter(chapter.id)} disabled={isLoading}>
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

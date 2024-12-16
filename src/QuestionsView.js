import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function QuestionsView() {
    const { chapterId } = useParams(); // Get the chapter ID from URL params
    const [questions, setQuestions] = useState([]);
    const [chapterName, setChapterName] = useState(''); // State to store chapter name
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuestions();
        fetchChapterDetails();
    }, [chapterId]);

    const fetchQuestions = async () => {
        try {
            const response = await axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/questions/chapter/${chapterId}`);
            setQuestions(response.data);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error('Error fetching questions:', error);
        }
    };

    const fetchChapterDetails = async () => {
        try {
            const response = await axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/chapters/find/${chapterId}`);
            setChapterName(response.data.title || 'Unknown Chapter');
        } catch (error) {
            console.error('Error fetching chapter details:', error);
            setChapterName('Unknown Chapter');
        }
    };

    // Helper function to check if a string is an image URL
    const isImageUrl = (url) => {
        return url?.match(/\.(jpeg|jpg|gif|png|webp)$/) != null;
    };

    const handleDelete = async (q_id) => {
        if (!window.confirm('Are you sure you want to delete this question?')) return;

        try {
            await axios.delete(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/questions/${q_id}`);
            setQuestions(questions.filter(question => question.q_id !== q_id));
            alert('Question deleted successfully');
        } catch (error) {
            console.error('Error deleting question:', error);
            alert('Failed to delete the question. Please try again.');
        }
    };

    const exportToCsv = () => {
        const headers = ['S.No.', 'Question Text', 'Option 1', 'Option 2', 'Option 3', 'Option 4', 'Correct Option'];
        
        const escapeCsvField = (field) => {
            if (typeof field === 'string') {
                return `"${field.replace(/"/g, '""')}"`; 
            }
            return field;
        };
        
        const rows = questions.map((question, index) => [
            escapeCsvField(index + 1),
            escapeCsvField(question.question_text),
            escapeCsvField(question.option1),
            escapeCsvField(question.option2),
            escapeCsvField(question.option3),
            escapeCsvField(question.option4),
            escapeCsvField(question.correct_option)
        ]);
    
        let csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += headers.map(escapeCsvField).join(',') + '\n'; 
        rows.forEach(row => {
            csvContent += row.map(escapeCsvField).join(',') + '\n'; 
        });
    
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `${chapterName}_questions.csv`);
        document.body.appendChild(link);
        link.click();
    };
    
    return (
        <div className="container mt-4">
            <h2>Questions for Chapter: {chapterName}</h2>
            <button className="btn btn-primary mb-3" onClick={exportToCsv}>
                Export to CSV
            </button>
            {isLoading ? (
                <img src="https://media.giphy.com/media/ZO9b1ntYVJmjZlsWlm/giphy.gif" alt="Loading" />
            ) : (
                questions.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table table-bordered" id="questionsTable" width="2000px" cellSpacing="0">
                            <thead>
                                <tr>
                                    <th>S.No.</th>
                                    <th>Question Text</th>
                                    <th>Option 1</th>
                                    <th>Option 2</th>
                                    <th>Option 3</th>
                                    <th>Option 4</th>
                                    <th>Correct Option</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {questions.map((question, index) => (
                                    <tr key={question.q_id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            {isImageUrl(question.question_text) ? (
                                                <img src={question.question_text} alt="Question" style={{ width: '100px', height: '100px' }} />
                                            ) : (
                                                question.question_text
                                            )}
                                        </td>
                                        <td>
                                            {isImageUrl(question.option1) ? (
                                                <img src={question.option1} alt="Option 1" style={{ width: '100px', height: '100px' }} />
                                            ) : (
                                                question.option1
                                            )}
                                        </td>
                                        <td>
                                            {isImageUrl(question.option2) ? (
                                                <img src={question.option2} alt="Option 2" style={{ width: '100px', height: '100px' }} />
                                            ) : (
                                                question.option2
                                            )}
                                        </td>
                                        <td>
                                            {isImageUrl(question.option3) ? (
                                                <img src={question.option3} alt="Option 3" style={{ width: '100px', height: '100px' }} />
                                            ) : (
                                                question.option3
                                            )}
                                        </td>
                                        <td>
                                            {isImageUrl(question.option4) ? (
                                                <img src={question.option4} alt="Option 4" style={{ width: '100px', height: '100px' }} />
                                            ) : (
                                                question.option4
                                            )}
                                        </td>
                                        <td>
                                            {isImageUrl(question.correct_option) ? (
                                                <img src={question.correct_option} alt="Correct Option" style={{ width: '100px', height: '100px' }} />
                                            ) : (
                                                question.correct_option
                                            )}
                                        </td>
                                        <td>
                                            <button 
                                                className="btn btn-danger btn-sm" 
                                                onClick={() => handleDelete(question.q_id)}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p>No questions found for this chapter.</p>
                )
            )}
        </div>
    );
}

export default QuestionsView;

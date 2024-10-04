import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
 import { Papa } from 'papaparse';

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

    const exportToCsv = () => {
        const headers = ['Question Text', 'Option 1', 'Option 2', 'Option 3', 'Option 4', 'Correct Option'];
        
        // This function wraps each field in double quotes to handle commas
        const escapeCsvField = (field) => {
            if (typeof field === 'string') {
                // Escape only the internal double quotes by doubling them
                return `"${field.replace(/"/g, '""')}"`; 
            }
            return field;
        };
        
    
        const rows = questions.map(question => [
            escapeCsvField(question.question_text),
            escapeCsvField(question.option1),
            escapeCsvField(question.option2),
            escapeCsvField(question.option3),
            escapeCsvField(question.option4),
            escapeCsvField(question.correct_option)
        ]);
    
        let csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += headers.map(escapeCsvField).join(',') + '\n'; // Join headers with commas
        rows.forEach(row => {
            csvContent += row.map(escapeCsvField).join(',') + '\n'; // Join each row with commas
        });
    
        // Create a download link and trigger a download
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
                                    <th>Question Text</th>
                                    <th>Option 1</th>
                                    <th>Option 2</th>
                                    <th>Option 3</th>
                                    <th>Option 4</th>
                                    <th>Correct Option</th>
                                </tr>
                            </thead>
                            <tbody>
                                {questions.map(question => (
                                    <tr key={question.q_id}>
                                        <td>{question.question_text}</td>
                                        <td>{question.option1}</td>
                                        <td>{question.option2}</td>
                                        <td>{question.option3}</td>
                                        <td>{question.option4}</td>
                                        <td>{question.correct_option}</td>
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

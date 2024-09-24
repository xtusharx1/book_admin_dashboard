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

    return (
        <div className="container mt-4">
            <h2>Questions for Chapter: {chapterName}</h2>
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

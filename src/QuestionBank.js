import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './QuestionBank.css'; // Add custom CSS for styling

const QuestionBank = () => {
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  
  const navigate = useNavigate(); // Initialize navigate

  // Fetch all books on component mount
  useEffect(() => {
    fetch('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/books/all')
      .then(response => response.json())
      .then(data => setBooks(data))
      .catch(err => console.error('Error fetching books:', err));
  }, []);

  // Fetch chapters based on selected book
  const handleBookSelect = (bookId) => {
    setSelectedBook(bookId);
    fetch(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/chapters/findbybook/${bookId}`)
      .then(response => response.json())
      .then(data => setChapters(data))
      .catch(err => console.error('Error fetching chapters:', err));
  };

  // Fetch question count based on selected chapter
  const handleChapterSelect = (chapterId) => {
    setSelectedChapter(chapterId);
    fetch(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/questions/chapter/${chapterId}`)
      .then(response => response.json())
      .then(data => setQuestionCount(data.length)) // Get the number of questions
      .catch(err => console.error('Error fetching question count:', err));
  };

  const handleAddQuestion = () => {
    navigate(`/portal/QuestionEditor/${selectedChapter}`); // Redirect to QuestionEditor with chapterId
  };

  const handleShowQuestions = () => {
    navigate(`/portal/QuestionsView/${selectedChapter}`); // Navigate to QuestionsView with chapterId
  };

  return (
    <div className="question-bank-container">
      <h2 className="question-bank-title">Question Bank</h2>
      <div className="dropdown-container">
        <label>Select a Book:</label>
        <select onChange={(e) => handleBookSelect(e.target.value)} value={selectedBook} className="dropdown">
          <option value="">-- Select Book --</option>
          {books.map(book => (
            <option key={book.b_id} value={book.b_id}>{book.b_name}</option>
          ))}
        </select>
      </div>

      {selectedBook && (
        <div className="dropdown-container">
          <label>Select a Chapter:</label>
          <select onChange={(e) => handleChapterSelect(e.target.value)} value={selectedChapter} className="dropdown">
            <option value="">-- Select Chapter --</option>
            {chapters.map(chapter => (
              <option key={chapter.id} value={chapter.id}>{chapter.title}</option>
            ))}
          </select>
        </div>
      )}

      {selectedChapter && (
        <div className="question-section">
          <h3>Total Questions: {questionCount}</h3>
          <div className="button-container">
            <button onClick={handleAddQuestion} className="action-button">Add Question</button>
            <button onClick={handleShowQuestions} className="action-button">Show Questions</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBank;

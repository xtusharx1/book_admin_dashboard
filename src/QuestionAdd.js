import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import Placeholder from '@tiptap/extension-placeholder';
import './QuestionBank.css'; // Custom CSS for styling

const QuestionEditor = () => {
  const { chapterId } = useParams(); // Get chapterId from URL params
  const [mode, setMode] = useState(''); // Mode to either add or edit
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [option3, setOption3] = useState('');
  const [option4, setOption4] = useState('');
  const [correctOption, setCorrectOption] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      BulletList,
      OrderedList,
      Placeholder.configure({
        placeholder: 'Enter the question here...',
      }),
    ],
  });

  // Fetch questions for the selected chapter
  useEffect(() => {
    if (mode === 'edit') {
      fetchQuestions();
    }
  }, [mode]);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/questions/chapter/${chapterId}`);
      setQuestions(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setIsLoading(false);
    }
  };

  const handleAddQuestion = async () => {
    const questionText = editor.getHTML(); // Get the formatted question content from the editor
  
    // Get the correct option text based on the selected correct option
    const correctOptionText = correctOption === 'option1' ? option1 
      : correctOption === 'option2' ? option2 
      : correctOption === 'option3' ? option3 
      : option4;
  
    const newQuestion = {
      chapter_id: chapterId,
      question_text: questionText, // Send question text separately
      option1, // Send individual options
      option2,
      option3,
      option4,
      correct_option: correctOptionText // Send the text of the correct option
    };
  
    try {
      // POST request to your API to save the question
      await axios.post('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/questions/add', {
        chapter_id: chapterId,
        questions: [newQuestion] // Wrap the question object in an array
      });
      alert('Question added successfully');
      
      // Reset form fields after submission
      editor.commands.setContent('<p>Enter the question here...</p>');
      setOption1(''); setOption2(''); setOption3(''); setOption4(''); setCorrectOption('');
    } catch (error) {
      console.error('Error saving the question:', error);
    }
  };

  const handleDeleteQuestion = async (q_id) => {
    try {
      await axios.delete(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/questions/${q_id}`);
      alert('Question deleted successfully');
      fetchQuestions(); // Refresh the question list after deletion
    } catch (error) {
      console.error('Error deleting the question:', error);
    }
  };

  return (
    <div className="container">
      <h2>Manage Questions</h2>
      <div className="mode-select">
        <button onClick={() => setMode('add')} className="btn btn-primary">
          Add Question
        </button>
        <button onClick={() => setMode('edit')} className="btn btn-secondary">
          Edit Questions
        </button>
      </div>

      {mode === 'add' && (
        <div className="add-question-container">
          <div className="editor-container">
            <div className="toolbar">
              <button onClick={() => editor.chain().focus().toggleBold().run()} className="toolbar-button">B</button>
              <button onClick={() => editor.chain().focus().toggleItalic().run()} className="toolbar-button">I</button>
              <button onClick={() => editor.chain().focus().toggleUnderline().run()} className="toolbar-button">U</button>
              <button onClick={() => editor.chain().focus().toggleBulletList().run()} className="toolbar-button">Bullet</button>
              <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className="toolbar-button">Ordered</button>
            </div>
            <EditorContent editor={editor} className="editor-content" />
          </div>

          <div className="options-container">
            <label>Option 1:</label>
            <input type="text" value={option1} onChange={(e) => setOption1(e.target.value)} />

            <label>Option 2:</label>
            <input type="text" value={option2} onChange={(e) => setOption2(e.target.value)} />

            <label>Option 3:</label>
            <input type="text" value={option3} onChange={(e) => setOption3(e.target.value)} />

            <label>Option 4:</label>
            <input type="text" value={option4} onChange={(e) => setOption4(e.target.value)} />

            <label>Correct Option:</label>
            <select value={correctOption} onChange={(e) => setCorrectOption(e.target.value)}>
              <option value="">-- Select Correct Option --</option>
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
              <option value="option3">Option 3</option>
              <option value="option4">Option 4</option>
            </select>
          </div>

          <button onClick={handleAddQuestion} className="btn btn-primary">
            Add Question
          </button>
        </div>
      )}

      {/* Edit Question Mode */}
      {mode === 'edit' && (
        <>
          <h3>Edit Questions</h3>
          {isLoading ? (
            <p>Loading questions...</p>
          ) : questions.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-bordered" id="questionsTable" width="100%" cellSpacing="0">
                <thead>
                  <tr>
                    <th>Question Text</th>
                    <th>Option 1</th>
                    <th>Option 2</th>
                    <th>Option 3</th>
                    <th>Option 4</th>
                    <th>Correct Option</th>
                    <th>Edit</th>
                    <th>Delete</th> {/* Added Delete Column */}
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
                      <td>
                        <button className="btn btn-warning">Edit</button> {/* Edit functionality placeholder */}
                      </td>
                      <td>
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleDeleteQuestion(question.q_id)} // Delete button
                        >
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
          )}
        </>
      )}
    </div>
  );
};

export default QuestionEditor;

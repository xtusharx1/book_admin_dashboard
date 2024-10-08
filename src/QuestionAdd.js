import React, { useState } from 'react';
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
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [option3, setOption3] = useState('');
  const [option4, setOption4] = useState('');
  const [correctOption, setCorrectOption] = useState('');
  const [questionImage, setQuestionImage] = useState(null);
  const [option1Image, setOption1Image] = useState(null);
  const [option2Image, setOption2Image] = useState(null);
  const [option3Image, setOption3Image] = useState(null);
  const [option4Image, setOption4Image] = useState(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      BulletList,
      OrderedList,
      Placeholder.configure({
        placeholder: '',
      }),
    ],
  });

  // Helper function to handle image upload
  const uploadImage = async (image) => {
    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await axios.post('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/questions/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Uploaded Image URL:', response.data.imageUrl); // Log image URL
      return response.data.imageUrl; // Return the image URL from the response
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleAddQuestion = async () => {
    let questionImageUrl = null;
    let option1ImageUrl = null;
    let option2ImageUrl = null;
    let option3ImageUrl = null;
    let option4ImageUrl = null;

    // Upload question image if applicable
    if (questionImage) {
      questionImageUrl = await uploadImage(questionImage);
      if (!questionImageUrl) {
        alert('Failed to upload question image');
        return;
      }
    }

    // Upload option images if applicable
    if (option1Image) {
      option1ImageUrl = await uploadImage(option1Image);
      if (!option1ImageUrl) {
        alert('Failed to upload option 1 image');
        return;
      }
    }

    if (option2Image) {
      option2ImageUrl = await uploadImage(option2Image);
      if (!option2ImageUrl) {
        alert('Failed to upload option 2 image');
        return;
      }
    }

    if (option3Image) {
      option3ImageUrl = await uploadImage(option3Image);
      if (!option3ImageUrl) {
        alert('Failed to upload option 3 image');
        return;
      }
    }

    if (option4Image) {
      option4ImageUrl = await uploadImage(option4Image);
      if (!option4ImageUrl) {
        alert('Failed to upload option 4 image');
        return;
      }
    }

    // Get the correct option text or image URL based on the selected correct option
    const correctOptionText = correctOption === 'option1' ? (option1ImageUrl || option1) 
      : correctOption === 'option2' ? (option2ImageUrl || option2) 
      : correctOption === 'option3' ? (option3ImageUrl || option3)
      : (option4ImageUrl || option4);

    // If there is a question image, use its URL as the `question_text`, otherwise use the editor content
    const questionText = questionImageUrl ? questionImageUrl : editor.getHTML().trim() !== '<p></p>' ? editor.getHTML() : null;

    // If both question text and image are empty, return an error
    if (!questionText) {
      alert('Please enter a question text or upload an image');
      return;
    }

    // Construct the new question object
    const newQuestion = {
      chapter_id: chapterId,
      question_text: questionText, // Send question image URL as text if present, otherwise use editor content
      option1: option1ImageUrl || option1, // Map correct text or image URL for each option
      option2: option2ImageUrl || option2,
      option3: option3ImageUrl || option3,
      option4: option4ImageUrl || option4,
      correct_option: correctOptionText, // Correct option (text or image URL)
    };

    console.log('Final Question Object:', newQuestion); // Log the final question object

    try {
      // POST request to your API to save the question
      await axios.post('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/questions/add', {
        chapter_id: chapterId,
        questions: [newQuestion], // Wrap the question object in an array
      });
      alert('Question added successfully');
      
      // Reset form fields after submission
      editor.commands.setContent('<p></p>');
      setOption1(''); setOption2(''); setOption3(''); setOption4(''); setCorrectOption('');
      setQuestionImage(null); setOption1Image(null); setOption2Image(null); setOption3Image(null); setOption4Image(null);
    } catch (error) {
      console.error('Error saving the question:', error);
    }
  };

  // Function to insert symbols into the editor
  const insertSymbol = (symbol, setState, value) => {
    setState(value + symbol);
  };

  return (
    <div className="container">
      <h2>Add Question</h2>
      <div className="editor-container">
        <div className="toolbar">
          <button onClick={() => editor.chain().focus().toggleBold().run()} className="toolbar-button">B</button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} className="toolbar-button">I</button>
          <button onClick={() => editor.chain().focus().toggleUnderline().run()} className="toolbar-button">U</button>
          <button onClick={() => editor.chain().focus().toggleBulletList().run()} className="toolbar-button">Bullet</button>
          <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className="toolbar-button">Ordered</button>
          
          {/* Add buttons for inserting common symbols */}
          <button onClick={() => insertSymbol('√', editor.commands.insertContent)} className="toolbar-button">√</button>
          <button onClick={() => insertSymbol('π', editor.commands.insertContent)} className="toolbar-button">π</button>
          <button onClick={() => insertSymbol('∞', editor.commands.insertContent)} className="toolbar-button">∞</button>
          <button onClick={() => insertSymbol('±', editor.commands.insertContent)} className="toolbar-button">±</button>
          <button onClick={() => insertSymbol('²', editor.commands.insertContent)} className="toolbar-button">²</button> {/* Superscript 2 */}
        </div>
        <EditorContent editor={editor} className="editor-content" />
      </div>

      <label>Upload Question Image (optional):</label>
      <input type="file" onChange={(e) => setQuestionImage(e.target.files[0])} />

      <div className="options-container">
        <label>Option 1:</label>
        <input type="text" value={option1} onChange={(e) => setOption1(e.target.value)} />
        <div className="symbol-buttons">
          <button onClick={() => insertSymbol('√', setOption1, option1)} className="toolbar-button">√</button>
          <button onClick={() => insertSymbol('π', setOption1, option1)} className="toolbar-button">π</button>
          <button onClick={() => insertSymbol('∞', setOption1, option1)} className="toolbar-button">∞</button>
          <button onClick={() => insertSymbol('±', setOption1, option1)} className="toolbar-button">±</button>
          <button onClick={() => insertSymbol('²', setOption1, option1)} className="toolbar-button">²</button>
        </div>
        <input type="file" onChange={(e) => setOption1Image(e.target.files[0])} />

        <label>Option 2:</label>
        <input type="text" value={option2} onChange={(e) => setOption2(e.target.value)} />
        <div className="symbol-buttons">
          <button onClick={() => insertSymbol('√', setOption2, option2)} className="toolbar-button">√</button>
          <button onClick={() => insertSymbol('π', setOption2, option2)} className="toolbar-button">π</button>
          <button onClick={() => insertSymbol('∞', setOption2, option2)} className="toolbar-button">∞</button>
          <button onClick={() => insertSymbol('±', setOption2, option2)} className="toolbar-button">±</button>
          <button onClick={() => insertSymbol('²', setOption2, option2)} className="toolbar-button">²</button>
        </div>
        <input type="file" onChange={(e) => setOption2Image(e.target.files[0])} />

        <label>Option 3:</label>
        <input type="text" value={option3} onChange={(e) => setOption3(e.target.value)} />
        <div className="symbol-buttons">
          <button onClick={() => insertSymbol('√', setOption3, option3)} className="toolbar-button">√</button>
          <button onClick={() => insertSymbol('π', setOption3, option3)} className="toolbar-button">π</button>
          <button onClick={() => insertSymbol('∞', setOption3, option3)} className="toolbar-button">∞</button>
          <button onClick={() => insertSymbol('±', setOption3, option3)} className="toolbar-button">±</button>
          <button onClick={() => insertSymbol('²', setOption3, option3)} className="toolbar-button">²</button>
        </div>
        <input type="file" onChange={(e) => setOption3Image(e.target.files[0])} />

        <label>Option 4:</label>
        <input type="text" value={option4} onChange={(e) => setOption4(e.target.value)} />
        <div className="symbol-buttons">
          <button onClick={() => insertSymbol('√', setOption4, option4)} className="toolbar-button">√</button>
          <button onClick={() => insertSymbol('π', setOption4, option4)} className="toolbar-button">π</button>
          <button onClick={() => insertSymbol('∞', setOption4, option4)} className="toolbar-button">∞</button>
          <button onClick={() => insertSymbol('±', setOption4, option4)} className="toolbar-button">±</button>
          <button onClick={() => insertSymbol('²', setOption4, option4)} className="toolbar-button">²</button>
        </div>
        <input type="file" onChange={(e) => setOption4Image(e.target.files[0])} />

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
  );
};

export default QuestionEditor;

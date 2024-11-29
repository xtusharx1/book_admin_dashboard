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
import './QuestionBank.css';

const SymbolButtons = ({ onInsert }) => {
  const symbols = ['√', 'π', '∞', '±', '²'];
  return (
    <div className="symbol-buttons">
      {symbols.map((symbol) => (
        <button key={symbol} onClick={() => onInsert(symbol)} className="toolbar-button">
          {symbol}
        </button>
      ))}
    </div>
  );
};

const ImageUploader = ({ onImageSelect }) => (
  <input type="file" onChange={(e) => onImageSelect(e.target.files[0])} />
);

const OptionInput = ({ label, value, onValueChange, onImageSelect }) => (
  <div className="option-input">
    <label>{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    />
    <SymbolButtons onInsert={(symbol) => onValueChange(value + symbol)} />
    <ImageUploader onImageSelect={onImageSelect} />
  </div>
);

const AddScholarshipQuestions = () => {
  const { scholarshipId } = useParams();
  const [selectedClass, setSelectedClass] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [option3, setOption3] = useState('');
  const [option4, setOption4] = useState('');
  const [correctOption, setCorrectOption] = useState('');
  const [questionImage, setQuestionImage] = useState(null);
  const [option1Image, setOption1Image] = useState(null); // Added state for option 1 image
  const [option2Image, setOption2Image] = useState(null); // Added state for option 2 image
  const [option3Image, setOption3Image] = useState(null); // Added state for option 3 image
  const [option4Image, setOption4Image] = useState(null); // Added state for option 4 image

  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      BulletList,
      OrderedList,
      Placeholder.configure({
        placeholder: 'Enter your question here...',
      }),
    ],
  });

  const uploadImage = async (image) => {
    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await axios.post(
        'http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/scholarship-questions/upload-image',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      return response.data.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleAddQuestion = async () => {
    let questionImageUrl = null;
    if (questionImage) {
      questionImageUrl = await uploadImage(questionImage);
    }

    // Handle option image uploads and build the final content
    const option1Content = await handleOptionImageUpload(option1, option1Image);
    const option2Content = await handleOptionImageUpload(option2, option2Image);
    const option3Content = await handleOptionImageUpload(option3, option3Image);
    const option4Content = await handleOptionImageUpload(option4, option4Image);

    if (!option1Content || !option2Content || !option3Content || !option4Content) {
      alert('Please fill in all options');
      return;
    }

    const questionTextFinal = questionImageUrl
      ? `<img src="${questionImageUrl}" alt="question image" />`
      : editor.getHTML().trim() && editor.getHTML() !== "<p></p>"
      ? editor.getHTML()
      : null;

    if (!questionTextFinal) {
      alert('Please enter a question text or upload an image');
      return;
    }

    const newQuestion = {
      scholarship_id: scholarshipId,
      class: selectedClass,
      question_text: questionTextFinal,
      option1: option1Content,
      option2: option2Content,
      option3: option3Content,
      option4: option4Content,
      correct_option: correctOption,
    };

    try {
      await axios.post(
        'http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/scholarship-questions/scholarship-questions',
        newQuestion
      );
      alert('Question added successfully');
      editor.commands.setContent('<p></p>');
      setOption1('');
      setOption2('');
      setOption3('');
      setOption4('');
      setCorrectOption('');
      setQuestionImage(null);
    } catch (error) {
      console.error('Error adding question:', error);
    }
  };

  const handleOptionImageUpload = async (optionText, optionImage) => {
    let optionTextFinal = optionText;
    if (optionImage) {
      const optionImageUrl = await uploadImage(optionImage);
      if (optionImageUrl) {
        optionTextFinal = `<img src="${optionImageUrl}" alt="option image" /> ${optionText}`;
      }
    }
    return optionTextFinal;
  };

  return (
    <div className="container">
      <h2>Add Scholarship Question</h2>
      <label>Select Class:</label>
<select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
  <option value="">-- Select a Class --</option> 
  <option value="6">Class 6</option>
  <option value="9">Class 9</option>
</select>

      <div className="editor-container">
        <div className="toolbar">
          <button onClick={() => editor.chain().focus().toggleBold().run()} className="toolbar-button">B</button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} className="toolbar-button">I</button>
          <button onClick={() => editor.chain().focus().toggleUnderline().run()} className="toolbar-button">U</button>
          <button onClick={() => editor.chain().focus().toggleBulletList().run()} className="toolbar-button">Bullet</button>
          <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className="toolbar-button">Ordered</button>
          <SymbolButtons onInsert={(symbol) => editor.chain().focus().insertContent(symbol).run()} />
        </div>
        <EditorContent editor={editor} className="editor-content" />
      </div>

      <label>Upload Question Image (optional):</label>
      <ImageUploader onImageSelect={setQuestionImage} />

      <div className="options-container">
        <OptionInput label="Option 1:" value={option1} onValueChange={setOption1} onImageSelect={setOption1Image} />
        <OptionInput label="Option 2:" value={option2} onValueChange={setOption2} onImageSelect={setOption2Image} />
        <OptionInput label="Option 3:" value={option3} onValueChange={setOption3} onImageSelect={setOption3Image} />
        <OptionInput label="Option 4:" value={option4} onValueChange={setOption4} onImageSelect={setOption4Image} />

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

export default AddScholarshipQuestions;

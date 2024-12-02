import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Fuse from 'fuse.js';
import './QuestionOverviewPage.css';
import Like from '../assets/Button/Like.png';
import SearchBar from '../Components/Searchbar';

const QuestionOverviewPage = () => {
  const [questionText, setQuestionText] = useState('');
  const [questions, setQuestions] = useState([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const { project, department, projectId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
 
  const decodedProject = decodeURIComponent(project);
  const decodedDepartment = decodeURIComponent(department);

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:8080/api/questions`);
        
        // Filter questions with the correct projectId
        const filteredQuestions = response.data.filter(question => question.projectId === parseInt(projectId));
        
        const questionsData = filteredQuestions.map(question => ({
          id: question.questionId,
          title: question.questionTitle,
          question: question.questionText,
          status: question.status,
          projectId: question.projectId,
          createdAt: question.createdAt,
          likes: question.likes || 0, // Get the likes count
        }));
        
        setQuestions(questionsData);
        console.log("Questions fetched and filtered for projectId:", projectId);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setError('Failed to fetch questions. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchQuestions();
    }
  }, [projectId]);

  // Set up Fuse.js with options
  const fuse = useMemo(() => {
    const options = {
      keys: ['title', 'question'],
      threshold: 0.3, // Adjust threshold for sensitivity
    };
    return new Fuse(questions, options);
  }, [questions]);

  // Use Fuse.js to get filtered questions
  const filteredQuestions = useMemo(() => {
    if (!searchTerm) {
      return questions;
    } else {
      const results = fuse.search(searchTerm);
      return results.map(result => result.item);
    }
  }, [fuse, searchTerm]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (title && questionText && projectId) {
      try {
        const response = await axios.post(`http://localhost:8080/api/questions`, {
          questionTitle: title,
          questionText: questionText,
          projectId: projectId,
          status: 'Open'
        });
        const newQuestion = {
          id: response.data.questionId,
          title: response.data.questionTitle,
          question: response.data.questionText,
          status: response.data.status,
          projectId: response.data.projectId,
          createdAt: response.data.createdAt,
          likes: 0, // Initialize likes to 0
        };
        setQuestions(prevQuestions => [...prevQuestions, newQuestion]);
        setTitle('');
        setQuestionText('');
      } catch (error) {
        console.error('Error posting question:', error);
        setError('Failed to post question. Please try again.');
      }
    } else {
      setError('Please enter a question and title');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/questions/${id}`);
      setQuestions(questions.filter(question => question.id !== id));
      console.log("Question deleted");
    } catch (error) {
      console.error('Error deleting question:', error);
      setError('Failed to delete question. Please try again.');
    }
  };

  const handleLike = async (questionId) => {
    try {
      const question = questions.find(q => q.id === questionId);
      if (!question) return;

      const updatedLikes = question.likes + 1;

      await axios.patch(`http://localhost:8080/api/questions/${questionId}`, {
        likes: updatedLikes
      });

      setQuestions(prevQuestions =>
        prevQuestions.map(q =>
          q.id === questionId ? { ...q, likes: updatedLikes } : q
        )
      );
    } catch (error) {
      console.error('Error updating likes:', error);
      setError('Failed to update likes. Please try again.');
    }
  };

  return (
    <div>
      <h1 className="question-overview-title">{decodedProject}</h1>
      <h2 className="question-overview-department">{decodedDepartment}</h2>
      <form className="form-question" onSubmit={handleSubmit}>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          type="text"
          placeholder='Enter question title'
          className='input-question-title'
        />
        <textarea
          required
          value={questionText}
          onChange={(event) => setQuestionText(event.target.value)}
          placeholder="Ask a question..."
          className="textarea-question"
        ></textarea>
        <button type="submit">Ask Question</button>
      </form>
      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search questions..."
      />
      {isLoading ? (
        <p>Loading questions...</p>
      ) : (
        <div className="question-overview-container">
          {filteredQuestions.map((question) => (
            <div key={question.id} className='Question-Card-Container'>
              <div className='question-overview-item' >
                <div className='Question-Title-delete-Button-Container'>
                  <h3>{question.title}</h3>
                  <button className='Delete-Button' onClick={(event) => {
                    event.preventDefault();
                    handleDelete(question.id);
                  }}>X</button>
                </div>
                <div className='Question-Likes-Container'>
                  <p>{new Date(question.createdAt).toLocaleString()}</p>
                  <div className='Question-Likes-Button-Container'>
                    <button className='Like-Button' onClick={(event) => {
                      event.preventDefault();
                      handleLike(question.id);
                    }}>
                      <img className='Like-Button' src={Like} alt="Like" />
                    </button>
                    <p>{question.likes}</p>
                  </div>
                </div>
              </div>
              <Link
                to={`/question-detail/${question.id}/${encodeURIComponent(question.title)}/${encodeURIComponent(question.question)}/${encodeURIComponent(question.projectId)}`}
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default QuestionOverviewPage;

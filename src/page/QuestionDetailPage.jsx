// QuestionDetailPage.jsx
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './QuestionDetailPage.css';
import axios from 'axios';
import { useUserContext } from "../context/LoginContext";


const QuestionDetailPage = () => {
  const { questionId, title, question, projectId } = useParams();
  const { userId,  } = useUserContext();

  
  // Decode the encoded URI components
  const decodedTitle = decodeURIComponent(title);
  const decodedQuestion = decodeURIComponent(question);

  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState([]);
  const [loadingAnswers, setLoadingAnswers] = useState(true);
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [userPermission, setUserPermission] = useState([]);
  const[ canAnswerQuestion, setCanAnswerQuestion] = useState()

  // Log userId to ensure it's correct
  console.log('Current User ID:', userId);

  // Fetch User Permissions
  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/permissions`);
        console.log('Fetched Permissions:', response.data);
        setUserPermission(response.data);
      } catch (error) {
        if (error.response) {
          console.error('Error fetching permissions:', error.response.data);
        } else if (error.request) {
          console.error('Error fetching permissions: No response received', error.request);
        } else {
          console.error('Error fetching permissions:', error.message);
        }
        setError('Failed to fetch permissions.');
      } finally {
        setLoadingPermissions(false);
      }
    };

    fetchUserPermissions();
  }, []);

  // Log userPermission whenever it updates
  useEffect(() => {
    console.log('Updated userPermission:', userPermission);
  }, [userPermission]);

  // Fetch Answers
  useEffect(() => {
    const fetchAnswers = async () => {
      setLoadingAnswers(true);
      setError('');
      try {
        const response = await axios.get('http://localhost:8080/api/answers');
        if (Array.isArray(response.data)) {
          // Filter answers by questionId
          const filteredAnswers = response.data.filter(
            (ans) => ans.questionId === parseInt(questionId, 10)
          );
          setAnswers(filteredAnswers);
          console.log('Filtered Answers:', filteredAnswers);
        } else {
          setError('Unexpected response format.');
          console.error('Response is not an array');
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setError('Answers not found.');
        } else {
          setError('Failed to fetch answers.');
        }
        console.error('Error fetching answers:', error);
      } finally {
        setLoadingAnswers(false);
      }
    };

    if (questionId) {
      fetchAnswers();
    } else {
      setError('Invalid question ID.');
      setLoadingAnswers(false);
    }
  }, [questionId]);

  // Handle Submit
  const handleSubmit = async (e) => {
   
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    // Convert userId and projectId to numbers
    const numericUserId = parseInt(userId, 10);
    const projectIdNumber = parseInt(projectId, 10);

    // Validate conversions
    if (isNaN(numericUserId)) {
      console.error('Invalid userId:', userId);
      setSubmitError('Invalid user ID.');
      return;
    }

    if (isNaN(projectIdNumber)) {
      console.error('Invalid projectId:', projectId);
      setSubmitError('Invalid project ID.');
      return;
    }

    // Filter permissions for the current user
    const userPermissions = userPermission.filter(u => u.userId === numericUserId);
    console.log('User Permissions for Current User:', userPermissions);

    // Check if any of the user's permissions match the projectId
    const hasPermission = userPermissions.find(p => p.projectId === projectIdNumber);
    console.log('Has Permission:', hasPermission);
    
   
    // Additional debug: list all userPermissions
    if (userPermissions.length === 0) {
      console.warn('No permissions found for the current user.');
    }

    if (answer.trim() === '') {
      setSubmitError('Answer cannot be empty.');
      return;
    }

    if (!hasPermission.canAnswer) {
      setSubmitError('You do not have permission to submit an answer for this project.');
      return;
    }

    try {
      // Prepare the payload according to AnswerInputDTO
      const payload = {
        answerText: answer,
        questionId: parseInt(questionId, 10), // Ensure questionId is a number
        // userId: numericUserId // Uncomment if your backend expects userId
      };

      const response = await axios.post('http://localhost:8080/api/answers', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Assuming the response contains the created answer
      if (response.data) {
        setAnswers([...answers, response.data]); // Append the new answer to the list
        setSubmitSuccess('Answer submitted successfully!');
      } else {
        setSubmitError('Failed to submit answer.');
      }

      setAnswer('');
    } catch (error) {
      setSubmitError('Error submitting answer.');
      console.error('Error submitting answer:', error);
    }
  };

  // Handle Delete Answer
  const handleDeleteAnswer = async (answerId) => {
    try {
      await axios.delete(`http://localhost:8080/api/answers/${answerId}`);
      setAnswers(answers.filter(answer => answer.answerId !== answerId));
      setSubmitSuccess('Answer deleted successfully!');
    } catch (error) {
      console.error('Error deleting answer:', error);
      setSubmitError('Failed to delete answer. Please try again.');
    }
  };

  return (
    <div className="question-detail-page">
      <div className="question-detail-container">
        <h1 className="question-title">{decodedTitle}</h1>
        <p className="question-content">{decodedQuestion}</p>
      </div>

      <div className="answers-container">
        <h2>Answers</h2>
        {loadingAnswers ? (
          <p>Loading answers...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : answers.length > 0 ? (
          answers.map((answerItem) => (
            <div key={answerItem.answerId} className="answer-item">
              <p>{answerItem.answerText}</p>
              <button 
                className="delete-answer-button" 
                onClick={() => handleDeleteAnswer(answerItem.answerId)}
              >
                Delete Answer
              </button>
            </div>
          ))
        ) : (
          <p>No answers yet. Be the first to answer!</p>
        )}
      </div>

      <form className="question-answer-form" onSubmit={handleSubmit}>
        <h2>Submit Your Answer</h2>
        <textarea
          className="question-answer-input"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Your answer"
          required
        />
        <button
          className="question-answer-submit-button"
          type="submit"
          disabled={loadingPermissions} // Disable until permissions are loaded
        >
          {loadingPermissions ? 'Checking Permissions...' : 'Submit Answer'}
        </button>
        {loadingPermissions && <p>Loading permissions...</p>}
        {submitError && <p className="error-message">{submitError}</p>}
        {submitSuccess && <p className="success-message">{submitSuccess}</p>}
      </form>
    </div>
  );
};

export default QuestionDetailPage;

// QuestionDetailPage.jsx
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './QuestionDetailPage.css';
import axios from 'axios';
import { useUserContext } from "../context/LoginContext";
import TextArea from '../Components/TextArea';
import AnswerList from '../Components/AnswerList';

const QuestionDetailPage = () => {
  const { questionId, title, question, projectId } = useParams();
  const { userId } = useUserContext();

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
  const [canAnswerQuestion, setCanAnswerQuestion] = useState();

  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/permissions`);
        setUserPermission(response.data);
      } catch (error) {
        console.error('Error fetching permissions:', error);
        setError('Failed to fetch permissions.');
      } finally {
        setLoadingPermissions(false);
      }
    };

    fetchUserPermissions();
  }, []);

  useEffect(() => {
    const fetchAnswers = async () => {
      setLoadingAnswers(true);
      setError('');
      try {
        const response = await axios.get('http://localhost:8080/api/answers');
        if (Array.isArray(response.data)) {
          const filteredAnswers = response.data.filter(
            (ans) => ans.questionId === parseInt(questionId, 10)
          );
          setAnswers(filteredAnswers);
        } else {
          setError('Unexpected response format.');
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setError('Answers not found.');
        } else {
          setError('Failed to fetch answers.');
        }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    const numericUserId = parseInt(userId, 10);
    const projectIdNumber = parseInt(projectId, 10);

    if (isNaN(numericUserId)) {
      setSubmitError('Invalid user ID.');
      return;
    }

    if (isNaN(projectIdNumber)) {
      setSubmitError('Invalid project ID.');
      return;
    }

    const userPermissions = userPermission.filter(u => u.userId === numericUserId);
    const hasPermission = userPermissions.find(p => p.projectId === projectIdNumber);

    if (answer.trim() === '') {
      setSubmitError('Answer cannot be empty.');
      return;
    }

    if (!hasPermission || !hasPermission.canAnswer) {
      setSubmitError('You do not have permission to submit an answer for this project.');
      return;
    }

    try {
      const payload = {
        answerText: answer,
        questionId: parseInt(questionId, 10)
      };

      const response = await axios.post('http://localhost:8080/api/answers', payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.data) {
        setAnswers([...answers, response.data]);
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

  const handleDeleteAnswer = async (answerId) => {
    try {
      await axios.delete(`http://localhost:8080/api/answers/${answerId}`);
      setAnswers(answers.filter(ans => ans.answerId !== answerId));
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

      {/* Use the reusable AnswerList component */}
      <AnswerList 
        answers={answers} 
        loadingAnswers={loadingAnswers} 
        error={error} 
        handleDeleteAnswer={handleDeleteAnswer} 
      />

      <form className="question-answer-form" onSubmit={handleSubmit}>
        <h2>Submit Your Answer</h2>
        <TextArea
          className="question-answer-input"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Your answer"
          required
        />
        <button
          className="question-answer-submit-button"
          type="submit"
          disabled={loadingPermissions}
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

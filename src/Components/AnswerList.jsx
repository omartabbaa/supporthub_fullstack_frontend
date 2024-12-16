import React from 'react';

const AnswerList = ({ answers, loadingAnswers, error, handleDeleteAnswer }) => {
  if (loadingAnswers) {
    return <p>Loading answers...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (answers.length === 0) {
    return <p>No answers yet. Be the first to answer!</p>;
  }

  return (
    <div className="answers-container">
      <h2>Answers</h2>
      {answers.map((answerItem) => (
        <div key={answerItem.answerId} className="answer-item">
          <p>{answerItem.answerText}</p>
          <button 
            className="delete-answer-button" 
            onClick={() => handleDeleteAnswer(answerItem.answerId)}
          >
            Delete Answer
          </button>
        </div>
      ))}
    </div>
  );
};

export default AnswerList;

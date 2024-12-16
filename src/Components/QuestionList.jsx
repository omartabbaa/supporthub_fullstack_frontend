// QuestionList.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Like from '../assets/Button/Like.png';

const QuestionList = ({ questions, onDelete, onLike }) => {
  return (
    <div className="question-overview-container">
      {questions.map((question) => (
        <div key={question.id} className='Question-Card-Container'>
          <div className='question-overview-item' >
            <div className='Question-Title-delete-Button-Container'>
              <h3>{question.title}</h3>
              <button 
                className='Delete-Button' 
                onClick={(event) => {
                  event.preventDefault();
                  onDelete(question.id);
                }}
              >
                X
              </button>
            </div>
            <div className='Question-Likes-Container'>
            {/*     
              <p>{new Date(question.createdAt).toLocaleString()}</p>
               */}
        <div className='Question-Likes-Button-Container'>
                {/*      <button 
                  className='Like-Button' 
                  onClick={(event) => {
                    event.preventDefault();
                    onLike(question.id);
                  }}
                >
                  <img className='Like-Button' src={Like} alt="Like" />
                </button>  <p>{question.likes}</p>*/}
           
                
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
  );
};

export default QuestionList;

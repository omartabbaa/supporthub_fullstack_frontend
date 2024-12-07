import React from 'react';
import { Link } from 'react-router-dom';

const BusinessList = ({ businesses }) => {
  return (
    <>
      {businesses && businesses.length > 0 ? (
        businesses.map((business) => (
          <Link 
            to={`/department-project-management/${business.businessId}/${business.name}`} 
            key={business.businessId}
          >
            <div className="BusinessCard">
              <div className="image">
                {/* Placeholder for business image or logo */}
              </div>
              <div className="textContainer">
                <div className="Title">{business.name}</div>
                <div className="texting">{business.description}</div>
              </div>
            </div>
          </Link>
        ))
      ) : (
        <p>No businesses found matching your search.</p>
      )}
    </>
  );
};

export default BusinessList;

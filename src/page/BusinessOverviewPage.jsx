// MapComponent.js

import "./MapComponent.css";
import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Fuse from 'fuse.js'; // Import Fuse.js

const MapComponent = () => {
  const [businesses, setBusinesses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);

  useEffect(() => {
    console.log("Attempting to fetch businesses...");
    axios.get('http://localhost:8080/api/businesses')
      .then(response => {
        console.log("Businesses fetched successfully:", response.data);
        setBusinesses(response.data);
      })
      .catch(error => {
        console.error('Error fetching businesses:', error);
      });
  }, []);


  // Set up Fuse.js with options
  const fuse = useMemo(() => {
    const options = {
      keys: ['name', 'description'], // Fields to search in
      threshold: 0.3,                // Adjust threshold for sensitivity (0.0 = exact match, 1.0 = match anything)
      includeScore: true,            
    };
    return new Fuse(businesses, options);
  }, [businesses]);

 
  useEffect(() => {
    if (!searchQuery) {
      setFilteredBusinesses(businesses);
    } else {
      const results = fuse.search(searchQuery);
      setFilteredBusinesses(results.map(result => result.item));
    }
  }, [searchQuery, fuse, businesses]);

  return (
    <div className="mapContainer">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search businesses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {filteredBusinesses.length > 0 ? (
        filteredBusinesses.map((business) => (
          <Link 
            to={`/department-project-management/${business.businessId}/${business.name}`} 
            key={business.businessId}
          >
            <div className="BusinessCard">
              <div className="image">
      
              </div>
              <div className="textContainer">
                <div className="Title">{business.name}</div>
                <div className="texting">test</div>
              </div>
            </div>
          </Link>
        ))
      ) : (
        <p>No businesses found matching your search.</p>
      )}
    </div>
  );
};

export default MapComponent;

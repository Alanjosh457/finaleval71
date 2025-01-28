import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getOriginalUrl } from './services'; // Import the service function

const RedirectHandler = () => {
  const { shortenedKey } = useParams();

  useEffect(() => {
    // Log the shortenedKey
    console.log('Shortened key:', shortenedKey);

    const fetchOriginalUrl = async () => {
      try {
        const data = await getOriginalUrl(shortenedKey); 
        // Call the service to get the original URL
        if (data && data.originalUrl) {
          window.location.href = data.originalUrl; // Redirect to the original URL
        } else {
          console.error('Original URL not found');
          alert('The shortened URL is invalid or has expired.');
        }
      } catch (error) {
        console.error('Error fetching original URL:', error);
        alert('The shortened URL is invalid or has expired.');
      }
    };

    fetchOriginalUrl();
  }, [shortenedKey]);

  return <p>Redirecting...</p>;
};

export default RedirectHandler;

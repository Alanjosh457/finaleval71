import React, { useState, useEffect } from 'react';
import styles from './analytics.module.css'; // Reuse the Linkpage styles
import { fetchUrls } from './services';

const Analytics = () => {
  const [urls, setUrls] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 4; // Number of rows per page

  // Fetch URLs on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchUrls();
        const updatedUrls = data.map(url => {
          const currentDate = new Date();
          const expiration = new Date(url.expirationDate);
          url.status = expiration < currentDate ? 'inactive' : 'active';
          return url;
        });
        setUrls(updatedUrls);
      } catch (error) {
        console.error('Error fetching URLs:', error);
      }
    };

    fetchData();
  }, []);

  // Handle Pagination
  const totalPages = Math.ceil(urls.length / rowsPerPage);
  const paginatedUrls = urls.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const goToPage = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Format Date
  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    };
    return new Date(dateString)
      .toLocaleDateString('en-US', options)
      .replace(',', '');
  };

  return (
    <div className={styles.analyticsContainer}>
      <h2 className={styles.title}>Analytics</h2>
      <div className={styles.urlTableContainer}>
        <table className={styles.urlTable}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Original Link</th>
              <th>Shortened Link</th>
              <th>IP Addresses</th>
              <th>User OS</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUrls.map((url) => (
              <tr key={url.shortenedKey}>
                <td>{formatDate(url.createdAt)}</td>
                <td className={styles.shortenedText}>{url.originalUrl}</td>
                <td className={styles.shortenedText}>
                  <a
                    href={`${window.location.origin}#/${url.shortenedKey}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.shlimk}
                  >
                    {`${window.location.origin}#/${url.shortenedKey}`}
                  </a>
                </td>
                {/* Display IP Addresses */}
                <td>{url.ipAddresses.join(', ') || 'No IP data'}</td>
                {/* Display User OS */}
                <td>
                  {Object.entries(url.osClicks).map(([os, count]) => (
                    <div key={os}>
                     {count} 
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className={styles.pagination}>
        <button
          className={styles.pageButton}
          disabled={currentPage === 1}
          onClick={() => goToPage(currentPage - 1)}
        >
          &lt;
        </button>
        {currentPage > 2 && (
          <>
            <button
              className={`${styles.pageButton} ${
                currentPage === 1 ? styles.activePage : ''
              }`}
              onClick={() => goToPage(1)}
            >
              1
            </button>
            {currentPage > 3 && <span className={styles.ellipsis}>...</span>}
          </>
        )}
        {currentPage > 1 && (
          <button
            className={styles.pageButton}
            onClick={() => goToPage(currentPage - 1)}
          >
            {currentPage - 1}
          </button>
        )}
        <button className={`${styles.pageButton} ${styles.activePage}`}>
          {currentPage}
        </button>
        {currentPage < totalPages && (
          <button
            className={styles.pageButton}
            onClick={() => goToPage(currentPage + 1)}
          >
            {currentPage + 1}
          </button>
        )}
        {currentPage < totalPages - 1 && (
          <>
            {currentPage < totalPages - 2 && (
              <span className={styles.ellipsis}>...</span>
            )}
            <button
              className={styles.pageButton}
              onClick={() => goToPage(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          className={styles.pageButton}
          disabled={currentPage === totalPages}
          onClick={() => goToPage(currentPage + 1)}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default Analytics;

import React, { useState, useEffect } from 'react';
import styles from './linkpage.module.css';
import { shortenUrl, fetchUrls,searchUrls } from './services';
import { useNavigate,useLocation } from 'react-router-dom';
import penc from './images/pencil.png';
import tbin from './images/tbin.png';
import copyb from './images/copyb.png';
import Dashboard from './Dashboard';


const Linkpage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [destinationUrl, setDestinationUrl] = useState('');
  const [remarks, setRemarks] = useState('');
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [urls, setUrls] = useState([]);
  const [editRemarks, setEditRemarks] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // For pagination
  const rowsPerPage = 4; // Number of rows per 
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();
  const [isExpirationEnabled, setIsExpirationEnabled] = useState(false);


  // Toggle Modals
  const toggleModal = () => setIsModalOpen((prev) => !prev);
  const toggleEditModal = () => setIsEditModalOpen((prev) => !prev);
  const toggleDeleteModal = () => setIsDeleteModalOpen((prev) => !prev);
 
 
  const toggleExpiration = () => {
    setIsExpirationEnabled((prev) => !prev);
    
    if (!isExpirationEnabled) {
      setExpirationDate(''); // Clear expiration date if the toggle is disabled
    }
  };

  
 
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const queryFromURL = queryParams.get('search');


  const [expirationDate, setExpirationDate] = useState('');
  // Fetch URLs on mount


  useEffect(() => {
    const savedUrls = JSON.parse(localStorage.getItem('urls'));
  
    if (savedUrls && savedUrls.length > 0) {
      // If URLs are saved in localStorage, use them
      setUrls(savedUrls);
    } else {
      // If no URLs in localStorage, fetch from the API
      const fetchData = async () => {
        try {
          const data = await fetchUrls();
          const updatedUrls = data.map((url) => {
            const currentDate = new Date();
            const expiration = new Date(url.expirationDate);
  
            // Set status to inactive if expired, otherwise active
            url.status = expiration < currentDate ? 'inactive' : 'active';
            return url;
          });
          setUrls(updatedUrls);
          localStorage.setItem('urls', JSON.stringify(updatedUrls)); // Persist the fetched data to localStorage
        } catch (error) {
          console.error('Error fetching URLs:', error);
        }
      };
  
      fetchData();
    }
  }, []);
  

  useEffect(() => {
    if (urls.length > 0) {
      localStorage.setItem('urls', JSON.stringify(urls)); // Persist updated URLs to localStorage
    }
  }, [urls]); // This runs every time `urls` state changes
  

  // Save URLs to localStorage whenever the `urls` state changes

  const filteredUrls = urls.filter((url) =>
    url.remarks.toLowerCase().includes(searchQuery.toLowerCase())
  );


  useEffect(() => {
    if (queryFromURL) {
      setSearchQuery(queryFromURL);
    }
  }, [location]); 

  
  // Handle Pagination
  const totalPages = Math.ceil(urls.length / rowsPerPage);
  const paginatedUrls = filteredUrls.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const goToPage = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  
  const handleEditClick = (url) => {
    setSelectedUrl(url);
    setDestinationUrl(url.originalUrl);  // Prefill the destination URL field
    setEditRemarks(url.remarks);          // Prefill the remarks field
    
    // Set expiration date and toggle expiration based on the selected URL
    if (url.expirationDate) {
      setExpirationDate(url.expirationDate); // Prefill expiration date if exists
      setIsExpirationEnabled(true);           // Enable expiration toggle if it has expiration
    } else {
      setExpirationDate('');                  // Clear expiration date if it does not have expiration
      setIsExpirationEnabled(false);          // Disable expiration toggle
    }
  
    toggleEditModal();  // Open the edit modal
  };
  

  const handleSaveEdits = () => {
    if (destinationUrl !== selectedUrl.originalUrl || editRemarks !== selectedUrl.remarks || expirationDate !== selectedUrl.expirationDate) {
      const updatedUrls = urls.map((url) =>
        url.shortenedKey === selectedUrl.shortenedKey
          ? {
              ...url,
              remarks: editRemarks,
              originalUrl: destinationUrl,
              expirationDate: isExpirationEnabled ? expirationDate : null, // Update expiration date only if enabled
              status: isExpirationEnabled && new Date(expirationDate) < new Date() ? 'inactive' : 'active', // Update status based on expiration date
            }
          : url
      );
      setUrls(updatedUrls); // Update the state with the new URLs
      localStorage.setItem('urls', JSON.stringify(updatedUrls)); // Persist updated URLs to localStorage
      toggleEditModal(); // Close the edit modal
    }
  };
  

  const handleCreateLink = async () => {
    try {
      const urlPattern = /^(https?:\/\/)[^\s$.?#].[^\s]*$/;
      if (!urlPattern.test(destinationUrl)) {
        alert('Please enter a valid URL starting with http:// or https://');
        return;
      }
      const data = { originalUrl: destinationUrl, remarks, expirationDate: isExpirationEnabled ? expirationDate : null };
      const result = await shortenUrl(data);
      const newShortenedUrl = result.shortenedUrl;
      const shortenedKey = newShortenedUrl.split('/').pop();
      
      const newUrl = {
        originalUrl: destinationUrl,
        shortenedKey,
        shortenedUrl: newShortenedUrl,
        remarks,
        clickCount: 0,
        status: isExpirationEnabled && new Date(expirationDate) < new Date() ? 'inactive' : 'active', // Set status based on expiration date
        createdAt: new Date().toISOString(),
        expirationDate: expirationDate,
      };
  
      setUrls((prevUrls) => [...prevUrls, newUrl]);
      localStorage.setItem('urls', JSON.stringify([...urls, newUrl])); // Persist new URL to localStorage
      toggleModal(); // Close the modal after creating the link
    } catch (error) {
      console.error('Error creating link:', error);
    }
  };
  

  
  const confirmDelete = () => {
    // Filter out the URL to be deleted from the list
    const updatedUrls = urls.filter((url) => url.shortenedKey !== selectedUrl.shortenedKey);
    
    // Update the state with the new URLs
    setUrls(updatedUrls);
    
    // Persist the updated list to localStorage
    localStorage.setItem('urls', JSON.stringify(updatedUrls));
    
    // Close the delete modal
    toggleDeleteModal();
  };
  
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

  const handleDeleteClick = (url) => {
    setSelectedUrl(url);
    toggleDeleteModal(); // Open the delete confirmation modal
  };

  
  const clearForm = () => {
    setDestinationUrl('');
    setRemarks('');
    setIsExpirationEnabled(false);
    setExpirationDate('');
  };

  useEffect(() => {
    // Check if the modal state is passed via location state
    if (location.state?.isModalOpen) {
      setIsModalOpen(true); // Open modal immediately
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('urls'); // Clear stored URLs
    navigate('/'); // Redirect to login page
  };
  return (
    <>
      <button className={styles.linkerssss} onClick={handleLogout}>
      logout
      </button>
      <input
        type="text"
        className={styles.searchInput}
        placeholder="Search by remarks"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {/* Create Modal */}
      {isModalOpen && (
  <div className={styles.modal}>
    <div className={styles.modalContent}>
      <div className={styles.modalHeader}>
        < h2 className={styles.newh}>New Link</h2>
        <button className={styles.closeButton} onClick={toggleModal}>
          &times;
        </button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreateLink();
        }}
      >
        <div className={styles.formGroup}>
          <label htmlFor="destinationUrl">Destination URL <span className={styles.spns}>*</span></label>
          <input
            type="url"
            id="destinationUrl"
            value={destinationUrl}
            onChange={(e) => setDestinationUrl(e.target.value)}
            required
            placeholder="https://web.whatsapp.com/"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="remarks">Remarks <span className={styles.spns}>*</span></label>
          <textarea
            id="remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            required
            placeholder="Add remarks"
          />
        </div>
        <div className={styles.formGroup}>
 
  <div className={styles.toggleContainer}>
    {/* Toggle switch */}
    <label className={styles.switch}>
      <input
        type="checkbox"
        id="linkExpirationToggle"
        checked={isExpirationEnabled}
        onChange={toggleExpiration}
      />
      <span className={styles.slider}></span>
    </label>
  </div>
  <div className={styles.le}>Link Expiration</div>
  {isExpirationEnabled && (
    <input
      type="datetime-local"
      id="linkExpirationDate"
      value={expirationDate}
      onChange={(e) => setExpirationDate(e.target.value)}
    />
  )}
</div>

        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.clearButton}
            onClick={clearForm}
          >
            Clear
          </button>
          <button type="submit" className={styles.createButton}>
            Create new
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      {/* Edit Modal */}
    {/* Edit Modal */}
{isEditModalOpen && (
  <div className={styles.modal}>
    <div className={styles.modalContent}>
      <div className={styles.modalHeader}>
        <h2 className={styles.newh}>Edit Link</h2>
        <button className={styles.closeButton} onClick={toggleEditModal}>
          &times;
        </button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSaveEdits();
        }}
      >
        <div className={styles.formGroup}>
          <label htmlFor="destinationUrl">Destination URL <span className={styles.spns}>*</span></label>
          <input
            type="url"
            id="destinationUrl"
            value={destinationUrl}
            onChange={(e) => setDestinationUrl(e.target.value)}
            required
            placeholder="https://web.whatsapp.com/"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="remarks">Remarks <span className={styles.spns}>*</span></label>
          <textarea
            id="remarks"
            value={editRemarks}
            onChange={(e) => setEditRemarks(e.target.value)}
            required
            placeholder="Add remarks"
          />
        </div>
        <div className={styles.formGroup}>
          <div className={styles.toggleContainer}>
            {/* Toggle switch */}
            <label className={styles.switch}>
              <input
                type="checkbox"
                id="linkExpirationToggle"
                checked={isExpirationEnabled}
                onChange={toggleExpiration}
              />
              <span className={styles.slider}></span>
            </label>
          </div>
          <div className={styles.le}>Link Expiration</div>
          {isExpirationEnabled && (
            <input
              type="datetime-local"
              id="linkExpirationDate"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
            />
          )}
        </div>

        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.clearButton}
            onClick={clearForm}
          >
            Clear
          </button>
          <button type="submit" className={styles.createButton}>
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
)}


      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent2}>
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete this link?</p>
            <button onClick={confirmDelete}>YES</button>
            <button onClick={toggleDeleteModal}>NO</button>
          </div>
        </div>
      )}

      {/* URLs Table */}
      <div className={styles.urlTableContainer}>
        <table className={styles.urlTable}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Original Link</th>
              <th>Shortened Link</th>
              <th>Remarks</th>
              <th>Clicks</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUrls.map((url) => (
              <tr key={url.shortenedKey}>
                <td>{formatDate(url.createdAt)}</td>
                <td className={styles.shortenedText}>{url.originalUrl}</td>
                <td className={styles.shortenedText2}>
                  <a
                    href={`${window.location.origin}#/${url.shortenedKey}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.shlimk}
                  >
                    {`${window.location.origin}#/${url.shortenedKey}`}
                  </a>

                  <button
  className={styles.copyButton}
  onClick={() => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}#/${url.shortenedKey}`)
        .then(() => {
          alert('Link copied to clipboard!');
        })
        .catch((err) => {
          console.error('Failed to copy: ', err);
          alert('Failed to copy link. Please try again.');
        });
    } else {
      alert('Clipboard API is not supported in your browser.');
    }
  }}
>
  <img src={copyb} className={styles.copyb2} />
</button>
                </td>
                <td className={styles.shortenedText}>{url.remarks}</td>
                <td className={styles.cc1}>{url.clickCount}</td>
                <td className={url.status === 'active' ? styles.activeStatus : styles.inactiveStatus}>
                  {url.status}</td>
                <td>
                  <button
                    className={styles.editButton}
                    onClick={() => handleEditClick(url)}
                  >
                    <img src={penc} alt="Edit" className={styles.penc2}/>
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeleteClick(url)}
                  >
                    <img src={tbin} alt="Delete" />
                  </button>
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
      
  
      
    </>
  );
};

export default Linkpage;
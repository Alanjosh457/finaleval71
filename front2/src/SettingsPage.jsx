import React, { useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { updateUser, deleteAccount } from './services'; // Add deleteUser function
import { UserContext } from './UserContext';
import styles from './settings.module.css';
import logout from './images/logout22.png';
import jwt_decode from 'jwt-decode'; // Import jwt-decode to decode the token

const SettingsPage = () => {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate(); // Initialize useNavigate hook

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(localStorage.getItem('phone') || '');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // State for modal visibility

  console.log(localStorage.getItem('phone')); // Set phone from localStorage

  const openDeleteModal = () => setIsDeleteModalOpen(true);
  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  // Prefill the form with user data from the token
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log("Token in Settings:", token);
    if (token) {
      try {
        const decoded = jwt_decode(token); // Decode the token to get user data
        console.log('See if phone is here', decoded);
        setName(decoded.name || ''); // Prefill name
        setEmail(decoded.email || ''); // Prefill email
        // Note: phone is handled separately from localStorage, so don't overwrite here
      } catch (error) {
        console.error("Token decoding error:", error);
        toast.error("Invalid token. Please log in again.");
        localStorage.clear();
        setUser(null);
        navigate("/login");
      }
    } else {
      toast.error("No token found. Please log in.");
      navigate("/login");
    }
  }, [setUser, navigate]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    // Validation checks
    if (!name && !email && !phone) {
      toast.error('Please fill in at least one field to update.');
      return;
    }

    if (email && !validateEmail(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in first.');
      return;
    }

    try {
      const response = await updateUser(
        { name, email, phone },
        token
      );

      toast.success(response.message || 'Settings updated successfully!');
      const updatedUser = { name, email, phone };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser)); // Persist updates
      localStorage.setItem('phone', phone); // Persist phone number separately in localStorage
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'An error occurred. Please try again.');
    }
  };

  // Handle logout functionality
  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate('/'); // Redirect to homepage or login page
  };

  // Handle delete account functionality
  const handleDeleteAccount = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in first.');
      return;
    }

    try {
      const response = await deleteAccount(token); // Call deleteUser service
      toast.success(response.message || 'Account deleted successfully!');
      localStorage.clear(); // Clear local storage
      setUser(null); // Clear user context
      navigate('/'); // Redirect to login page
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to delete account. Please try again.');
    }
  };

  return (
    <>
    
      <div className={styles.container}>
        <h2>Settings</h2>
        <form onSubmit={handleUpdate} className={styles.form}>
          <div className={styles.inputGroup}>
       <p className={styles.lbls1}> Name  </p>  <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your new name"
            />
          </div>
          <div className={styles.inputGroup}>
          <p className={styles.lbls1}> Email id </p> <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your new email"
            />
          </div>
          <div className={styles.inputGroup}>
          <p className={styles.lbls1}> Mobile no.  </p><input
              type="text"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your new phone number"
            />
          </div>

          <button type="submit" className={styles.updateButton}>
            Save Changes
          </button>
        </form>

        {/* Logout Button */}
        <div className={styles.loggers}>
          <img
            src={logout}
            alt="Logout"
            className={styles.logoutImage}
            onClick={handleLogout}
          />
        </div>

        {/* Delete Account Button */}
        <div className={styles.delers}>
          <button
            className={styles.deleteButton}
            onClick={openDeleteModal} // Open the modal on click
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Are you sure you want to delete your account?</h3>
        
            <button
              className={styles.confirmDeleteButton}
              onClick={handleDeleteAccount}
            >
              YES
            </button>
            <button
              className={styles.cancelDeleteButton}
              onClick={closeDeleteModal} // Close the modal if cancel is clicked
            >
      NO
            </button>
          </div>
        </div>
      )}

   
    </>
  );
};

export default SettingsPage;

import React, { useContext, useEffect, useState } from 'react'; 
import { NavLink, useLocation, useNavigate } from 'react-router-dom'; 
import styles from './navbar.module.css'; 
import cul1 from './images/cu.png'
import dasher from './images/dashi.png'
import linkc from './images/linki.png'
import alyi1 from './images/alyi.png'
import seti1 from './images/seti.png'
import sii from './images/sii.png'
import sun from './images/sun.png'
import { UserContext } from './UserContext';
import jwtDecode from 'jwt-decode';

const Navbar = () => {
  const location = useLocation();
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate(); // Initialize useNavigate

  const [greeting, setGreeting] = useState('Good morning');
  const [currentDate, setCurrentDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false); // State for dropdown visibility
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to access this feature.');
        return;
      }

      try {
        const decoded = jwtDecode(token);
        setUser({ name: decoded.name, email: decoded.email, _id: decoded._id });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    // Dynamic greeting and date
    const updateGreetingAndDate = () => {
      const now = new Date();
      const hours = now.getHours();

      // Determine greeting based on the time
      if (hours >= 0 && hours < 12) {
        setGreeting('Good morning');
      } else if (hours >= 12 && hours < 16) {
        setGreeting('Good afternoon');
      } else {
        setGreeting('Good evening');
      }

      // Format date (e.g., Tue, Jan 23, 2025)
      const options = { weekday: 'short', month: 'short', day: 'numeric' };
      const formattedDate = now.toLocaleDateString('en-US', options);
      setCurrentDate(formattedDate);
    };

    updateGreetingAndDate();
  }, [setUser]);

  // Function to get initials from user's name
  const getInitials = (name) => {
    if (!name) return '';
    const nameParts = name.trim().split(' ');

    if (nameParts.length === 1) {
      // Single name, take the first two letters
      return nameParts[0].slice(0, 2).toUpperCase();
    }

    // First and last name initials
    return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
  };

  const userInitials = getInitials(user.name);

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Update the URL with the search query for the Linkpage
    navigate(`/link/${user._id}?search=${query}`);
  };

  const handleCreateNewClick = () => {
    console.log('Create New button clicked!'); 
    navigate(`/link/${user._id}/`, { state: { isModalOpen: true } }); // Navigate to /link and pass modal state
  };


  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <>
      <img src={cul1} className={styles.cul2} />
      <nav className={styles.navbar}>
        <ul className={styles.navLinks}>
          <li>
            <NavLink
              to={'/dash'}
              className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
            >
              <img src={dasher} className={styles.dasher3} /> Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`/link/${user._id}/`}
              className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
            >
              <img src={linkc} className={styles.dasher3} /> Links
            </NavLink>
          </li>
          <li>
            <NavLink
              to={'/aly'}
              className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
            >
              <img src={alyi1} className={styles.dasher3} /> Analytics
            </NavLink>
          </li>
          <li className={styles.setter}>
            <NavLink
              to={'/settings'}
              className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
            >
              <img src={seti1} className={styles.setti2} /> Settings
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Navbar 2 */}
      <nav className={styles.navbar2}>
        <ul className={styles.navLinks2}>
          <li className={styles.usersy}>
            <img src={sun} className={styles.sun1} />
            {greeting}, {user.name ? `${user.name}` : 'Guest'}
            <br />
            <span className={styles.date}>{currentDate}</span>
          </li>
          <li>
            <button className={styles.newcre}  onClick={ handleCreateNewClick}>Create new</button>
          </li>
          <li>
            <input
              type="text"
              className={styles.srch}
              placeholder="Search by remarks"
              style={{
                background: `url(${sii}) no-repeat right 10px center`,
                backgroundSize: '20px',
              }}
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </li>
          <li
            className={styles.uci}
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <div className={styles.userCircle}>{userInitials}</div>

            {showDropdown && (
              <div className={styles.dropdownMenu}>
                <button className={styles.logoutButton} onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </li>
        </ul>
      </nav>
    </>
  );
};

export default Navbar;

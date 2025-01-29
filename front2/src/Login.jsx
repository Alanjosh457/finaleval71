import React, { useState } from 'react';
import styles from "./login.module.css";
import { login } from './services';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import sky1 from './images/sky.png'
import cu1 from './images/cu.png'


const Login = () => {

 const [selectedButton, setSelectedButton] = useState(null);

  const handleButtonClick = (button,path) => {
    setSelectedButton(button);
    navigate(path);
  };

  const [formData, setFormData] = useState({
    email: '',
    
    password: '',
   
  });

  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({
    email: null,

    password: null,
  });

  const navigate = useNavigate();

  const handleBackNavigation=()=>{
    navigate(-1)
  }

  const logger = () => {
    navigate('/register');
  };

  const validateField = (field, value) => {
    switch (field) {
      case 'email':
        if (!value || !value.includes('@') || !value.includes('.')) {
          return 'Email is invalid';
        }
        break;
    
      case 'password':
        if (!value) {
          return 'Password is required';
        }
        break;
     
      default:
        break;
    }
    return null;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));

    // Validate and update errors for the changed field
    const error = validateField(id, value);
    setFormErrors((prevErrors) => ({ ...prevErrors, [id]: error }));
  };

  const handleClick = async (e) => {
    e.preventDefault();

    let errorsExist = false;
    const newErrors = {};

    // Validate all fields
    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        errorsExist = true;
      }
    });

    setFormErrors(newErrors);

    // Stop submission if there are errors
    if (errorsExist) return;

    // Submit Data
    try {
      setLoading(true);
      const response = await login(formData);
      toast.success(response.message);

      if (response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem('username', response.username);
       
        const decoded = jwtDecode(response.token);
        const userId = decoded._id;
        

        
        navigate(`/link/${userId}`);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const ploy= 'http://res.cloudinary.com/dgkcgjcw5/image/upload/v1734767584/ykolh3no0ivxqcmbq4pc.png'
  const ec1='http://res.cloudinary.com/dgkcgjcw5/image/upload/v1734767176/roxkkw7grqhih6kcrkft.png'
  const ec2='http://res.cloudinary.com/dgkcgjcw5/image/upload/v1734767194/ndewihg0hapkrfrzfnfj.png'
  const arr='http://res.cloudinary.com/dgkcgjcw5/image/upload/v1734767230/qs1gcvgaith7sjyzdfpj.png'
  const gi='http://res.cloudinary.com/dgkcgjcw5/image/upload/v1734767401/va2rrv1gxdbsdr3fsamg.png'
 
  return (
    <>
    
           <center>
         
          <form className={styles.form} onSubmit={handleClick}>
            <div className={styles.forms}>
             
    
              <div className={styles.field}>
               
                <input
                  id="email"
                  value={formData.email}
                  type="text"
                  placeholder="Email id"
                  onChange={handleChange}
                  className={styles.namer}
                />
                {formErrors.email && <p className={styles.error}>*{formErrors.email}</p>}
              </div>
    
             
              <div className={styles.field}>
               
                <input
                  id="password"
                  value={formData.password}
                  type="password"
                  placeholder="Password"
                  onChange={handleChange}
                  className={styles.namer}
                />
                {formErrors.password && <p className={styles.error}>*{formErrors.password}</p>}
              </div>
    
              
            </div>
            <div className={styles.bns}>
              <button disabled={loading} type="submit" className={styles.regger}>
                {loading ? 'Loading...' : 'Register'}
              </button>
            
              <div className={styles.alr}>
Don't have an account?                <button className={styles.link} onClick={logger}  >
            SignUp
                </button>
              </div>
            </div>
          </form>
        </center>
    
    
        <div><img src={sky1} className={styles.skyy} /></div>
     
    
    
    
      
          <div className={styles.smj3}>Login</div>
          
      <div className={styles.cu2}><img src={cu1} className={styles.cu3}/></div> 
      <div className={styles.logres}>
            <button
              className={`${styles.regi} ${selectedButton === 'regi' ? styles.selected : ''}`}
              onClick={() => handleButtonClick('regi','/register')}
            >
              SignUp
            </button>
            <button
              className={`${styles.logi} ${selectedButton === 'logi' ? styles.selected : ''}`}
              onClick={() => handleButtonClick('logi', '/')}
            >
              Login
            </button>
          </div>
        </>
      
 
  );
}

export default Login;

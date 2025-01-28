import React, { useState } from 'react';
import styles from './register.module.css';
import { register } from './services';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import sky1 from './images/sky.png'
import cu1 from './images/cu.png'

const Register = () => {

  const [selectedButton, setSelectedButton] = useState(null);

  const handleButtonClick = (button,path) => {
    setSelectedButton(button);

    navigate(path);
  };

  
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone:'',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({
    email: null,
    name: null,
    phone:null,
    password: null,
    confirmPassword: null,
  });

  const navigate = useNavigate();

  const handleBackNavigation=()=>{
    navigate(-1)
  }

  const logger = () => {
    navigate('/login');
  };

  const validateField = (field, value) => {
    switch (field) {
      case 'email':
        if (!value || !value.includes('@') || !value.includes('.')) {
          return 'Email is invalid';
        }
        break;
      case 'name':
        if (!value) {
          return 'Name is required';
        }
        break;
        case 'phone':
          if (!value) {
            return 'Phone number is required';
          }
          break;
      case 'password':
        if (!value) {
          return 'Password is required';
        }
        break;
      case 'confirmPassword':
        if (value !== formData.password) {
          return 'Passwords do not match';
        } else if (!value) {
          return 'Confirm Password is required';
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
    try {
      setLoading(true);
      const response = await register(formData);
      console.log('Registering with:', formData); 
      console.log("Register response:", response); // Debug response

      if (response && response.message === "User created successfully") {
        toast.success("User registered successfully");
        localStorage.setItem("username", formData.name);
        localStorage.setItem("phone", formData.phone);
       console.log('phone number',phone)
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        toast.error(response.message || "Registration failed.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Registration failed.");
    } finally {
      setLoading(false);
    }
  
   }
    

  const ploy= 'http://res.cloudinary.com/dgkcgjcw5/image/upload/v1734767584/ykolh3no0ivxqcmbq4pc.png'
  const ec1='http://res.cloudinary.com/dgkcgjcw5/image/upload/v1734767176/roxkkw7grqhih6kcrkft.png'
  const ec2='http://res.cloudinary.com/dgkcgjcw5/image/upload/v1734767194/ndewihg0hapkrfrzfnfj.png'
  const arr='http://res.cloudinary.com/dgkcgjcw5/image/upload/v1734767230/qs1gcvgaith7sjyzdfpj.png'
  const gi='http://res.cloudinary.com/dgkcgjcw5/image/upload/v1734767401/va2rrv1gxdbsdr3fsamg.png'
  return (
    <>
    <div className={styles.arr2} onClick={handleBackNavigation}>
  <img src={arr} className={styles.ar} alt="Decorative Arrow" onClick={handleBackNavigation}/>
      </div>
       <center>
     
      <form className={styles.form} onSubmit={handleClick}>
        <div className={styles.forms}>
          <div className={styles.field}>
         
            <input
              id="name"
              value={formData.name}
              type="text"
              placeholder="Name"
              onChange={handleChange}
            />
            {formErrors.name && <p className={styles.error}>{formErrors.name}</p>}
          </div>

          <div className={styles.field}>
           
            <input
              id="email"
              value={formData.email}
              type="text"
              placeholder="Email id"
              onChange={handleChange}
            />
            {formErrors.email && <p className={styles.error}>{formErrors.email}</p>}
          </div>

          <div className={styles.field}>

          <input
              id="phone"
              value={formData.phone}
              type="text"
              placeholder="Mobile no."
              onChange={handleChange}
            />
            {formErrors.phone && <p className={styles.error}>{formErrors.phone}</p>}
          </div>

          <div className={styles.field}>
           
            <input
              id="password"
              value={formData.password}
              type="password"
              placeholder="Password"
              onChange={handleChange}
            />
            {formErrors.password && <p className={styles.error}>{formErrors.password}</p>}
          </div>

          <div className={styles.field}>
           
            <input
              id="confirmPassword"
              value={formData.confirmPassword}
              type="password"
              placeholder="Confirm Password"
              onChange={handleChange}
            />
            {formErrors.confirmPassword && (
              <p className={styles.error}>{formErrors.confirmPassword}</p>
            )}
          </div>
        </div>
        <div className={styles.bns}>
          <button disabled={loading} type="submit">
            {loading ? 'Loading...' : 'Register'}
          </button>
        
          <div className={styles.alr}>
            Already have an account?
            <button className={styles.link} onClick={logger}>
             Sign up
            </button>
          </div>
        </div>
      </form>
    </center>


    <div><img src={sky1} className={styles.skyy} /></div>
    <div className={styles.jms}>   <h1 className={styles.tdy1}>Join us Today!</h1></div>

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
};

export default Register;

import React, { useEffect, useState } from "react";
import './LogIn.css'
import screenshot1 from "../images/screenshots/screenshot1.jpg";
import screenshot2 from "../images/screenshots/screenshot2.jpg";
import screenshot3 from "../images/screenshots/screenshot3.jpg";
import screenshot4 from "../images/screenshots/screenshot4.jpg";
import screenshot5 from "../images/screenshots/screenshot5.jpg";
import { Link } from "react-router-dom";
import firebaseApp from "../Firebase";
import { AuthErrorCodes, getAuth, signInWithEmailAndPassword } from "firebase/auth";

const auth = getAuth(firebaseApp);

const LogIn = () => {
  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [logInDisabled, setLogInDisabled] = useState(true);
  const [passwordHidden, setPasswordHidden] = useState(true);
  const [showError, setShowError] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [currentSlide, setCurrentSlide] = useState(1);
  const [screenshot1Class, setScreenshot1Class] = useState(['screenshot-image']);
  const [screenshot2Class, setScreenshot2Class] = useState(['screenshot-image']);
  const [screenshot3Class, setScreenshot3Class] = useState(['screenshot-image']);
  const [screenshot4Class, setScreenshot4Class] = useState(['screenshot-image']);
  const [screenshot5Class, setScreenshot5Class] = useState(['screenshot-image']);

  const loginEmailPassword = async (event) => {
    event.preventDefault();
    const loginEmail = emailValue;
    const loginPassword = passwordValue;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      console.log(userCredential.user);      
    }
    catch(error) {
      console.log(error);
      showLoginError(error)
    }
  }

  const showLoginError = (error) => {
    setShowError(true);
    if (error.code === AuthErrorCodes.INVALID_PASSWORD) {
      setErrorText('Sorry, your password or username was incorrect. Please double check your password/username.')
    }
  }

  const emailHandler = (event) => {
    const { value } = event.target;
    setEmailValue(value);
  };

  const passwordHandler = (event) => {
    const { value } = event.target;
    setPasswordValue(value);
  };

  useEffect(() => {
    (passwordValue.length > 5 && emailValue !== '') ? setLogInDisabled(false) : setLogInDisabled(true);
  }, [emailValue, passwordValue]);

  const togglePasswordVisability = (event) => {
    event.preventDefault();
    passwordHidden ? setPasswordHidden(false) : setPasswordHidden(true);
  }

  useEffect(() => {
    if (currentSlide === 1) {
      setScreenshot5Class(['screenshot-image', 'last-image']);
      setScreenshot1Class(['screenshot-image', 'current-image']);
      setScreenshot4Class(['screenshot-image']);
    }
    if (currentSlide === 2) {
      setScreenshot1Class(['screenshot-image', 'last-image']);
      setScreenshot2Class(['screenshot-image', 'current-image']);
      setScreenshot5Class(['screenshot-image']);
    }
    if (currentSlide === 3) {
      setScreenshot2Class(['screenshot-image', 'last-image']);
      setScreenshot3Class(['screenshot-image', 'current-image']);
      setScreenshot1Class(['screenshot-image']);
    }
    if (currentSlide === 4) {
      setScreenshot3Class(['screenshot-image', 'last-image']);
      setScreenshot4Class(['screenshot-image', 'current-image']);
      setScreenshot2Class(['screenshot-image']);
    }
    if (currentSlide === 5) {
      setScreenshot4Class(['screenshot-image', 'last-image']);
      setScreenshot5Class(['screenshot-image', 'current-image']);
      setScreenshot3Class(['screenshot-image']);
    }
  }, [currentSlide]);

  useEffect(() => {
    const interval = setInterval(() => {
      currentSlide === 5 ? setCurrentSlide(1) : setCurrentSlide(currentSlide + 1);
    }, 5000);
    return () => clearInterval(interval)
  }, [currentSlide]);

  const focusInput = (event) => {
    event.target.parentElement.parentElement.classList.toggle('focused')
  }

  return (
    <main className="main-wrapper">
      <article className="sign-in-content">
        <div className="sign-in-image-wrapper">
          <div className="screenshots-wrapper">
            <img alt='' className={screenshot1Class.join(' ')} src={screenshot1}/>
            <img alt='' className={screenshot2Class.join(' ')} src={screenshot2}/>
            <img alt='' className={screenshot3Class.join(' ')} src={screenshot3}/>
            <img alt='' className={screenshot4Class.join(' ')} src={screenshot4}/>
            <img alt='' className={screenshot5Class.join(' ')} src={screenshot5}/>
          </div>
        </div>
        <div className="sign-in-sign-up-wrapper">
          <div className="sign-in-form-wrapper">
            <h1 className="sign-in-logo">
              T-social
            </h1>
            <form className="sign-in-form">
              <div className="username-input-wrapper">
                <label className="log-in-label">
                  <span className={emailValue !== '' ? ["username-placeholder", 'move-label'].join(' ') : 'username-placeholder'}>Email</span>
                  <input 
                    aria-label="Email" 
                    aria-required={true} 
                    autoCapitalize='off' 
                    autoCorrect="off" 
                    maxLength='75' 
                    name='email' 
                    type='text' 
                    className={emailValue !== '' ? ["username-input", 'text-adjust'].join(' ') : 'username-input'}
                    onChange={emailHandler}
                    onFocus={focusInput}
                    onBlur={focusInput}
                  />
                </label>
                <div className="username-spacer"></div>                
              </div>
              <div className="username-input-wrapper">
                <label className="log-in-label">
                  <span className={passwordValue !== '' ? ["username-placeholder", 'move-label'].join(' ') : 'username-placeholder'}>Password</span>
                  <input 
                    aria-label="Password" 
                    aria-required={true} 
                    autoCapitalize="off"
                    autoCorrect="off"
                    name="password"
                    type={passwordHidden ? "password" : "text"}
                    className={passwordValue !== '' ? ["password-input", 'text-adjust'].join(' ') : 'password-input'}
                    onChange={passwordHandler}
                    onFocus={focusInput}
                    onBlur={focusInput} 
                  />
                </label>
                <div className="username-spacer">
                  {passwordValue !== '' &&
                    <button type="button" className="password-show-button" onClick={togglePasswordVisability}>{passwordHidden ? 'Show' : 'Hide'}</button>                  
                  }
                </div>
              </div>
              <button type="submit" className="log-in-button" onClick={loginEmailPassword} disabled={logInDisabled}>Log In</button>
            </form>
            <div className="or-seperator">
              <div className="line1"></div>
              <div className="or-text">or</div>
              <div className="line2"></div>
            </div>
            <button className="facebook-button">
              <span className="facebook-sprite"></span>
              <span className="facebook-text" >Log in with Facebook</span>
            </button>
            {showError &&
            <p className="error-text">{errorText}</p>            
            }
            <a className="forgot-button" href="/">Forgot password?</a>          
          </div>
          <div className="sign-up-wrapper">
            <div className="sign-up-text">Don't have an account? <Link to="accounts/emailsignup" className="sign-up-link" href="/">Sign Up</Link></div>
          </div>          
        </div>
      </article>
    </main>
  )
}

export default LogIn;
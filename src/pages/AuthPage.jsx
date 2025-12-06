import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import login from "../api/login";
import postSignup from "../api/create-user";
import "./AuthPage.css";

function AuthPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
    error: "",
  });

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    passwordConfirm: "",
    error: "",
  });

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginForm(prev => ({ ...prev, error: "" }));

    try {
      const response = await login(loginForm.username, loginForm.password);
      const token = `Token ${response.token}`;
      window.localStorage.setItem("token", token);
      const user = response.user;
      window.localStorage.setItem("user", JSON.stringify(user));
      setAuth({ token, user });
      navigate("/dashboard");
    } catch (error) {
      setLoginForm(prev => ({ ...prev, error: "Invalid username or password" }));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSignupForm(prev => ({ ...prev, error: "" }));

    if (signupForm.password !== signupForm.passwordConfirm) {
      setSignupForm(prev => ({ ...prev, error: "Passwords do not match" }));
      setIsLoading(false);
      return;
    }

    try {
      await postSignup(
        signupForm.username,
        signupForm.email,
        signupForm.firstName,
        signupForm.lastName,
        signupForm.password,
        signupForm.passwordConfirm
      );
      
      // Auto-login after signup
      const response = await login(signupForm.username, signupForm.password);
      const token = `Token ${response.token}`;
      window.localStorage.setItem("token", token);
      const user = response.user;
      window.localStorage.setItem("user", JSON.stringify(user));
      setAuth({ token, user });
      navigate("/dashboard");
    } catch (error) {
      setSignupForm(prev => ({ ...prev, error: error.message || "Signup failed" }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className={`auth-container ${isRightPanelActive ? 'right-panel-active' : ''}`}>
        
        {/* Sign Up Form */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleSignup}>
            <h1>Create Account</h1>
            <input
              type="text"
              placeholder="Username"
              value={signupForm.username}
              onChange={(e) => setSignupForm(prev => ({ ...prev, username: e.target.value }))}
              disabled={isLoading}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={signupForm.email}
              onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
              disabled={isLoading}
              required
            />
            <div className="name-row">
              <input
                type="text"
                placeholder="First Name"
                value={signupForm.firstName}
                onChange={(e) => setSignupForm(prev => ({ ...prev, firstName: e.target.value }))}
                disabled={isLoading}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={signupForm.lastName}
                onChange={(e) => setSignupForm(prev => ({ ...prev, lastName: e.target.value }))}
                disabled={isLoading}
                required
              />
            </div>
            <input
              type="password"
              placeholder="Password"
              value={signupForm.password}
              onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
              disabled={isLoading}
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={signupForm.passwordConfirm}
              onChange={(e) => setSignupForm(prev => ({ ...prev, passwordConfirm: e.target.value }))}
              disabled={isLoading}
              required
            />
            {signupForm.error && <span className="error-message">{signupForm.error}</span>}
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Sign Up"}
            </button>
            <p className="mobile-toggle">
              Already have an account?{" "}
              <button type="button" onClick={() => setIsRightPanelActive(false)}>
                Sign In
              </button>
            </p>
          </form>
        </div>

        {/* Sign In Form */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleLogin}>
            <h1>Sign In</h1>
            <input
              type="text"
              placeholder="Username or Email"
              value={loginForm.username}
              onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
              disabled={isLoading}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
              disabled={isLoading}
              required
            />
            {loginForm.error && <span className="error-message">{loginForm.error}</span>}
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
            <p className="mobile-toggle">
              Don't have an account?{" "}
              <button type="button" onClick={() => setIsRightPanelActive(true)}>
                Sign Up
              </button>
            </p>
          </form>
        </div>

        {/* Overlay */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <div className="overlay-top">
                <h1>New here?</h1>
                <p>Sign up and unlock your first board</p>
              </div>
              <div className="overlay-bottom">
                <hr className="overlay-divider" />
                <p>Already have an account?</p>
                <button 
                  className="ghost" 
                  onClick={() => setIsRightPanelActive(false)}
                  type="button"
                >
                  Sign In
                </button>
              </div>
            </div>
            <div className="overlay-panel overlay-right">
              <div className="overlay-top">
                <h1>Welcome Back!</h1>
                <p>Ready to jump back in to your boards?</p>
              </div>
              <div className="overlay-bottom">
                <hr className="overlay-divider" />
                <p>Don't have an account with us?</p>
                <button 
                  className="ghost" 
                  onClick={() => setIsRightPanelActive(true)}
                  type="button"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;

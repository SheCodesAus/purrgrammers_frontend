import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import postSignup from "../api/post-login";
import { useAuth } from "../hooks/use-auth.js";
import "./LoginForm.css";

function SignUpForm() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  const [formState, setFormState] = useState({
    fields: {
      email: "",
      username: "",
      password: "",
    },
    errors: {
      email: "",
      username: "",
      password: "",
      submit: "",
    },
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      email: "",
      username: "",
      password: "",
    };

    if (!formState.fields.email) {
      newErrors.email = "Email is required";
      isValid = false;
    }

    if (!formState.fields.username) {
      newErrors.username = "Username is required";
      isValid = false;
    }

    if (!formState.fields.password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setFormState((prev) => ({
      ...prev,
      errors: newErrors,
    }));

    return isValid;
  };

  const handleChange = (event) => {
    const { id, value } = event.target;

    setFormState((prev) => ({
      ...prev,
      fields: { ...prev.fields, [id]: value },
      errors: { ...prev.errors, [id]: "" }, // clear field-specific error
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await postSignup(
        formState.fields.username,
        formState.fields.email,
        formState.fields.password
      );

      const token = response.token;
      window.localStorage.setItem("token", token);

      setAuth({ token });
      navigate("/");
    } catch (error) {
      setFormState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          submit: "Signup failed. Try again.",
        },
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-form">
      <h2 className="login-signup-page-title">Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            placeholder="Enter Your Email Address"
            ovalue={formState.fields.username}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        <div className="signup-form">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            placeholder="Enter Your Username"
            value={formState.fields.username}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            placeholder="Enter Your Password"
            value={formState.fields.username}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <button className="signup-button" type="submit" onClick={handleSubmit}>
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default SignUpForm;

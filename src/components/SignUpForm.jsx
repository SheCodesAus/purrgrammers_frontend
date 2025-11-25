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
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      password: "",
      password_confirm: "",
    },
    errors: {
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      password: "",
      password_confirm: "",
      submit: "",
    },
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      password: "",
      password_confirm: "",
    };

    if (!formState.fields.username) {
      newErrors.username = "Username is required";
      isValid = false;
    }

    if (!formState.fields.email) {
      newErrors.email = "Email is required";
      isValid = false;
    }

    if (!formState.fields.first_name) {
      newErrors.email = "First name is required";
      isValid = false;
    }

    if (!formState.fields.last_name_name) {
      newErrors.email = "Last name is required";
      isValid = false;
    }

    if (!formState.fields.password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    if (!formState.fields.password_confirm) {
      newErrors.password = "Password confirmation is required";
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
        formState.fields.first_name,
        formState.fields.last_name,
        formState.fields.password,
        formState.fields.password_confirm
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

        <div className="form-group">
          <label htmlFor="first_name">First name:</label>
          <input
            type="text"
            id="first_name"
            placeholder="Enter Your First Name"
            ovalue={formState.fields.first_name}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="last_name">Last name:</label>
          <input
            type="text"
            id="last_name"
            placeholder="Enter Your Last Name"
            ovalue={formState.fields.last_name}
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

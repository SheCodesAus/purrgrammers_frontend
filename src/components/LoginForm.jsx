import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import login from "../api/login";
import "./LoginForm.css";

function LoginForm() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [formState, setFormState] = useState({
    fields: {
      username: "",
      password: "",
    },
    errors: {
      username: "",
      password: "",
      submit: "",
    },
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      username: "",
      password: "",
    };

    // username validation
    if (!formState.fields.username) {
      newErrors.username = "Username or Email is required";
      isValid = false;
    }

    // password validation
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
      errors: { ...prev.errors, [id]: "" },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (validateForm()) {
      setIsLoading(true);

      try {
        const response = await login(
          formState.fields.username,
          formState.fields.password
        );

        const token = `Token ${response.token}`;
        window.localStorage.setItem("token", token);

        const user = response.user;
        window.localStorage.setItem("user", JSON.stringify(user));

        setAuth({ token, user });
        navigate("/dashboard");
      } catch (error) {
        setFormState((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            submit: "Invalid Username/Email or password",
          },
        }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="login-form-container">
      <h2 className="login-signup-page-title">Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username/Email:</label>
          <input
            type="text"
            id="username"
            placeholder="Enter Your Username"
            value={formState.fields.username}
            onChange={handleChange}
            disabled={isLoading}
          />
          {formState.errors.username && (
            <span className="error">{formState.errors.username}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            placeholder="Enter Your Password"
            value={formState.fields.password}
            onChange={handleChange}
            disabled={isLoading}
          />
          {formState.errors.password && (
            <span className="error">{formState.errors.password}</span>
          )}
        </div>

        {formState.errors.submit && (
          <div className="error">{formState.errors.submit}</div>
        )}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
        <button onClick={() => navigate("/signup")}>Sign Up</button>
      </form>
    </div>
  );
}

export default LoginForm;

import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify'; // Import Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS
import "./CSS/Login.css";
import axios from "axios";

const Login = () => {
  const APi_Url = import.meta.env.VITE_API_URL;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("All fields are required.");
      toast.error("All fields are required."); // Toast for error
    } else {
      try {
        setLoading(true); // Show loader while the request is being processed

        // Call your API endpoint using axios
        const response = await axios.post(`${APi_Url}/digicoder/crm/api/v1/employee/login`, {
          username: email,
          password: password
        });

        if (response.status === 200) { 
          setError("");
          toast.success("Logged in successfully!"); 
          const token = 'dvhdscvydsyjucbvdsjbvju';;
          const employeeId = response.data.employee._id;
          const addedBy = response.data.employee.addedBy;
        const name =response.data.employee
          sessionStorage.setItem("Emp",JSON.stringify(name))
          sessionStorage.setItem("Token", token);
          sessionStorage.setItem("employeeId", employeeId);
          sessionStorage.setItem("addedBy", addedBy);
          
          setTimeout(() => {
            setEmail("");
            setPassword("");
            navigate('/main');
          }, 500); 
        }
      } catch (error) {
        if (error.response) {
          // If the error response is from the server
          setError(error.response.data.message || "Invalid email or password.");
          toast.error(error.response.data.message || "Invalid email or password.");
        } else {
          // If it's a network or unknown error
          setError("An error occurred while processing your request.");
          toast.error("An error occurred while processing your request.");
        }
      } finally {
        setLoading(false); // Hide loader after request is completed
      }
    }
  };

  const handleRememberMe = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleFocus = (field) => {
    setFocusedField(field);
  };

  const handleBlur = () => {
    setFocusedField("");
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>Welcome Back</h1>
        <p>Access Your Account</p>

        <form onSubmit={handleSubmit}>
          <fieldset className={focusedField === "email" ? "focused" : ""}>
            <legend>Email</legend>
            <div className="input-group">
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => handleFocus("email")}
                onBlur={handleBlur}
                required
              />
            </div>
          </fieldset>
          <fieldset className={focusedField === "password" ? "focused" : ""}>
            <legend>Password</legend>
            <div className="input-group">
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => handleFocus("password")}
                onBlur={handleBlur}
                required
              />
            </div>
          </fieldset>
          <div className="remember-forgot">
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={handleRememberMe}
              />
              Remember Me
            </label>
            <a href="/forgot-password" className="forgot-password-link">
              Forgot Password?
            </a>
          </div>
          <br />
          {error && <div className="error-message">{error}</div>}

          {/* Login button with conditional rendering for the loader */}
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={loading} // Disable button while loading
          >
            {loading ? (
              <div className="spinner"></div> // Show loader inside the button
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>

      <ToastContainer /> {/* Toast container for displaying toasts */}
    </div>
  );
};

export default Login;

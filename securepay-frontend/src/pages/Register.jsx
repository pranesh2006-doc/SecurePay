import "./Login.css";
import { useState } from "react";
import { register } from "../services/authApi";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const handleChange = (e) => {
  setUserData({
    ...userData,
    [e.target.name]: e.target.value,
  });
};

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    await register({
      name: userData.name,
      email: userData.email,
      password: userData.password,
    });

    alert("Registered Successfully");
  } catch (error) {
    alert("Registration Failed");
  }
};
  return (
    <div className="login-container">
      <div className="login-card">

        <div className="logo-section">
          <div className="shield">🛡️</div>

          <h1>SecurPay</h1>

          <p>Secure Payment Verification Platform</p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <label>Full Name</label>
            <input
       type="text"
       name="name"
       value={userData.name}
       onChange={handleChange}
       placeholder="Enter your full name"
       />
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input
  type="email"
  name="email"
  value={userData.email}
  onChange={handleChange}
  placeholder="Enter your email"
/>
            
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
  type="password"
  name="password"
  value={userData.password}
  onChange={handleChange}
  placeholder="Create a password"
/>
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <input
  type="password"
  name="confirmPassword"
  value={userData.confirmPassword}
  onChange={handleChange}
  placeholder="Confirm your password"
/>
          </div>

          <button type="submit">
            Create Secure Account
          </button>

        </form>

        <div className="register">
          Already have an account?{" "}
      <a
  href="#"
  onClick={(e) => {
    e.preventDefault();
    navigate("/login");
  }}
>
  Login
</a>
        </div>

        <div className="security">
          🔒 SHA-256 Integrity Verification
          <br />
          End-to-End Transaction Protection
        </div>

      </div>
    </div>
  );
}

export default Register;
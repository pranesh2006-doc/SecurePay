import "./Login.css";

function Register() {
  return (
    <div className="login-container">
      <div className="login-card">

        <div className="logo-section">
          <div className="shield">🛡️</div>

          <h1>SecurPay</h1>

          <p>Secure Payment Verification Platform</p>
        </div>

        <form>

          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
            />
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Create a password"
            />
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your password"
            />
          </div>

          <button type="submit">
            Create Secure Account
          </button>

        </form>

        <div className="register">
          Already have an account?{" "}
          <a href="#">Login</a>
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
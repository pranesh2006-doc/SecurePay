import "./Login.css";

function Login() {
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
              placeholder="Enter your password"
            />
          </div>

          <div className="options">
            <label className="remember">
              <input type="checkbox" />
              Remember Me
            </label>

            <a href="#">Forgot Password?</a>
          </div>

          <button type="submit">
            Login Securely
          </button>

        </form>

        <div className="register">
          Don't have an account?{" "}
          <a href="#">Register</a>
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

export default Login;
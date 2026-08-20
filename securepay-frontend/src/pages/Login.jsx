import "./Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authApi";
function Login() {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
  email: "",
  password: "",
});

const handleChange = (e) => {
  setLoginData({
    ...loginData,
    [e.target.name]: e.target.value,
  });
};

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await login(loginData);

    localStorage.setItem("token", response.data.token);

    alert("Login Successful");

    navigate("/dashboard");
  } catch (error) {
    alert("Login Failed");
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
            <label>Email Address</label>
            <input
  type="email"
  name="email"
  value={loginData.email}
  onChange={handleChange}
  placeholder="Enter your email"
/>
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
  type="password"
  name="password"
  value={loginData.password}
  onChange={handleChange}
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
          {/* <a href="#">Register</a> */}
          <a
  href="#"
  onClick={(e) => {
    e.preventDefault();
    navigate("/register");
  }}
>
  Register
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
export default Login;
// import { useState } from "react";
// import { login } from "../services/authApi";

// function Login(){

//     const [email,setEmail]=useState("");
//     const [password,setPassword]=useState("");

//     const handleLogin = async()=>{

//         try{

//             const response = await login({
//                 email,
//                 password
//             });

//             localStorage.setItem(
//                 "token",
//                 response.data.token
//             );

//             alert("Login Success");

//         }catch(error){

//             alert("Login Failed");
//         }
//     };

//     return(
//         <>
//             <input
//                 placeholder="Email"
//                 onChange={(e)=>setEmail(e.target.value)}
//             />

//             <input
//                 type="password"
//                 placeholder="Password"
//                 onChange={(e)=>setPassword(e.target.value)}
//             />

//             <button onClick={handleLogin}>
//                 Login
//             </button>
//         </>
//     );
// }

// export default Login;
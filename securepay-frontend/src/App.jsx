import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Payment from "./pages/Payment";
import History from "./pages/History";
import IntegrityEngine from "./pages/IntegrityEngine";
import TransactionDetails from "./pages/TransactionDetails";  

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/history" element={<History />} />
        <Route path="/transaction/:transactionId" element={<TransactionDetails />} />
        <Route path="/integrity" element={<IntegrityEngine />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
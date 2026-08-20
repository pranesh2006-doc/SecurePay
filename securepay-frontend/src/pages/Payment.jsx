import React, { useState } from "react";
import {
  Send,
  User,
  IndianRupee,
  FileText,
  X,
  ShieldCheck,
  Home,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Payment.css";

const API_BASE_URL = "http://localhost:8080";

function Payment() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    receiver: "",
    amount: "",
    remarks: "",
    paymentMethod: "UPI",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [paymentResult, setPaymentResult] = useState(null);

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // ==========================================
  // HANDLE PAYMENT
  // ==========================================

  const handlePayment = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess(false);

    // ------------------------------------------
    // FRONTEND VALIDATION
    // ------------------------------------------

    if (!formData.receiver.trim()) {
      setError("Please enter receiver name.");
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    // ------------------------------------------
    // GET JWT TOKEN
    // ------------------------------------------

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Your session has expired. Please login again.");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

      return;
    }

    setLoading(true);

    try {
      // ------------------------------------------
      // CALL SPRING BOOT BACKEND
      // POST http://localhost:8080/payment
      // ------------------------------------------

      const response = await fetch(`${API_BASE_URL}/payment`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        // IMPORTANT:
        // Only send fields expected by your backend.
        body: JSON.stringify({
          receiver: formData.receiver.trim(),
          amount: Number(formData.amount),
        }),
      });

      // ------------------------------------------
      // READ RESPONSE SAFELY
      // ------------------------------------------

      const contentType = response.headers.get("content-type");

      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = text ? { message: text } : {};
      }

      console.log("Payment API response:", data);

      // ------------------------------------------
      // UNAUTHORIZED
      // ------------------------------------------

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");

        setError("Your session has expired. Please login again.");

        setTimeout(() => {
          navigate("/login");
        }, 1500);

        return;
      }

      // ------------------------------------------
      // BACKEND ERROR
      // ------------------------------------------

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            data?.details ||
            "Payment failed. Please try again."
        );
      }

      // ------------------------------------------
      // PAYMENT SUCCESS
      // ------------------------------------------

      setPaymentResult(data);
      setSuccess(true);

      // Clear form
      setFormData({
        receiver: "",
        amount: "",
        remarks: "",
        paymentMethod: "UPI",
      });
    } catch (err) {
      console.error("Payment error:", err);

      if (err instanceof TypeError) {
        setError(
          "Unable to connect to the backend. Make sure Spring Boot is running on port 8080."
        );
      } else {
        setError(
          err.message || "Unable to process payment. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CANCEL
  // ==========================================

  const handleCancel = () => {
    navigate("/dashboard");
  };

  // ==========================================
  // AMOUNT CALCULATION
  // ==========================================

  const amount = Number(formData.amount) || 0;
  const charges = 0;
  const total = amount + charges;

  // ==========================================
  // SUCCESS SCREEN
  // ==========================================

  if (success && paymentResult) {
    return (
      <div className="payment-page">
        {/* NAVBAR */}

        <nav className="payment-navbar">
          <div className="payment-brand">
            <div className="brand-icon">
              <ShieldCheck size={18} />
            </div>

            <span>
              Secure<span className="brand-blue">Pay</span>
            </span>
          </div>

          <button
            className="nav-dashboard-btn"
            onClick={() => navigate("/dashboard")}
          >
            <Home size={14} />
            Dashboard
          </button>
        </nav>

        {/* SUCCESS CONTENT */}

        <main className="payment-container">
          <div className="payment-card">
            <div className="payment-header">
              <div className="payment-header-left">
                <div className="send-icon">
                  <CheckCircle size={22} />
                </div>

                <div>
                  <h1>Payment Successful</h1>

                  <p>
                    Your transaction has been completed successfully
                  </p>
                </div>
              </div>

              <div className="secure-badge">
                <ShieldCheck size={13} />

                <span>Secure & Verified</span>
              </div>
            </div>

            {/* SUCCESS DETAILS */}

            <div className="summary-section">
              <h2>Transaction Details</h2>

              <div className="summary-row">
                <span>Transaction ID</span>

                <strong>
                  {paymentResult.transactionId ||
                    paymentResult.transactionID ||
                    paymentResult.id ||
                    "-"}
                </strong>
              </div>

              <div className="summary-row">
                <span>Sender</span>

                <strong>
                  {paymentResult.sender || "-"}
                </strong>
              </div>

              <div className="summary-row">
                <span>Receiver</span>

                <strong>
                  {paymentResult.receiver || formData.receiver || "-"}
                </strong>
              </div>

              <div className="summary-row">
                <span>Amount</span>

                <strong>
                  ₹
                  {paymentResult.amount !== undefined
                    ? paymentResult.amount
                    : amount}
                </strong>
              </div>

              <div className="summary-row">
                <span>Status</span>

                <strong>
                  <CheckCircle size={15} />

                  {paymentResult.status || "SUCCESS"}
                </strong>
              </div>

              <div className="summary-row">
                <span>Time</span>

                <strong>
                  {paymentResult.timestamp
                    ? new Date(
                        paymentResult.timestamp
                      ).toLocaleString()
                    : paymentResult.createdAt
                    ? new Date(
                        paymentResult.createdAt
                      ).toLocaleString()
                    : "-"}
                </strong>
              </div>
            </div>

            {/* ACTIONS */}

            <div className="payment-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate("/dashboard")}
              >
                <Home size={15} />
                Dashboard
              </button>

              <button
                type="button"
                className="send-payment-btn"
                onClick={() => {
                  setSuccess(false);
                  setPaymentResult(null);
                  setError("");
                }}
              >
                <Send size={15} />
                New Payment
              </button>
            </div>
          </div>

          {/* SECURITY MESSAGE */}

          <div className="payment-security-note">
            <ShieldCheck size={15} />

            <span>
              Transaction recorded successfully.
              <br />
              SentinelPay integrity verification will protect this transaction.
            </span>
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // PAYMENT FORM
  // ==========================================

  return (
    <div className="payment-page">
      {/* NAVBAR */}

      <nav className="payment-navbar">
        <div className="payment-brand">
          <div className="brand-icon">
            <ShieldCheck size={18} />
          </div>

          <span>
            Secure<span className="brand-blue">Pay</span>
          </span>
        </div>

        <button
          className="nav-dashboard-btn"
          onClick={() => navigate("/dashboard")}
        >
          <Home size={14} />
          Dashboard
        </button>
      </nav>

      {/* MAIN CONTENT */}

      <main className="payment-container">
        <div className="payment-card">
          {/* BLUE HEADER */}

          <div className="payment-header">
            <div className="payment-header-left">
              <div className="send-icon">
                <Send size={22} />
              </div>

              <div>
                <h1>Send Secure Payment</h1>

                <p>
                  Make a secure and verified transaction
                </p>
              </div>
            </div>

            <div className="secure-badge">
              <ShieldCheck size={13} />

              <span>Secure &amp; Verified</span>
            </div>
          </div>

          {/* PAYMENT FORM */}

          <form onSubmit={handlePayment}>
            {/* ERROR */}

            {error && (
              <div className="payment-error">
                <AlertCircle size={16} />

                <span>{error}</span>
              </div>
            )}

            {/* RECEIVER */}

            <div className="form-group">
              <label htmlFor="receiver">
                Receiver Name
              </label>

              <div className="input-wrapper">
                <User size={15} />

                <input
                  id="receiver"
                  type="text"
                  name="receiver"
                  placeholder="Enter receiver name"
                  value={formData.receiver}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* AMOUNT */}

            <div className="form-group">
              <label htmlFor="amount">
                Amount
              </label>

              <div className="input-wrapper">
                <IndianRupee size={15} />

                <input
                  id="amount"
                  type="number"
                  name="amount"
                  min="1"
                  step="0.01"
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* REMARKS */}

            <div className="form-group">
              <label htmlFor="remarks">
                Remarks (Optional)
              </label>

              <div className="input-wrapper textarea-wrapper">
                <FileText size={15} />

                <textarea
                  id="remarks"
                  name="remarks"
                  placeholder="Add a note or remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  rows="3"
                  disabled={loading}
                />
              </div>
            </div>

            {/* PAYMENT METHOD */}

            <div className="form-group payment-method-group">
              <label>Payment Method</label>

              <div className="payment-methods">
                <label className="method-option selected">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="UPI"
                    checked={
                      formData.paymentMethod === "UPI"
                    }
                    onChange={handleChange}
                    disabled={loading}
                  />

                  <div className="upi-logo-circle">
                    <span className="upi-logo-text">
                      UPI
                    </span>

                    <span className="upi-logo-arrow">
                      ›
                    </span>
                  </div>

                  <span className="upi-label">
                    UPI
                  </span>
                </label>
              </div>
            </div>

            {/* DIVIDER */}

            <div className="section-divider"></div>

            {/* TRANSACTION SUMMARY */}

            <div className="summary-section">
              <h2>Transaction Summary</h2>

              <div className="summary-row">
                <span>Receiver</span>

                <strong>
                  {formData.receiver || "—"}
                </strong>
              </div>

              <div className="summary-row">
                <span>Amount</span>

                <strong>
                  ₹{amount.toFixed(2)}
                </strong>
              </div>

              <div className="summary-row">
                <span>Charges</span>

                <strong>₹0.00</strong>
              </div>

              <div className="summary-row">
                <span>Total</span>

                <strong>
                  ₹{total.toFixed(2)}
                </strong>
              </div>
            </div>

            {/* ACTION BUTTONS */}

            <div className="payment-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={handleCancel}
                disabled={loading}
              >
                <X size={15} />
                Cancel
              </button>

              <button
                type="submit"
                className="send-payment-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2
                      size={15}
                      className="spin"
                    />

                    Processing...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={15} />

                    Send Payment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* SECURITY MESSAGE */}

        <div className="payment-security-note">
          <ShieldCheck size={15} />

          <span>
            Your transaction is protected with bank-level security and
            <br />
            SHA-256 integrity verification
          </span>
        </div>
      </main>
    </div>
  );
}

export default Payment;
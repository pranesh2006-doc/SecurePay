import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  User,
  CreditCard,
  CalendarDays,
  Clock3,
  FileText,
  Hash,
  WalletCards,
  History,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import "./TransactionDetails.css";

const API_URL = "http://localhost:8080";

function TransactionDetails() {
  const navigate = useNavigate();

  // IMPORTANT:
  // App.jsx should have:
  // <Route path="/transaction/:transactionId" element={<TransactionDetails />} />

  const { transactionId } = useParams();

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [verificationResult, setVerificationResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const [auditLogs, setAuditLogs] = useState([]);
  const [showAudit, setShowAudit] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);

  // =====================================================
  // GET JWT TOKEN
  // =====================================================

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("jwtToken") ||
      localStorage.getItem("accessToken")
    );
  };

  // =====================================================
  // FETCH TRANSACTION
  // =====================================================

  useEffect(() => {
    if (!transactionId) {
      setError("Transaction ID is missing");
      setLoading(false);
      return;
    }

    fetchTransaction();
  }, [transactionId]);

  const fetchTransaction = async () => {
    try {
      setLoading(true);
      setError("");
      setTransaction(null);

      const token = getToken();

      console.log("=================================");
      console.log("Transaction ID from URL:", transactionId);
      console.log(
        "Request URL:",
        `${API_URL}/payment/${transactionId}`
      );
      console.log("=================================");

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const response = await fetch(
        `${API_URL}/payment/${encodeURIComponent(transactionId)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Transaction details response:",
        response.status
      );

      // 401
      if (response.status === 401) {
        throw new Error(
          "Authentication failed. Please login again."
        );
      }

      // 403
      if (response.status === 403) {
        throw new Error(
          "You are not authorized to view this transaction."
        );
      }

      // 404
      if (response.status === 404) {
        throw new Error(
          "Transaction not found."
        );
      }

      // Other backend errors
      if (!response.ok) {
        const errorText = await response.text();

        console.error(
          "Backend error:",
          errorText
        );

        throw new Error(
          "Unable to load transaction."
        );
      }

      const data = await response.json();

      console.log(
        "Transaction details from backend:",
        data
      );

      setTransaction(data);

    } catch (error) {
      console.error(
        "Transaction fetch error:",
        error
      );

      setTransaction(null);

      setError(
        error.message ||
          "Unable to load transaction."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // VERIFY INTEGRITY
  // =====================================================

  const verifyIntegrity = async () => {
    try {
      setVerifying(true);
      setVerificationResult(null);

      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found."
        );
      }

      const response = await fetch(
        `${API_URL}/integrity/verify/${encodeURIComponent(
          transactionId
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        console.error(
          "Integrity backend error:",
          errorText
        );

        throw new Error(
          "Integrity verification failed."
        );
      }

      const result = await response.text();

      console.log(
        "Integrity verification result:",
        result
      );

      setVerificationResult(
        result.trim()
      );

      if (showAudit) {
        fetchAuditLogs();
      }

    } catch (error) {
      console.error(
        "Integrity verification error:",
        error
      );

      setVerificationResult(
        "VERIFICATION FAILED"
      );

    } finally {
      setVerifying(false);
    }
  };

  // =====================================================
  // FETCH AUDIT LOG
  // =====================================================

  const fetchAuditLogs = async () => {
    try {
      setAuditLoading(true);

      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found."
        );
      }

      const response = await fetch(
        `${API_URL}/integrity/audit/${encodeURIComponent(
          transactionId
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch audit logs"
        );
      }

      const data = await response.json();

      console.log(
        "Audit logs:",
        data
      );

      setAuditLogs(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {
      console.error(
        "Audit log error:",
        error
      );

      setAuditLogs([]);

    } finally {
      setAuditLoading(false);
    }
  };

  // =====================================================
  // TOGGLE AUDIT LOG
  // =====================================================

  const toggleAuditLog = () => {
    const nextState = !showAudit;

    setShowAudit(nextState);

    if (nextState) {
      fetchAuditLogs();
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="transaction-details-page">

        <div className="transaction-not-found">

          <Loader2
            size={35}
            className="loading-icon"
          />

          <h2>
            Loading Transaction...
          </h2>

          <p>
            Fetching transaction details
          </p>

        </div>

      </div>
    );
  }

  // =====================================================
  // ERROR / NOT FOUND
  // =====================================================

  if (!transaction) {
    return (
      <div className="transaction-details-page">

        <div className="transaction-not-found">

          <div className="not-found-icon">
            <AlertTriangle size={28} />
          </div>

          <h2>
            Transaction Not Found
          </h2>

          <p>
            {error ||
              "The requested transaction could not be found."}
          </p>

          <p
            style={{
              fontSize: "12px",
              opacity: 0.7,
              wordBreak: "break-all",
            }}
          >
            Transaction ID:
            {" "}
            {transactionId || "Missing"}
          </p>

          <button
            className="back-history-button"
            onClick={() => navigate("/history")}
          >
            <ArrowLeft size={15} />
            Back to Transaction History
          </button>

        </div>

      </div>
    );
  }

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const transactionDate =
    transaction.timestamp
      ? new Date(
          transaction.timestamp
        ).toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        )
      : "-";

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const transactionTime =
    transaction.timestamp
      ? new Date(
          transaction.timestamp
        ).toLocaleTimeString(
          "en-IN",
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        )
      : "-";

  // =====================================================
  // VERIFICATION STATUS
  // =====================================================

  const normalizedVerification =
    String(
      verificationResult || ""
    )
      .trim()
      .toUpperCase();

  const isVerified =
    normalizedVerification ===
    "NO TAMPER";

  const isTampered =
    normalizedVerification ===
    "TAMPER DETECTED";

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="transaction-details-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="details-header">

        <button
          className="details-back-button"
          onClick={() => navigate("/history")}
        >
          <ArrowLeft size={19} />
        </button>

        <div>

          <h1>
            Transaction Details
          </h1>

          <p>
            Complete information about this transaction
          </p>

        </div>

      </div>

      <div className="details-container">

        {/* =================================================
            STATUS CARD
        ================================================= */}

        <div className="transaction-status-card">

          <div className="status-card-left">

            <div className="transaction-large-icon">
              <CreditCard size={22} />
            </div>

            <div>

              <span className="transaction-details-label">
                TRANSACTION ID
              </span>

              <h2>
                {transaction.transactionId}
              </h2>

            </div>

          </div>

          <div className="details-status success-details-status">

            <CheckCircle2 size={18} />

            <div>

              <strong>
                Payment Successful
              </strong>

              <span>
                Transaction completed
              </span>

            </div>

          </div>

        </div>

        {/* =================================================
            AMOUNT
        ================================================= */}

        <div className="amount-details-card">

          <span>
            PAYMENT AMOUNT
          </span>

          <h2>
            ₹
            {Number(
              transaction.amount
            ).toFixed(2)}
          </h2>

          <p>
            Secure payment
          </p>

        </div>

        {/* =================================================
            DETAILS GRID
        ================================================= */}

        <div className="details-grid">

          {/* PAYMENT INFORMATION */}

          <div className="details-section-card">

            <div className="details-section-title">

              <div className="details-title-icon blue-icon">
                <WalletCards size={17} />
              </div>

              <h3>
                Payment Information
              </h3>

            </div>

            <div className="details-list">

              <InfoRow
                icon={<User size={16} />}
                label="Sender"
                value={transaction.sender}
              />

              <InfoRow
                icon={<User size={16} />}
                label="Receiver"
                value={transaction.receiver}
              />

              <InfoRow
                icon={<WalletCards size={16} />}
                label="Amount"
                value={`₹${Number(
                  transaction.amount
                ).toFixed(2)}`}
              />

              <InfoRow
                icon={<CreditCard size={16} />}
                label="Status"
                value={transaction.status}
              />

            </div>

          </div>

          {/* TRANSACTION INFORMATION */}

          <div className="details-section-card">

            <div className="details-section-title">

              <div className="details-title-icon purple-icon">
                <FileText size={17} />
              </div>

              <h3>
                Transaction Information
              </h3>

            </div>

            <div className="details-list">

              <InfoRow
                icon={<Hash size={16} />}
                label="Transaction ID"
                value={
                  transaction.transactionId
                }
              />

              <InfoRow
                icon={<CalendarDays size={16} />}
                label="Date"
                value={transactionDate}
              />

              <InfoRow
                icon={<Clock3 size={16} />}
                label="Time"
                value={transactionTime}
              />

              <InfoRow
                icon={<ShieldCheck size={16} />}
                label="Integrity"
                value={
                  verificationResult ||
                  "Not Verified"
                }
                verified={isVerified}
                failed={isTampered}
              />

            </div>

          </div>

        </div>

        {/* =================================================
            SHA-256 VERIFICATION
        ================================================= */}

        <div className="hash-verification-card">

          <div className="hash-icon">

            {isTampered ? (
              <AlertTriangle size={23} />
            ) : (
              <ShieldCheck size={23} />
            )}

          </div>

          <div className="hash-content">

            <div className="hash-title-row">

              <h3>
                SHA-256 Security Verification
              </h3>

              {isVerified && (
                <span className="hash-verified">
                  <CheckCircle2 size={13} />
                  No Tamper
                </span>
              )}

              {isTampered && (
                <span className="hash-failed">
                  <AlertTriangle size={13} />
                  Tamper Detected
                </span>
              )}

              {!verificationResult && (
                <span className="hash-pending">
                  Not Verified
                </span>
              )}

            </div>

            <p>
              Transaction integrity is checked
              using SHA-256 verification to ensure
              that the payment data has not been
              modified after creation.
            </p>

            <button
              className="verify-integrity-button"
              onClick={verifyIntegrity}
              disabled={verifying}
            >

              {verifying ? (
                <>
                  <Loader2
                    size={15}
                    className="spin"
                  />

                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck size={15} />

                  Verify Integrity
                </>
              )}

            </button>

          </div>

        </div>

        {/* =================================================
            AUDIT LOG BUTTON
        ================================================= */}

        <button
          className="details-history-button"
          onClick={toggleAuditLog}
        >

          <History size={16} />

          {showAudit
            ? "Hide Audit Log"
            : "View Audit Log"}

        </button>

        {/* =================================================
            AUDIT LOG
        ================================================= */}

        {showAudit && (

          <div className="audit-log-card">

            <div className="audit-header">

              <div>

                <h3>
                  Integrity Audit Log
                </h3>

                <p>
                  Complete verification history
                  for this transaction
                </p>

              </div>

              <ShieldCheck size={22} />

            </div>

            {auditLoading ? (

              <div className="audit-loading">

                <Loader2
                  size={25}
                  className="spin"
                />

                <span>
                  Loading audit history...
                </span>

              </div>

            ) : auditLogs.length === 0 ? (

              <div className="audit-empty">

                <FileText size={25} />

                <p>
                  No verification records yet.
                </p>

              </div>

            ) : (

              <div className="audit-list">

                {auditLogs.map(
                  (audit, index) => {

                    const tampered =
                      String(
                        audit.result || ""
                      )
                        .trim()
                        .toUpperCase() ===
                      "TAMPER DETECTED";

                    const auditDate =
                      audit.verificationTime
                        ? new Date(
                            audit.verificationTime
                          ).toLocaleString(
                            "en-IN"
                          )
                        : "-";

                    return (

                      <div
                        className="audit-item"
                        key={
                          audit.id ||
                          index
                        }
                      >

                        <div
                          className={
                            tampered
                              ? "audit-icon audit-danger"
                              : "audit-icon audit-success"
                          }
                        >

                          {tampered ? (
                            <AlertTriangle
                              size={17}
                            />
                          ) : (
                            <CheckCircle2
                              size={17}
                            />
                          )}

                        </div>

                        <div className="audit-content">

                          <div className="audit-top">

                            <strong
                              className={
                                tampered
                                  ? "audit-danger-text"
                                  : "audit-success-text"
                              }
                            >
                              {audit.result}
                            </strong>

                            <span>
                              {auditDate}
                            </span>

                          </div>

                          <div className="audit-hash">

                            <span>
                              Original:
                            </span>

                            <code>
                              {audit.originalHash}
                            </code>

                          </div>

                          <div className="audit-hash">

                            <span>
                              Current:
                            </span>

                            <code>
                              {audit.currentHash}
                            </code>

                          </div>

                          {audit.changedFields &&
                            audit.changedFields !==
                              "None" && (

                            <div className="changed-fields">

                              <strong>
                                Changed Fields
                              </strong>

                              <pre>
                                {audit.changedFields}
                              </pre>

                            </div>

                          )}

                        </div>

                      </div>

                    );
                  }
                )}

              </div>

            )}

          </div>

        )}

      </div>

    </div>
  );
}

// =====================================================
// INFORMATION ROW
// =====================================================

function InfoRow({
  icon,
  label,
  value,
  verified,
  failed,
}) {
  return (
    <div className="details-row">

      <div className="details-row-label">

        {icon}

        <span>
          {label}
        </span>

      </div>

      <strong
        className={
          verified
            ? "verification-success"
            : failed
            ? "verification-failed"
            : ""
        }
      >
        {value}
      </strong>

    </div>
  );
}

export default TransactionDetails;
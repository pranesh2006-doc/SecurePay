import React, { useState } from "react";
import {
  ArrowLeft,
  ShieldCheck,
  Hash,
  CheckCircle2,
  XCircle,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./IntegrityEngine.css";

const API_URL = "http://localhost:8080";

function IntegrityEngine() {
  const navigate = useNavigate();

  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

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
  // FETCH TRANSACTION + EXISTING SHA-256 HASH
  // =====================================================

  const handleGenerateHash = async () => {
    const id = transactionId.trim();

    if (!id) {
      setResult({
        success: false,
        message: "Please enter a transaction ID.",
      });
      return;
    }

    setLoading(true);
    setResult(null);
    setCopied(false);

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      console.log("Integrity Engine Transaction ID:", id);

      const response = await fetch(
        `${API_URL}/payment/${encodeURIComponent(id)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Transaction API status:",
        response.status
      );

      // =================================================
      // AUTHENTICATION ERROR
      // =================================================

      if (response.status === 401) {
        throw new Error(
          "Authentication failed. Please login again."
        );
      }

      // =================================================
      // AUTHORIZATION ERROR
      // =================================================

      if (response.status === 403) {
        throw new Error(
          "You are not authorized to view this transaction."
        );
      }

      // =================================================
      // TRANSACTION NOT FOUND
      // =================================================

      if (response.status === 404) {
        throw new Error(
          "Transaction not found."
        );
      }

      // =================================================
      // OTHER BACKEND ERROR
      // =================================================

      if (!response.ok) {
        const errorText = await response.text();

        console.error(
          "Backend error:",
          errorText
        );

        throw new Error(
          "Unable to retrieve transaction."
        );
      }

      // =================================================
      // READ TRANSACTION
      // =================================================

      const transaction =
        await response.json();

      console.log(
        "Transaction received:",
        transaction
      );

      // =================================================
      // GET STORED HASH
      // =================================================

      const hash =
        transaction.integrityHash ||
        transaction.integrity_hash;

      if (!hash) {
        throw new Error(
          "No integrity hash found for this transaction."
        );
      }

      // =================================================
      // SUCCESS
      // =================================================

      setResult({
        success: true,
        message:
          "The original SHA-256 integrity hash was retrieved successfully.",
        transactionId:
          transaction.transactionId ||
          id,
        hash: hash,
        sender: transaction.sender,
        receiver: transaction.receiver,
        amount: transaction.amount,
        status: transaction.status,
        timestamp: transaction.timestamp,
      });

    } catch (error) {
      console.error(
        "Integrity Engine error:",
        error
      );

      setResult({
        success: false,
        message:
          error.message ||
          "Failed to retrieve integrity hash.",
      });

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // COPY HASH
  // =====================================================

  const copyHash = async () => {
    if (!result?.hash) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        result.hash
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);

    } catch (error) {
      console.error(
        "Copy failed:",
        error
      );
    }
  };

  // =====================================================
  // VERIFY TRANSACTION
  // =====================================================

  const verifyTransaction = () => {
    if (!result?.transactionId) {
      return;
    }

    navigate(
      `/transaction/${encodeURIComponent(
        result.transactionId
      )}`
    );
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (timestamp) => {
    if (!timestamp) {
      return "N/A";
    }

    try {
      return new Date(timestamp).toLocaleString(
        "en-IN",
        {
          dateStyle: "medium",
          timeStyle: "short",
        }
      );
    } catch {
      return timestamp;
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="integrity-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="integrity-header">

        <div className="integrity-title-section">

          <button
            className="integrity-back-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <ArrowLeft size={18} />
          </button>

          <div>

            <h1>
              Integrity Engine
            </h1>

            <p>
              Retrieve and inspect SHA-256
              integrity hashes for transactions
            </p>

          </div>

        </div>

      </div>

      {/* =================================================
          MAIN CONTAINER
      ================================================= */}

      <div className="integrity-container">

        {/* =================================================
            INTRO CARD
        ================================================= */}

        <div className="integrity-intro-card">

          <div className="integrity-main-icon">
            <ShieldCheck size={28} />
          </div>

          <div>

            <h2>
              Transaction Integrity Protection
            </h2>

            <p>
              SentinelPay creates a SHA-256 hash
              when a payment is created. The
              original hash is stored with the
              transaction and can later be used
              to detect tampering.
            </p>

          </div>

        </div>

        {/* =================================================
            HASH CARD
        ================================================= */}

        <div className="integrity-card">

          <div className="integrity-card-header">

            <div className="integrity-card-icon">
              <Hash size={20} />
            </div>

            <div>

              <h3>
                Transaction Integrity Hash
              </h3>

              <p>
                Enter an existing transaction ID
                to retrieve its stored SHA-256 hash.
              </p>

            </div>

          </div>

          <div className="integrity-form">

            <label>
              Transaction ID
            </label>

            <input
              type="text"
              placeholder="Example: TX1EDD6E4D26"
              value={transactionId}
              onChange={(e) =>
                setTransactionId(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleGenerateHash();
                }
              }}
            />

            <button
              className="generate-hash-button"
              onClick={handleGenerateHash}
              disabled={loading}
            >

              {loading ? (
                <>
                  <Loader2
                    size={17}
                    className="integrity-spinner"
                  />

                  Retrieving Hash...
                </>
              ) : (
                <>
                  <ShieldCheck size={17} />

                  Get SHA-256 Hash
                </>
              )}

            </button>

          </div>

        </div>

        {/* =================================================
            RESULT
        ================================================= */}

        {result && (

          <div
            className={
              result.success
                ? "integrity-result-card success"
                : "integrity-result-card failed"
            }
          >

            <div className="result-icon">

              {result.success ? (
                <CheckCircle2 size={23} />
              ) : (
                <XCircle size={23} />
              )}

            </div>

            <div className="result-content">

              <h3>

                {result.success
                  ? "Integrity Hash Found"
                  : "Hash Retrieval Failed"}

              </h3>

              <p>
                {result.message}
              </p>

              {result.success && (

                <>

                  {/* =====================================
                      TRANSACTION INFORMATION
                  ===================================== */}

                  <div className="hash-result">

                    <div>

                      <span>
                        Transaction ID
                      </span>

                      <strong>
                        {result.transactionId}
                      </strong>

                    </div>

                    <div>

                      <span>
                        Sender
                      </span>

                      <strong>
                        {result.sender}
                      </strong>

                    </div>

                    <div>

                      <span>
                        Receiver
                      </span>

                      <strong>
                        {result.receiver}
                      </strong>

                    </div>

                    <div>

                      <span>
                        Amount
                      </span>

                      <strong>
                        ₹
                        {Number(
                          result.amount || 0
                        ).toFixed(2)}
                      </strong>

                    </div>

                    <div>

                      <span>
                        Status
                      </span>

                      <strong>
                        {result.status}
                      </strong>

                    </div>

                    <div>

                      <span>
                        Created At
                      </span>

                      <strong>
                        {formatDate(
                          result.timestamp
                        )}
                      </strong>

                    </div>

                  </div>

                  {/* =====================================
                      SHA-256 HASH
                  ===================================== */}

                  <div className="hash-display">

                    <div className="hash-display-header">

                      <span>
                        Original SHA-256 Hash
                      </span>

                      <button
                        type="button"
                        onClick={copyHash}
                        title="Copy hash"
                      >

                        {copied ? (
                          <>
                            <Check size={15} />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={15} />
                            Copy
                          </>
                        )}

                      </button>

                    </div>

                    <code className="hash-value">
                      {result.hash}
                    </code>

                  </div>

                  {/* =====================================
                      VERIFY BUTTON
                  ===================================== */}

                  <button
                    className="verify-transaction-button"
                    onClick={verifyTransaction}
                  >

                    <ShieldCheck size={17} />

                    Verify Transaction Integrity

                  </button>

                </>

              )}

            </div>

          </div>

        )}

        {/* =================================================
            HOW IT WORKS
        ================================================= */}

        <div className="integrity-card">

          <div className="integrity-card-header">

            <div className="integrity-card-icon">
              <ShieldCheck size={20} />
            </div>

            <div>

              <h3>
                How Integrity Engine Works
              </h3>

              <p>
                SentinelPay protects transaction
                records using cryptographic hashing.
              </p>

            </div>

          </div>

          <div className="integrity-steps">

            <div className="integrity-step">

              <div className="step-number">
                1
              </div>

              <div>

                <strong>
                  Payment Created
                </strong>

                <span>
                  A transaction is created with
                  sender, receiver, amount, status
                  and timestamp.
                </span>

              </div>

            </div>

            <div className="integrity-step">

              <div className="step-number">
                2
              </div>

              <div>

                <strong>
                  SHA-256 Generated
                </strong>

                <span>
                  SentinelPay generates a SHA-256
                  hash from the original transaction
                  data.
                </span>

              </div>

            </div>

            <div className="integrity-step">

              <div className="step-number">
                3
              </div>

              <div>

                <strong>
                  Original Hash Stored
                </strong>

                <span>
                  The original hash is stored in
                  the transaction and integrity
                  snapshot.
                </span>

              </div>

            </div>

            <div className="integrity-step">

              <div className="step-number">
                4
              </div>

              <div>

                <strong>
                  Later Verification
                </strong>

                <span>
                  The current transaction hash is
                  compared against the original hash.
                </span>

              </div>

            </div>

            <div className="integrity-step">

              <div className="step-number">
                5
              </div>

              <div>

                <strong>
                  Tamper Detection
                </strong>

                <span>
                  If the hashes differ, SentinelPay
                  reports that the transaction was
                  modified.
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            BACK BUTTON
        ================================================= */}

        <button
          className="integrity-dashboard-button"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

      </div>

    </div>
  );
}

export default IntegrityEngine;
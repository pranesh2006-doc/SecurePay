import React, { useEffect, useState } from "react";
import {
  Search,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  XCircle,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./History.css";

function History() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================
  // GET JWT TOKEN
  // =========================================
  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("jwtToken") ||
      localStorage.getItem("accessToken")
    );
  };

  // =========================================
  // FETCH TRANSACTIONS
  // =========================================
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      console.log("JWT Token:", token);

      if (!token) {
        setError("You are not logged in. Please login again.");
        return;
      }

      const response = await fetch(
        "http://localhost:8080/payment/history",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Transaction History API status:",
        response.status
      );

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Authentication failed. Please login again."
        );
      }

      if (!response.ok) {
        throw new Error(
          `Failed to fetch transactions (${response.status})`
        );
      }

      const data = await response.json();

      console.log(
        "Transactions from backend:",
        data
      );

      const transactionList = Array.isArray(data)
        ? data
        : Array.isArray(data.content)
        ? data.content
        : Array.isArray(data.data)
        ? data.data
        : [];

      setTransactions(transactionList);

    } catch (err) {
      console.error(
        "Transaction fetch error:",
        err
      );

      setTransactions([]);

      setError(
        err.message ||
          "Unable to load transactions. Please check whether the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // LOAD TRANSACTIONS
  // =========================================
  useEffect(() => {
    fetchTransactions();
  }, []);

  // =========================================
  // SEARCH
  // =========================================
  const filteredTransactions =
    transactions.filter((transaction) => {
      const searchValue =
        search.toLowerCase().trim();

      const transactionId =
        transaction.transactionId ||
        transaction.transaction_id ||
        "";

      const receiver =
        transaction.receiver ||
        transaction.receiverName ||
        transaction.recipient ||
        "";

      const amount =
        transaction.amount || "";

      const timestamp =
        transaction.timestamp ||
        "";

      const status =
        transaction.status || "";

      return (
        String(transactionId)
          .toLowerCase()
          .includes(searchValue) ||

        String(receiver)
          .toLowerCase()
          .includes(searchValue) ||

        String(amount)
          .toLowerCase()
          .includes(searchValue) ||

        String(timestamp)
          .toLowerCase()
          .includes(searchValue) ||

        String(status)
          .toLowerCase()
          .includes(searchValue)
      );
    });

  // =========================================
  // STATUS
  // =========================================
  const getStatus = (status) => {
    const normalizedStatus =
      String(status || "").toLowerCase();

    if (
      normalizedStatus === "success" ||
      normalizedStatus === "completed" ||
      normalizedStatus === "successful"
    ) {
      return (
        <span className="history-status history-success">
          <CheckCircle2 size={14} />
          Success
        </span>
      );
    }

    if (
      normalizedStatus === "pending" ||
      normalizedStatus === "processing"
    ) {
      return (
        <span className="history-status history-pending">
          <Clock3 size={14} />
          Pending
        </span>
      );
    }

    return (
      <span className="history-status history-failed">
        <XCircle size={14} />
        Failed
      </span>
    );
  };

  // =========================================
  // OPEN TRANSACTION DETAILS
  // =========================================
  const openTransaction = (transaction) => {

    // IMPORTANT:
    // Backend searches using transaction_id.
    // Therefore ALWAYS use transactionId first.

    const transactionId =
      transaction.transactionId ||
      transaction.transaction_id;

    console.log(
      "Opening transaction:",
      transactionId
    );

    console.log(
      "Complete transaction object:",
      transaction
    );

    if (!transactionId) {
      console.error(
        "Transaction ID not found:",
        transaction
      );

      return;
    }

    // Correct:
    // /transaction/TX1EDD6E4D26

    navigate(
      `/transaction/${encodeURIComponent(transactionId)}`
    );
  };

  // =========================================
  // FORMAT DATE
  // =========================================
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
    } catch (error) {
      return timestamp;
    }
  };

  // =========================================
  // LOADING
  // =========================================
  if (loading) {
    return (
      <div className="history-page">
        <div className="history-loading">

          <div className="history-loader"></div>

          <p>
            Loading transactions...
          </p>

        </div>
      </div>
    );
  }

  // =========================================
  // ERROR
  // =========================================
  if (error) {
    return (
      <div className="history-page">

        <div className="history-error">

          <XCircle size={35} />

          <h2>
            Unable to Load Transactions
          </h2>

          <p>
            {error}
          </p>

          <button
            className="retry-button"
            onClick={fetchTransactions}
          >
            Try Again
          </button>

          <button
            className="back-history-button"
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

  // =========================================
  // MAIN UI
  // =========================================
  return (
    <div className="history-page">

      {/* HEADER */}
      <div className="history-header">

        <div className="history-title-section">

          <button
            className="history-back-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <ArrowLeft size={18} />
          </button>

          <div>

            <h1>
              Transaction History
            </h1>

            <p>
              View and search your recent
              payment transactions
            </p>

          </div>

        </div>

      </div>

      {/* CARD */}
      <div className="history-card">

        {/* SEARCH */}
        <div className="history-search-section">

          <div className="history-search-box">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search transaction..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

        </div>

        <div className="history-divider"></div>

        {/* DESKTOP TABLE */}
        <div className="history-table-wrapper">

          <table className="history-table">

            <thead>

              <tr>

                <th>
                  TRANSACTION ID
                </th>

                <th>
                  RECEIVER
                </th>

                <th>
                  AMOUNT
                </th>

                <th>
                  DATE
                </th>

                <th>
                  STATUS
                </th>

                <th></th>

              </tr>

            </thead>

            <tbody>

              {filteredTransactions.length > 0 ? (

                filteredTransactions.map(
                  (transaction) => {

                    const transactionId =
                      transaction.transactionId ||
                      transaction.transaction_id;

                    const receiver =
                      transaction.receiver ||
                      transaction.receiverName ||
                      transaction.recipient ||
                      "Unknown";

                    const amount =
                      Number(
                        transaction.amount || 0
                      );

                    const timestamp =
                      transaction.timestamp;

                    return (
                      <tr
                        key={
                          transactionId ||
                          transaction.id
                        }
                        className="transaction-row"
                        onClick={() =>
                          openTransaction(
                            transaction
                          )
                        }
                      >

                        <td>

                          <span className="history-transaction-id">

                            {transactionId ||
                              `TXN${transaction.id}`}

                          </span>

                        </td>

                        <td>

                          <span className="history-receiver">

                            {receiver}

                          </span>

                        </td>

                        <td>

                          <span className="history-amount">

                            ₹
                            {amount.toFixed(2)}

                          </span>

                        </td>

                        <td>

                          <span className="history-date">

                            {formatDate(
                              timestamp
                            )}

                          </span>

                        </td>

                        <td>

                          {getStatus(
                            transaction.status
                          )}

                        </td>

                        <td>

                          <ChevronRight
                            size={17}
                            className="transaction-arrow"
                          />

                        </td>

                      </tr>
                    );
                  }
                )

              ) : (

                <tr>

                  <td colSpan="6">

                    <div className="history-no-results">
                      No transactions found
                    </div>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* MOBILE */}
        <div className="history-mobile-list">

          {filteredTransactions.length > 0 ? (

            filteredTransactions.map(
              (transaction) => {

                const transactionId =
                  transaction.transactionId ||
                  transaction.transaction_id;

                const receiver =
                  transaction.receiver ||
                  transaction.receiverName ||
                  transaction.recipient ||
                  "Unknown";

                const amount =
                  Number(
                    transaction.amount || 0
                  );

                return (
                  <div
                    className="history-mobile-card"
                    key={
                      transactionId ||
                      transaction.id
                    }
                    onClick={() =>
                      openTransaction(
                        transaction
                      )
                    }
                  >

                    <div className="mobile-history-top">

                      <span className="history-transaction-id">

                        {transactionId ||
                          `TXN${transaction.id}`}

                      </span>

                      <ChevronRight
                        size={17}
                        className="transaction-arrow"
                      />

                    </div>

                    <div className="mobile-history-details">

                      <div>

                        <span className="mobile-label">
                          Receiver
                        </span>

                        <span className="history-receiver">
                          {receiver}
                        </span>

                      </div>

                      <div>

                        <span className="mobile-label">
                          Amount
                        </span>

                        <span className="history-amount">
                          ₹{amount.toFixed(2)}
                        </span>

                      </div>

                      <div>

                        <span className="mobile-label">
                          Date
                        </span>

                        <span className="history-date">
                          {formatDate(
                            transaction.timestamp
                          )}
                        </span>

                      </div>

                      <div>

                        <span className="mobile-label">
                          Status
                        </span>

                        {getStatus(
                          transaction.status
                        )}

                      </div>

                    </div>

                  </div>
                );
              }
            )

          ) : (

            <div className="history-mobile-no-results">
              No transactions found
            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default History;
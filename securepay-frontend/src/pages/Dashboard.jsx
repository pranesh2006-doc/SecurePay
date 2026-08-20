import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  CreditCard,
  ArrowLeftRight,
  ShieldCheck,
  User,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  Send,
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  Clock3,
  XCircle,
  Shield,
  Wallet,
  Activity,
  TrendingUp,
} from "lucide-react";

import "./Dashboard.css";

const API_URL = "http://localhost:8080";

function Dashboard() {
  const navigate = useNavigate();

  // =========================================
  // STATE
  // =========================================

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [userName, setUserName] = useState("User");

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

      console.log("Dashboard JWT:", token);

      if (!token) {
        navigate("/");
        return;
      }

      const response = await fetch(`${API_URL}/payment/history`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(
        "Transaction History Status:",
        response.status
      );

      // =========================================
      // AUTHENTICATION FAILURE
      // =========================================

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("accessToken");

        navigate("/");
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Failed to load transactions (${response.status})`
        );
      }

      const data = await response.json();

      console.log(
        "Transaction API Response:",
        data
      );

      // =========================================
      // HANDLE DIFFERENT BACKEND RESPONSE TYPES
      // =========================================

      let transactionList = [];

      if (Array.isArray(data)) {
        transactionList = data;
      } else if (Array.isArray(data.transactions)) {
        transactionList = data.transactions;
      } else if (Array.isArray(data.content)) {
        transactionList = data.content;
      } else if (Array.isArray(data.data)) {
        transactionList = data.data;
      }

      console.log(
        "Transactions loaded:",
        transactionList
      );

      setTransactions(transactionList);
    } catch (err) {
      console.error(
        "Dashboard transaction error:",
        err
      );

      setTransactions([]);

      setError(
        err.message ||
          "Unable to load transaction history."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // LOAD DASHBOARD
  // =========================================

  useEffect(() => {
    fetchTransactions();

    const storedName =
      localStorage.getItem("username");

    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("username");

    navigate("/");
  };

  // =========================================
  // NAVIGATION
  // =========================================

  const handleNavigation = (path) => {
    navigate(path);
  };

  // =========================================
  // OPEN TRANSACTION
  // =========================================

  const handleViewTransaction = (transactionId) => {
    if (!transactionId) {
      console.error(
        "Transaction ID is missing"
      );
      return;
    }

    console.log(
      "Opening transaction:",
      transactionId
    );

    navigate(
      `/transaction/${encodeURIComponent(
        transactionId
      )}`
    );
  };

  // =========================================
  // FORMAT AMOUNT
  // =========================================

  const formatAmount = (amount) => {
    const number = Number(amount);

    if (Number.isNaN(number)) {
      return "₹0.00";
    }

    return `₹${number.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // =========================================
  // FORMAT DATE
  // =========================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    try {
      const parsedDate = new Date(date);

      if (Number.isNaN(parsedDate.getTime())) {
        return date;
      }

      return parsedDate.toLocaleString(
        "en-IN",
        {
          dateStyle: "medium",
          timeStyle: "short",
        }
      );
    } catch {
      return date;
    }
  };

  // =========================================
  // NORMALIZE BACKEND DATA
  // =========================================

  const normalizedTransactions =
    transactions.map((transaction) => {
      const transactionId =
        transaction.transactionId ||
        transaction.transaction_id ||
        transaction.id;

      const receiver =
        transaction.receiver ||
        transaction.receiverName ||
        transaction.recipient ||
        "Unknown";

      const receiverUpi =
        transaction.receiverUpi ||
        transaction.receiverUPI ||
        transaction.upi ||
        "-";

      const amount =
        transaction.amount ?? 0;

      const status =
        transaction.status ||
        "Unknown";

      const date =
        transaction.timestamp ||
        transaction.createdAt ||
        transaction.date;

      return {
        ...transaction,

        id: transactionId,

        receiver,
        upi: receiverUpi,
        amount,
        status,
        date,
      };
    });

  // =========================================
  // SEARCH
  // =========================================

  const filteredTransactions =
    normalizedTransactions.filter(
      (transaction) => {
        const search =
          searchTerm
            .toLowerCase()
            .trim();

        if (!search) {
          return true;
        }

        return (
          String(transaction.id || "")
            .toLowerCase()
            .includes(search) ||

          String(transaction.receiver || "")
            .toLowerCase()
            .includes(search) ||

          String(transaction.amount || "")
            .toLowerCase()
            .includes(search) ||

          String(transaction.status || "")
            .toLowerCase()
            .includes(search) ||

          String(transaction.upi || "")
            .toLowerCase()
            .includes(search)
        );
      }
    );

  // =========================================
  // STATISTICS
  // =========================================

  const totalPayments =
    normalizedTransactions.length;

  const successfulPayments =
    normalizedTransactions.filter(
      (transaction) => {
        const status =
          String(
            transaction.status || ""
          ).toLowerCase();

        return (
          status === "success" ||
          status === "successful" ||
          status === "completed"
        );
      }
    ).length;

  const totalAmount =
    normalizedTransactions.reduce(
      (total, transaction) => {
        return (
          total +
          Number(
            transaction.amount || 0
          )
        );
      },
      0
    );

  const successRate =
    totalPayments > 0
      ? (
          (successfulPayments /
            totalPayments) *
          100
        ).toFixed(1)
      : "0.0";

  // =========================================
  // STATUS BADGE
  // =========================================

  const renderStatus = (status) => {
    const normalizedStatus =
      String(
        status || ""
      ).toLowerCase();

    if (
      normalizedStatus === "success" ||
      normalizedStatus === "successful" ||
      normalizedStatus === "completed"
    ) {
      return (
        <span className="status-badge status-success">
          <CheckCircle2 size={13} />
          Success
        </span>
      );
    }

    if (
      normalizedStatus === "pending" ||
      normalizedStatus === "processing"
    ) {
      return (
        <span className="status-badge status-pending">
          <Clock3 size={13} />
          Pending
        </span>
      );
    }

    if (
      normalizedStatus === "failed" ||
      normalizedStatus === "failure"
    ) {
      return (
        <span className="status-badge status-failed">
          <XCircle size={13} />
          Failed
        </span>
      );
    }

    return (
      <span className="status-badge">
        {status || "Unknown"}
      </span>
    );
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="dashboard-container">

      {/* =====================================
          SIDEBAR
      ===================================== */}

      <aside className="sidebar">

        <div className="sidebar-logo">

          <div className="logo-icon">
            <ShieldCheck size={23} />
          </div>

          <div className="logo-text">
            <span className="logo-name">
              Sentinel
            </span>

            <span className="logo-pay">
              Pay
            </span>
          </div>

        </div>

        <nav className="sidebar-nav">

          {/* MAIN */}

          <div className="nav-section">

            <p className="nav-title">
              MAIN
            </p>

            <button
              className="nav-item active"
              onClick={() =>
                handleNavigation(
                  "/dashboard"
                )
              }
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>

          </div>

          {/* PAYMENTS */}

          <div className="nav-section">

            <p className="nav-title">
              PAYMENTS
            </p>

            <button
              className="nav-item"
              onClick={() =>
                handleNavigation(
                  "/payment"
                )
              }
            >
              <CreditCard size={18} />
              <span>Send Payment</span>
            </button>

            <button
              className="nav-item"
              onClick={() =>
                handleNavigation(
                  "/history"
                )
              }
            >
              <ArrowLeftRight size={18} />
              <span>Transactions</span>
            </button>

          </div>

          {/* SECURITY */}

          <div className="nav-section">

            <p className="nav-title">
              SECURITY
            </p>

            <button
              className="nav-item"
              onClick={() =>
                navigate("/integrity")
              }
            >
              <ShieldCheck size={18} />
              <span>Integrity Engine</span>
            </button>

          </div>

          {/* ACCOUNT */}

          <div className="nav-section">

            <p className="nav-title">
              ACCOUNT
            </p>

            <button
              className="nav-item"
              onClick={() =>
                handleNavigation(
                  "/profile"
                )
              }
            >
              <User size={18} />
              <span>Profile</span>
            </button>

            <button
              className="nav-item"
              onClick={() =>
                handleNavigation(
                  "/settings"
                )
              }
            >
              <Settings size={18} />
              <span>Settings</span>
            </button>

          </div>

        </nav>

        {/* LOGOUT */}

        <div className="sidebar-bottom">

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>

        </div>

      </aside>

      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <main className="main-content">

        {/* HEADER */}

        <header className="top-header">

          <div className="mobile-logo">

            <div className="logo-icon">
              <ShieldCheck size={20} />
            </div>

            <div className="logo-text">

              <span className="logo-name">
                Sentinel
              </span>

              <span className="logo-pay">
                Pay
              </span>

            </div>

          </div>

          <div className="header-right">

            <button className="notification-button">
              <Bell size={19} />
              <span className="notification-dot"></span>
            </button>

            <div className="header-user">

              <div className="user-avatar">
                {userName
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="header-user-info">

                <span className="header-user-name">
                  {userName}
                </span>

                <span className="header-user-role">
                  User Account
                </span>

              </div>

              <ChevronDown
                size={16}
                className="user-chevron"
              />

            </div>

          </div>

        </header>

        {/* =====================================
            PAGE CONTENT
        ===================================== */}

        <div className="page-content">

          {/* WELCOME */}

          <section className="welcome-section">

            <div>

              <h1>
                Welcome back 👋
              </h1>

              <p>
                Welcome back, {userName}
              </p>

              <div className="security-message">

                <ShieldCheck size={16} />

                <span>
                  Your account is protected
                  with SHA-256 verification.
                </span>

              </div>

            </div>

            <div className="verification-badge">

              <span className="verified-dot"></span>

              SHA-256 VERIFIED

            </div>

          </section>

          {/* =====================================
              SUMMARY
          ===================================== */}

          <section className="summary-grid">

            {/* TOTAL AMOUNT */}

            <div className="summary-card balance-card">

              <div className="card-top">

                <div>

                  <p className="card-label">
                    Total Amount Sent
                  </p>

                  <h2>
                    {formatAmount(
                      totalAmount
                    )}
                  </h2>

                </div>

                <div className="card-icon balance-icon">
                  <Wallet size={21} />
                </div>

              </div>

              <div className="card-footer">

                <span className="green-dot"></span>

                Based on transaction
                history

              </div>

            </div>

            {/* TOTAL PAYMENTS */}

            <div className="summary-card">

              <div className="card-top">

                <div>

                  <p className="card-label">
                    Total Payments
                  </p>

                  <h2>
                    {totalPayments}
                  </h2>

                </div>

                <div className="card-icon payment-icon">
                  <Activity size={21} />
                </div>

              </div>

              <div className="card-footer">

                <TrendingUp size={14} />

                All transactions

              </div>

            </div>

            {/* SUCCESSFUL */}

            <div className="summary-card">

              <div className="card-top">

                <div>

                  <p className="card-label">
                    Successful Payments
                  </p>

                  <h2>
                    {successfulPayments}
                  </h2>

                </div>

                <div className="card-icon success-icon">
                  <CheckCircle2 size={21} />
                </div>

              </div>

              <div className="card-footer success-text">

                {successRate}%
                success rate

              </div>

            </div>

          </section>

          {/* =====================================
              QUICK ACTIONS
          ===================================== */}

          <section className="section-block">

            <div className="section-heading">

              <div>

                <h2>
                  Quick Actions
                </h2>

                <p>
                  Manage your payments quickly
                </p>

              </div>

            </div>

            <div className="quick-actions">

              {/* SEND PAYMENT */}

              <button
                className="quick-action-card"
                onClick={() =>
                  handleNavigation(
                    "/payment"
                  )
                }
              >

                <div className="quick-action-icon blue-action">
                  <Send size={21} />
                </div>

                <div className="quick-action-content">

                  <h3>
                    Send Payment
                  </h3>

                  <p>
                    Make a secure payment
                  </p>

                </div>

                <span className="action-arrow">
                  →
                </span>

              </button>

              {/* TRANSACTIONS */}

              <button
                className="quick-action-card"
                onClick={() =>
                  handleNavigation(
                    "/history"
                  )
                }
              >

                <div className="quick-action-icon purple-action">
                  <ArrowLeftRight size={21} />
                </div>

                <div className="quick-action-content">

                  <h3>
                    Transactions
                  </h3>

                  <p>
                    View payment history
                  </p>

                </div>

                <span className="action-arrow">
                  →
                </span>

              </button>

              {/* VERIFY PAYMENT
                  NOW GOES TO INTEGRITY */}

              <button
                className="quick-action-card"
                onClick={() =>
                  navigate("/integrity")
                }
              >

                <div className="quick-action-icon green-action">

                  <ShieldCheck size={21} />

                </div>

                <div className="quick-action-content">

                  <h3>
                    Verify Payment
                  </h3>

                  <p>
                    Check payment integrity
                  </p>

                </div>

                <span className="action-arrow">
                  →
                </span>

              </button>

            </div>

          </section>

          {/* =====================================
              LOWER GRID
          ===================================== */}

          <div className="dashboard-lower-grid">

            {/* TRANSACTIONS */}

            <section className="transactions-section">

              <div className="transactions-header">

                <div>

                  <h2>
                    Recent Transactions
                  </h2>

                  <p>
                    Your latest payment activity
                  </p>

                </div>

                <button
                  className="view-all-button"
                  onClick={() =>
                    handleNavigation(
                      "/history"
                    )
                  }
                >
                  View All →
                </button>

              </div>

              {/* SEARCH */}

              <div className="transaction-tools">

                <div className="search-box">

                  <Search size={17} />

                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(
                        e.target.value
                      )
                    }
                  />

                </div>

                <button className="filter-button">

                  <Filter size={16} />

                  Filter

                  <ChevronDown size={14} />

                </button>

              </div>

              {/* TABLE */}

              <div className="table-wrapper">

                {loading ? (

                  <div
                    style={{
                      padding: "30px",
                      textAlign: "center",
                    }}
                  >
                    Loading transactions...
                  </div>

                ) : error ? (

                  <div
                    style={{
                      padding: "30px",
                      textAlign: "center",
                      color: "#dc2626",
                    }}
                  >
                    {error}
                  </div>

                ) : filteredTransactions.length === 0 ? (

                  <div
                    style={{
                      padding: "30px",
                      textAlign: "center",
                      color: "#64748b",
                    }}
                  >
                    No transactions found.
                  </div>

                ) : (

                  <table className="transactions-table">

                    <thead>

                      <tr>

                        <th>
                          TRANSACTION
                        </th>

                        <th>
                          RECEIVER
                        </th>

                        <th>
                          AMOUNT
                        </th>

                        <th>
                          STATUS
                        </th>

                        <th>
                          DATE
                        </th>

                        <th>
                          ACTION
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {filteredTransactions
                        .slice(0, 5)
                        .map(
                          (transaction) => (

                            <tr
                              key={
                                transaction.id
                              }
                            >

                              <td>

                                <span className="transaction-id">

                                  {
                                    transaction.id
                                  }

                                </span>

                              </td>

                              <td>

                                <div className="receiver-cell">

                                  <div className="receiver-avatar">

                                    {transaction.receiver
                                      .charAt(
                                        0
                                      )
                                      .toUpperCase()}

                                  </div>

                                  <div>

                                    <span className="receiver-name">

                                      {
                                        transaction.receiver
                                      }

                                    </span>

                                    <span className="receiver-upi">

                                      {
                                        transaction.upi
                                      }

                                    </span>

                                  </div>

                                </div>

                              </td>

                              <td>

                                <span className="amount">

                                  {formatAmount(
                                    transaction.amount
                                  )}

                                </span>

                              </td>

                              <td>

                                {renderStatus(
                                  transaction.status
                                )}

                              </td>

                              <td>

                                <span className="transaction-date">

                                  {formatDate(
                                    transaction.date
                                  )}

                                </span>

                              </td>

                              <td>

                                <button
                                  className="more-button"
                                  onClick={() =>
                                    handleViewTransaction(
                                      transaction.id
                                    )
                                  }
                                  title="View transaction"
                                >

                                  <MoreVertical
                                    size={17}
                                  />

                                </button>

                              </td>

                            </tr>

                          )
                        )}

                    </tbody>

                  </table>

                )}

              </div>

            </section>

            {/* =====================================
                SECURITY STATUS
            ===================================== */}

            <aside className="security-card">

              <div className="security-card-header">

                <div className="security-main-icon">

                  <Shield size={23} />

                </div>

                <div>

                  <h2>
                    Security Status
                  </h2>

                  <p>
                    Your account is secure
                  </p>

                </div>

              </div>

              <div className="security-status-main">

                <div className="security-check">

                  <CheckCircle2 size={17} />

                </div>

                <div>

                  <strong>
                    All Systems Secure
                  </strong>

                  <span>
                    Protection is active
                  </span>

                </div>

              </div>

              <div className="security-details">

                <div className="security-row">

                  <span>
                    SHA-256 Integrity
                  </span>

                  <span className="secure-value">

                    <CheckCircle2 size={14} />

                    Verified

                  </span>

                </div>

                <div className="security-row">

                  <span>
                    Account Protection
                  </span>

                  <span className="secure-value">

                    <CheckCircle2 size={14} />

                    Active

                  </span>

                </div>

                <div className="security-row">

                  <span>
                    Last Verification
                  </span>

                  <span className="secure-time">
                    Just now
                  </span>

                </div>

              </div>

              {/* =====================================
                  VERIFY SECURITY
                  FIXED → /integrity
              ===================================== */}

              <button
                className="verify-security-button"
                onClick={() =>
                  navigate("/integrity")
                }
              >

                <ShieldCheck size={16} />

                Verify Security

              </button>

            </aside>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Dashboard;
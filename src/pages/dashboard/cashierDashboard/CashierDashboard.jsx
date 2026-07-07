import React from "react";
import { useLocation } from "react-router-dom";
import { CashierOrders } from "./CashierOrders.jsx";
import { CashierPayments } from "./CashierPayments.jsx";
import { CashierReceipts } from "./CashierReceipts.jsx";
import { AdminPOS } from "../adminDashboard/AdminPos.jsx";

export function CashierDashboard() {
  const location = useLocation();

  if (location.pathname === "/cashier/orders") {
    return <CashierOrders />;
  }
  
  if (location.pathname === "/cashier/payments") {
    return <CashierPayments />;
  }

  if (location.pathname === "/cashier/receipts") {
    return <CashierReceipts />;
  }

  // Default to POS Dashboard
  return <AdminPOS />;
}
import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getDashboardStats,
  getAllUsers,
  verifyUser,
  deleteUser,
  getRoleProfile,
  getAllProducts,
  getAllInventory,
  deleteProductAdmin,
  flagProduct,
  getAllOrders,
  updateOrderStatusAdmin,
  getAllWallets,
  freezeWallet,
  manualTransaction,
  getWithdrawals,
  processWithdrawal,
  getCODTransactions,
  settleCOD,
  getDisputes,
  resolveDispute,
} from "../controllers/adminController.js";

const router = express.Router();

// Apply protection to all routes
router.use(protect, admin);

// 1. Dashboard
router.get("/stats", getDashboardStats);

// 2. User Management
router.get("/users", getAllUsers);
router.get("/users/:id/role-profile", getRoleProfile);
router.put("/users/:id/verify", verifyUser);
router.delete("/users/:id", deleteUser);

// 3. Products & Inventory
router.get("/products", getAllProducts);
router.delete("/products/:id", deleteProductAdmin);
router.put("/products/:id/flag", flagProduct); // ?type=product
router.get("/inventory", getAllInventory);
import { deleteInventoryAdmin } from "../controllers/adminController.js";
router.delete("/inventory/:id", deleteInventoryAdmin);
// can reuse flag/delete or specific routes

// 4. Order Management
router.get("/orders", getAllOrders);
router.put("/orders/:id/status", updateOrderStatusAdmin);

// 5. Wallet & Financials
router.get("/wallets", getAllWallets);
router.patch("/wallets/:walletId/freeze", freezeWallet);
router.post("/wallets/transaction", manualTransaction);
router.get("/withdrawals", getWithdrawals);
router.put("/withdrawals/:id", processWithdrawal);

// 6. COD Ledger
router.get("/cod-ledger", getCODTransactions);
router.put("/cod-ledger/:id/settle", settleCOD);

// 7. Disputes
router.get("/disputes", getDisputes);
router.put("/disputes/:id/resolve", resolveDispute);

export default router;

import User from "../models/User.js";
import Farmer from "../models/Farmer.js";
import Collector from "../models/Collector.js";
import Supplier from "../models/Supplier.js";
import Buyer from "../models/Buyer.js";
import Product from "../models/Product.js";
import Inventory from "../models/Inventory.js";
import Order from "../models/Order.js";
import Wallet from "../models/Wallet.js";
import Transaction from "../models/Transaction.js";
import Withdrawal from "../models/Withdrawal.js";
import Activity from "../models/Activity.js";
import Dispute from "../models/Dispute.js";
import OTP from "../models/OTP.js";
import { broadcast } from "../socket.js";

import DeletedUser from "../models/DeletedUser.js";
import DeletedFarmer from "../models/DeletedFarmer.js";
import DeletedCollector from "../models/DeletedCollector.js";
import DeletedSupplier from "../models/DeletedSupplier.js";
import DeletedBuyer from "../models/DeletedBuyer.js";
import DeletedProduct from "../models/DeletedProduct.js";
import DeletedInventory from "../models/DeletedInventory.js";
import DeletedOrder from "../models/DeletedOrder.js";
import DeletedWallet from "../models/DeletedWallet.js";
import DeletedTransaction from "../models/DeletedTransaction.js";
import DeletedWithdrawal from "../models/DeletedWithdrawal.js";
import DeletedActivity from "../models/DeletedActivity.js";
import DeletedDispute from "../models/DeletedDispute.js";
import DeletedOTP from "../models/DeletedOTP.js";

/**
 * Performs a cascading soft delete for a user.
 * @param {string} userId - The ID of the user to delete.
 * @param {string} deletedBy - The status/ID of who performed the delete (e.g. "ADMIN", "SELF").
 * @param {string} reason - The reason for deletion.
 * @returns {Promise<object>} - Result message.
 */
export const performUserDeletion = async (userId, deletedBy, reason) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const userRole = user.role;
  console.log(
    `>>> Starting Cascading Delete for User: ${user.name} (${userRole}), By: ${deletedBy}`,
  );

  // 1. Backup & Delete Role Specific Profile
  let RoleModel, DeletedRoleModel;
  switch (userRole) {
    case "farmer":
      RoleModel = Farmer;
      DeletedRoleModel = DeletedFarmer;
      break;
    case "collector":
      RoleModel = Collector;
      DeletedRoleModel = DeletedCollector;
      break;
    case "supplier":
      RoleModel = Supplier;
      DeletedRoleModel = DeletedSupplier;
      break;
    case "buyer":
      RoleModel = Buyer;
      DeletedRoleModel = DeletedBuyer;
      break;
  }

  // Backup Role Profile separately
  if (RoleModel && DeletedRoleModel) {
    const roleProfile = await RoleModel.findOne({ userId });
    if (roleProfile) {
      const roleData = roleProfile.toObject();
      delete roleData._id;
      await DeletedRoleModel.create({
        ...roleData,
        deletedBy,
        originalCreatedAt: roleProfile.createdAt,
      });
      await RoleModel.findByIdAndDelete(roleProfile._id);
      console.log(
        `>>> Role Profile (${userRole}) backed up to ${DeletedRoleModel.modelName}.`,
      );
    }
  }

  // Backup User Account separately
  const userBackupData = {
    originalUserId: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    role: user.role,
    profileImage: user.profileImage,
    status: user.status,
    docStatus: user.docStatus,
    deletedBy: deletedBy,
    reason: reason || "User deleted",
    originalCreatedAt: user.createdAt,
  };
  await DeletedUser.create(userBackupData);
  console.log(">>> User account backed up to DeletedUser.");

  // 2. Backup & Delete Products / Inventory
  if (["farmer", "collector", "supplier"].includes(userRole)) {
    const ItemModel = userRole === "farmer" ? Product : Inventory;
    const DeletedItemModel =
      userRole === "farmer" ? DeletedProduct : DeletedInventory;

    const items = await ItemModel.find({ userID: userId });
    if (items.length > 0) {
      const itemDataArray = items.map((item) => {
        const d = item.toObject();
        delete d._id;
        return { ...d, deletedBy: "CASCADE_" + deletedBy, originalCreatedAt: item.createdAt };
      });
      await DeletedItemModel.insertMany(itemDataArray);
      await ItemModel.deleteMany({ userID: userId });
      console.log(`>>> ${items.length} items backed up and deleted.`);
    }
  }

  // 3. Backup & Delete Orders
  const orders = await Order.find({
    $or: [{ buyerID: userId }, { sellerID: userId }],
  });
  if (orders.length > 0) {
    const orderDataArray = orders.map((order) => {
      const d = order.toObject();
      d.originalOrderId = d._id;
      delete d._id;
      return {
        ...d,
        deletedBy: deletedBy,
        reason: "Cascade Delete: User Removed",
        originalCreatedAt: order.createdAt,
      };
    });
    await DeletedOrder.insertMany(orderDataArray);
    await Order.deleteMany({
      $or: [{ buyerID: userId }, { sellerID: userId }],
    });
    console.log(`>>> ${orders.length} orders backed up and deleted.`);
  }

  // 4. Backup & Delete Wallet
  const wallet = await Wallet.findOne({ userId });
  if (wallet) {
    const walletData = wallet.toObject();
    delete walletData._id;
    await DeletedWallet.create({
      ...walletData,
      deletedBy,
      originalCreatedAt: wallet.createdAt,
    });
    await Wallet.findByIdAndDelete(wallet._id);
    console.log(`>>> Wallet backed up and deleted.`);
  }

  // 5. Backup & Delete Transactions (where user is seller or buyer)
  const transactions = await Transaction.find({
    $or: [{ sellerId: userId }, { buyerId: userId }],
  });
  if (transactions.length > 0) {
    const transactionDataArray = transactions.map((txn) => {
      const d = txn.toObject();
      delete d._id;
      return { ...d, deletedBy, originalCreatedAt: txn.createdAt };
    });
    await DeletedTransaction.insertMany(transactionDataArray);
    await Transaction.deleteMany({
      $or: [{ sellerId: userId }, { buyerId: userId }],
    });
    console.log(
      `>>> ${transactions.length} transactions backed up and deleted.`,
    );
  }

  // 6. Backup & Delete Withdrawals
  const withdrawals = await Withdrawal.find({ userId });
  if (withdrawals.length > 0) {
    const withdrawalDataArray = withdrawals.map((w) => {
      const d = w.toObject();
      delete d._id;
      return { ...d, deletedBy, originalCreatedAt: w.createdAt };
    });
    await DeletedWithdrawal.insertMany(withdrawalDataArray);
    await Withdrawal.deleteMany({ userId });
    console.log(`>>> ${withdrawals.length} withdrawals backed up and deleted.`);
  }

  // 7. Backup & Delete Activities
  const activities = await Activity.find({ userId });
  if (activities.length > 0) {
    const activityDataArray = activities.map((a) => {
      const d = a.toObject();
      delete d._id;
      return { ...d, deletedBy, originalCreatedAt: a.createdAt };
    });
    await DeletedActivity.insertMany(activityDataArray);
    await Activity.deleteMany({ userId });
    console.log(`>>> ${activities.length} activities backed up and deleted.`);
  }

  // 8. Backup & Delete Disputes
  const disputes = await Dispute.find({
    $or: [{ raisedBy: userId }, { sellerID: userId }],
  });
  if (disputes.length > 0) {
    const disputeDataArray = disputes.map((dis) => {
      const d = dis.toObject();
      delete d._id;
      return { ...d, deletedBy, originalCreatedAt: dis.createdAt };
    });
    await DeletedDispute.insertMany(disputeDataArray);
    await Dispute.deleteMany({
      $or: [{ raisedBy: userId }, { sellerID: userId }],
    });
    console.log(`>>> ${disputes.length} disputes backed up and deleted.`);
  }

  // 9. Backup & Delete OTPs
  const otps = await OTP.find({ email: user.email });
  if (otps.length > 0) {
    const otpDataArray = otps.map((otp) => {
      const d = otp.toObject();
      delete d._id;
      return { ...d, deletedBy, originalCreatedAt: otp.createdAt };
    });
    await DeletedOTP.insertMany(otpDataArray);
    await OTP.deleteMany({ email: user.email });
    console.log(`>>> ${otps.length} OTPs backed up and deleted.`);
  }

  // 10. Finally Delete User
  await User.findByIdAndDelete(userId);

  // Broadcast deletion for global sync (e.g. Active Farmers list)
  broadcast("dashboard:update", { type: "USER_DELETED", userId });

  return {
    success: true,
    message: `User ${user.name} and all related data deleted successfully.`,
  };
};

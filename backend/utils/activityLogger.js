import Activity from "../models/Activity.js";
import { emitToRole } from "../socket.js";

/**
 * Log an activity and emit to admin dashboard
 * @param {Object} activityData - { type, message, detail, userId, metadata }
 */
export const logActivity = async (activityData) => {
  try {
    const activity = await Activity.create(activityData);
    
    // Emit to admin dashboard for real-time updates
    emitToRole("admin", "dashboard:update", {
      type: "ACTIVITY_LOGGED",
      activity: {
        type: activity.type,
        message: activity.message,
        detail: activity.detail,
        time: activity.createdAt,
      },
    });

    return activity;
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

/**
 * Get recent activities
 * @param {Number} limit - Number of activities to fetch
 */
export const getRecentActivities = async (limit = 10) => {
  try {
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return activities.map((a) => ({
      type: a.type,
      message: a.message,
      detail: a.detail || "",
      time: a.createdAt,
    }));
  } catch (error) {
    console.error("Failed to fetch activities:", error);
    return [];
  }
};

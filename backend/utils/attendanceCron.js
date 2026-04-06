const cron = require("node-cron");
const Attendance = require("../models/Attendance");
const User = require("../models/User");

// 🔁 Run every minute
cron.schedule("* * * * *", async () => {
  try {
    console.log("⏳ Running attendance auto-check...");

    const now = new Date();

    // ⏰ Check-in end time (1:30 PM)
    const checkInEnd = new Date();
    checkInEnd.setHours(13, 30, 0, 0);

    // 🕛 Start of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const users = await User.find();

    for (let user of users) {
      let record = await Attendance.findOne({
        user: user._id,
        date: { $gte: today },
      });

      // ❌ No check-in
      if (!record && now > checkInEnd) {
        await Attendance.create({
          user: user._id,
          date: new Date(),
          status: "Absent",
        });

        console.log("❌ Absent (no check-in):", user._id);
      }

      // ❌ No check-out after 8 hours
      if (record && record.checkIn && !record.checkOut) {
        const hours =
          (now - new Date(record.checkIn)) / (1000 * 60 * 60);

        if (hours >= 8 && record.status !== "Absent") {
          record.status = "Absent";
          await record.save();

          console.log("❌ Absent (no check-out):", user._id);
        }
      }
    }
  } catch (err) {
    console.error("Cron error:", err);
  }
});
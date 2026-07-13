const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    checkIn: { type: Date },
    checkOut: { type: Date },
    hoursWorked: { type: Number, default: 0 },
    status: { type: String, enum: ['present', 'late', 'absent'], default: 'present' },
  },
  { timestamps: true }
);

attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);

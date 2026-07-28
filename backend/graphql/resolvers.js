const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const todayStr = () => new Date().toISOString().slice(0, 10);

module.exports = {
  Query: {
    me: (_, __, { user }) => user,

    myAttendance: async (_, __, { user }) => {
      requireAuth(user);
      return Attendance.find({ user: user.id }).populate('user').sort({ date: -1 });
    },

    todayAttendance: async (_, __, { user }) => {
      requireAuth(user);
      return Attendance.findOne({ user: user.id, date: todayStr() }).populate('user');
    },

    myLeaves: async (_, __, { user }) => {
      requireAuth(user);
      return Leave.find({ user: user.id })
        .populate('user reviewedBy')
        .sort({ createdAt: -1 });
    },

    allLeaves: async (_, __, { user }) => {
      requireAdmin(user);
      const leaves = await Leave.find().populate('user reviewedBy').sort({ createdAt: -1 });
      // Drop orphaned records whose user was deleted — the schema requires a
      // non-null Leave.user, so a dangling reference would otherwise fail the query.
      return leaves.filter((l) => l.user);
    },

    allAttendance: async (_, __, { user }) => {
      requireAdmin(user);
      const records = await Attendance.find().populate('user').sort({ date: -1 }).limit(200);
      // Drop orphaned records whose user was deleted (see allLeaves above).
      return records.filter((r) => r.user);
    },

    allEmployees: async (_, __, { user }) => {
      requireAdmin(user);
      return User.find().sort({ createdAt: -1 });
    },

    stats: async (_, __, { user }) => {
      requireAdmin(user);
      const [totalEmployees, presentToday, pendingLeaves, approvedLeaves] =
        await Promise.all([
          User.countDocuments({ role: 'employee' }),
          Attendance.countDocuments({ date: todayStr() }),
          Leave.countDocuments({ status: 'pending' }),
          Leave.countDocuments({ status: 'approved' }),
        ]);
      return { totalEmployees, presentToday, pendingLeaves, approvedLeaves };
    },
  },

  Mutation: {
    register: async (_, { name, email, password, department, position }) => {
      const exists = await User.findOne({ email });
      if (exists) throw new Error('Email already registered');
      const user = await User.create({ name, email, password, department, position });
      return { token: signToken(user.id), user };
    },

    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error('Invalid credentials');
      const ok = await user.matchPassword(password);
      if (!ok) throw new Error('Invalid credentials');
      return { token: signToken(user.id), user };
    },

    checkIn: async (_, __, { user, io }) => {
      requireAuth(user);
      const date = todayStr();
      let record = await Attendance.findOne({ user: user.id, date });
      if (record && record.checkIn) throw new Error('Already checked in today');

      const now = new Date();
      const late = now.getHours() >= 9 && now.getMinutes() > 15;

      record = await Attendance.findOneAndUpdate(
        { user: user.id, date },
        { checkIn: now, status: late ? 'late' : 'present' },
        { new: true, upsert: true }
      ).populate('user');

      io.emit('attendance:update', {
        message: `${user.name} checked in`,
        userId: user.id,
        time: now,
      });
      return record;
    },

    checkOut: async (_, __, { user, io }) => {
      requireAuth(user);
      const date = todayStr();
      const record = await Attendance.findOne({ user: user.id, date });
      if (!record || !record.checkIn) throw new Error('You have not checked in today');
      if (record.checkOut) throw new Error('Already checked out');

      const now = new Date();
      const hours = (now - record.checkIn) / (1000 * 60 * 60);
      record.checkOut = now;
      record.hoursWorked = Math.round(hours * 100) / 100;
      await record.save();
      await record.populate('user');

      io.emit('attendance:update', {
        message: `${user.name} checked out (${record.hoursWorked}h)`,
        userId: user.id,
        time: now,
      });
      return record;
    },

    requestLeave: async (_, args, { user, io }) => {
      requireAuth(user);
      const leave = await Leave.create({ ...args, user: user.id });
      await leave.populate('user');

      io.to('admins').emit('leave:new', {
        message: `${user.name} requested ${args.type} leave`,
        leaveId: leave.id,
      });
      return leave;
    },

    reviewLeave: async (_, { id, status, reviewNote }, { user, io }) => {
      requireAdmin(user);
      if (!['approved', 'rejected'].includes(status))
        throw new Error('Invalid status');

      const leave = await Leave.findByIdAndUpdate(
        id,
        { status, reviewNote, reviewedBy: user.id },
        { new: true }
      ).populate('user reviewedBy');
      if (!leave) throw new Error('Leave not found');

      io.to(`user:${leave.user.id}`).emit('leave:reviewed', {
        message: `Your leave was ${status}`,
        status,
        leaveId: leave.id,
      });
      return leave;
    },
  },
};

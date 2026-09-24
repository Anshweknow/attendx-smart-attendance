const required = (name) => { const value = process.env[name]; if (!value) throw new Error(`${name} is required`); return value; };
const config = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  clientUrl: process.env.CLIENT_URL || '',
  attendanceThreshold: Number(process.env.ATTENDANCE_THRESHOLD || 75),
  validateForServer() { required('MONGO_URI'); required('JWT_SECRET'); required('CLIENT_URL'); if (!Number.isFinite(this.attendanceThreshold) || this.attendanceThreshold < 0 || this.attendanceThreshold > 100) throw new Error('ATTENDANCE_THRESHOLD must be between 0 and 100'); }
};
module.exports = config;

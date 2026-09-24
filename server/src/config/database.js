const mongoose = require('mongoose');
const connectDatabase = async (uri) => mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
module.exports = { connectDatabase };

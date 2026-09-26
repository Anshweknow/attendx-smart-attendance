const mongoose = require('mongoose');

const databaseNameFromUri = (uri) => {
  try {
    const databaseName = new URL(uri).pathname.slice(1);
    return databaseName ? decodeURIComponent(databaseName) : null;
  } catch {
    return null;
  }
};

const connectDatabase = async (uri) => {
  if (!databaseNameFromUri(uri)) process.stderr.write("MONGO_URI does not specify a database name. The application will use MongoDB's default database. For AttendX deployment, explicitly configure the intended database.\n");
  const connection = await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  process.stdout.write(`Connected to MongoDB database: ${connection.connection.name}\n`);
  return connection;
};

module.exports = { connectDatabase, databaseNameFromUri };

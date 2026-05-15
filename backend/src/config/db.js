const mongoose = require('mongoose');

async function connectMongo() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/onshore_reputation';

  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB || undefined
  });

  console.log('Connected to MongoDB');
}

module.exports = connectMongo;


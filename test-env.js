const { MongoClient } = require('mongodb');
const { createClient } = require('redis');

async function testConnections() {
  console.log('Testing Redis connection...');
  try {
    const redisClient = createClient({ url: 'redis://localhost:6379' });
    await redisClient.connect();
    console.log('Redis connected successfully!');
    await redisClient.disconnect();
  } catch (err) {
    console.error('Redis connection failed:', err.message);
  }

  console.log('\nTesting MongoDB connection...');
  try {
    const mongoUri = 'mongodb://localhost:27017/estate-management?directConnection=true';
    const client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 2000 });
    await client.connect();
    console.log('MongoDB connected successfully!');
    const db = client.db('estate-management');
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    await client.close();
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
  }
}

testConnections();

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

export const connectDB = async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB In-Memory Server Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

export const connectTestDatabase = async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri('triviapi_test');

    await mongoose.connect(uri, {
        dbName: 'triviapi_test',
        maxPoolSize: 5,
    });
};

export const disconnectTestDatabase = async () => {
    await mongoose.connection.dropDatabase().catch(() => undefined);
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
        mongoServer = null;
    }
};

export const clearTestDatabase = async () => {
    const collections = mongoose.connection.collections;
    await Promise.all(
        Object.values(collections).map((collection) => collection.deleteMany({}))
    );
};

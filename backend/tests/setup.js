
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

jest.setTimeout(60000);

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();

    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 30000
    });
}, 60000);

afterEach(async () => {
    if (mongoose.connection.readyState === 1) {
        const collections = mongoose.connection.collections;

        for (const key of Object.keys(collections)) {
            await collections[key].deleteMany({});
        }
    }
}, 30000);

afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    if (mongoServer) {
        await mongoServer.stop();
    }
}, 30000);
                                                                                                                                                                                                                                                    
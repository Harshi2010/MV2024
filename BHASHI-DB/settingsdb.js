const mongoose = require('mongoose');
const config = require('../config');
const EnvVar = require('./envdb');

const defaultEnvVariables = [
    { key: 'PREFIX', value: '.' },
    { key: 'MODE', value: 'public' },
    { key: 'AUTO_STATUS_READ', value: 'false' },
    { key: 'AUTO_READ_MSG', value: 'false' },
    { key: 'AUTO_READ_CMD', value: 'false' },
    { key: 'AUTO_BIO', value: 'false' },
    { key: 'ALWAYS_RECORDING', value: 'false' },
    { key: 'ALWAYS_TYPING', value: 'false' },
    { key: 'OWNER_REACT', value: '😎' },
    { key: 'OWNER_NUMBER', value: '94xxxxxxxx' },
    { key: 'AUTO_AI_CHAT', value: 'false' },
    { key: 'LANGUAGE', value: 'SI' },
    { key: 'NSFW_CMD', value: 'true' },
    { key: 'ANTI_LINK', value: 'true' }
];

// MongoDB connection function
const connectDB = async () => {
    try {
        await mongoose.connect(config.MONGODB);
        console.log('MongoDB Connected ✅');

        // Check and create default environment variables
        for (const envVar of defaultEnvVariables) {
            const existingVar = await EnvVar.findOne({ key: envVar.key });

            if (!existingVar) {
                // Create new environment variable with default value
                await EnvVar.create(envVar);
                console.log(`➕ Created default env var: ${envVar.key}`);
            }
        }

    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;

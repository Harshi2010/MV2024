const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}

module.exports = {
  //==========================================- MAIN - CONFIGS -==================================================================
  SESSION_ID: process.env.SESSION_ID || "PMJ3QDRD#aQwUdMyGogIRZxgoR4oe6cpxUTwdtJFSW3lDoxEIcvs",
  MONGODB: process.env.MONGODB || "mongodb+srv://dragon:v11@cluster0.7tfnvps.mongodb.net/",
 
};

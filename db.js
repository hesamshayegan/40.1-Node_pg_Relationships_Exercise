/** Database setup for BizTime. */

// Import the `pg` library, which provides access to PostgreSQL databases
const { Client } = require("pg");

// Create a new PostgreSQL client
const client = new Client({
  // The connection string for the PostgreSQL database
  connectionString: "postgresql:///biztime"
});

// Connect to the PostgreSQL database
client.connect();

// Export the client object so that it can be used by other parts of the application
module.exports = client;

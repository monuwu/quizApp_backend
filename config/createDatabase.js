require('dotenv').config();

async function createDatabaseIfNotExists() {
  // Neon DB is managed and provisioned via the Neon dashboard.
  // No need to create databases programmatically.
  console.log('✅ Using Neon DB. Database creation is managed by Neon. No action needed.');
}

module.exports = { createDatabaseIfNotExists };

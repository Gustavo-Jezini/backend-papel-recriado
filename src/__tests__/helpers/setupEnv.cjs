// Loads .env.test before any project module is imported by Jest.
// Must be CommonJS (.cjs) so it runs without ESM transform.
require('dotenv').config({ path: '.env.test', override: true });

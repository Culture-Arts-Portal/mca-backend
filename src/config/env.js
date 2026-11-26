require('dotenv').config({ quiet: true });

// The app refuses to start if one of these is missing, instead of failing later in a confusing way.
const required = [
  'DATABASE_URL',   // read by Prisma (src/config/db.js)
  'PORT',
  'CORS_ORIGIN',
  'JWT_SECRET'
];
for (const name of required) {
    if (!process.env[name]) throw new Error(`Missing environment variable ${name}`);
}
if(process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be at least 32 characters');

module.exports = {
    port: Number(process.env.PORT),
    corsOrigin: process.env.CORS_ORIGIN,
    nodeEnv: process.env.NODE_ENV|| 'development',
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h'
};

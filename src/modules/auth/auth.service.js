// src/modules/auth/auth.service.js
// The auth logic: hashing, saving users and making tokens. No req/res in here.
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/db');
const env = require('../../config/env');
const AppError = require('../../utils/AppError');

const BCRYPT_COST = 12;

// The only user fields that may ever leave the server. passwordHash is NOT here.
const PUBLIC_USER = { id: true, name: true, email: true, phone: true, role: true };

function signToken(user) {
  return jwt.sign(
    { sub: String(user.id), role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn, algorithm: 'HS256' }
  );
}

exports.register = async ({ name, email, password, phone }) => {
  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

  let user;
  try {
    user = await prisma.user.create({
      data: { name, email, phone, passwordHash },
      select: PUBLIC_USER,
    });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new AppError(409, 'An account with this email already exists');
    }
    throw err;
  }

  return { token: signToken(user), user };
};

exports.signToken = signToken;   // login (step 6) will reuse it
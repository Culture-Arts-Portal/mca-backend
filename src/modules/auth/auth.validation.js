//src/modules/auth/auth.validation.js
//Checks the register body against API.md and returns ONLY the allowed fields.
const AppError = require('../../utils/AppError');

exports.validateRegister = (body) => {
    body = body || {};
    const { name, email, password, phone } = body;
  //name
    if (typeof name !== 'string' || name.trim()=== ''){
        throw new AppError (400, 'Name is required');
    }
    const cleanName = name.trim();
    if (cleanName.length < 2 || cleanName.length > 100){
        throw new AppError (400, 'Name must be 2 to 100 characters');
    }
  //email
    if (typeof email !== 'string' || email.trim()=== ''){
        throw new AppError(400, 'Email is required');
    }
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        throw new AppError(400, 'Email is not valid');
    } 
  //Password
    if (typeof password !== 'string' || password === '') {
        throw new AppError(400, 'Password is required');
    }  
    if (password.length < 8 || Buffer.byteLength(password) > 72) {
        throw new AppError(400, 'Password must be 8 to 72 characters (fewer if you use emoji or accents)');
    }
  //Phone 
    let cleanPhone = null;
    if (phone !== undefined && phone !== null && phone !== '') {
        if (typeof phone !== 'string'){
        throw new AppError(400, 'Phone must be a string');
        }
        const m = phone.match(/^(?:0|\+260)(\d{9})$/);
        if (!m) {
          throw new AppError(400, 'Phone is not valid');
        }
        cleanPhone = '0' + m[1];
    } 
    return { name: cleanName, email: cleanEmail, password, phone: cleanPhone };
};

exports.validateLogin = (body) => {
  body = body || {};
  const { email, password } = body;

  if (typeof email !== 'string' || email.trim() === '' ||
      typeof password !== 'string' || password === '') {
    throw new AppError(400, 'Email and password are required');
  }
  // Registration never allows more than 72 bytes, so a longer password can't be right.
  // Refusing it here also stops someone sending a huge password to waste bcrypt time.
  if (Buffer.byteLength(password) > 72) {
    throw new AppError(401, 'Email or password is incorrect');
  }
  return { email: email.trim().toLowerCase(), password };
};
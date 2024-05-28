const jwt = require('jsonwebtoken');

module.exports.generateToken = (user) => {
  const payload = {
    mobile_number: user.mobile_number,
    country_code: user.country_code,
    status: user.status,
    role: user.role,
    _id: user._id
  };
  const expiresInDays = 30;
  const expirationTimeInSeconds = expiresInDays * 24 * 60 * 60;
  return jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: expirationTimeInSeconds });
}

// Verify a JWT token
module.exports.verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    return decoded;
  } catch (error) {
    throw new Error("Token verification failed");
  }
}
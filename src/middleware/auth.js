const jwt = require('jsonwebtoken');
const SECRET_KEY = 'my-secret-key';

const authenticateToken = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) return res.status(401).json({ message: 'Unauthorized User..' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });
    req.user = user;
    next();
  });
};

module.exports = {
  authenticateToken,
}; 


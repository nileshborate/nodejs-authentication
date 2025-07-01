import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mySuperSecretKey';

export const authenticate = (req, res, next) => {
  console.log('headers = ', req.headers.authorization);
  let token = req.headers.authorization?.split(' ')[1];

  if (!token && req.cookies) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).send('Unauthorized - no token');
  }

  //verify
  try {
    const decode = jwt.verify(token, JWT_SECRET);
    req.userId = decode.id;
    console.log('User id = ', decode.id);
    return next();
  } catch (err) {
    return res
      .status(401)
      .send('Unauthorized - Invalid token or expired token');
  }
};

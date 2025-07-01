import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticate } from './middleware/auth.js';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const url = 'mongodb://localhost:27017/';
mongoose
  .connect(url, {
    dbName: 'June2025-FullStack',
  })
  .then(() => console.log('MongoDB Connected.....'))
  .catch((err) => console.log('Error :', err));

//const JWT_SECRET = 'mySuperSecretKey';

const JWT_SECRET = process.env.JWT_SECRET || 'mySuperSecretKey';

//model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});
const User = mongoose.model('user', userSchema);

//this is used to redirection between pages
app.get('/', (req, res) => {
  res.render('login.ejs');
});
app.get('/register', (req, res) => {
  res.render('register.ejs');
});
app.get('/profile', authenticate, async (req, res) => {
  const user = await User.findById(req.userId);
  res.render('profile.ejs', { user });
});
app.get('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: false,
  });
  res.redirect('/');
});

//used after click on submit button
app.post('/login', async (req, res) => {
  console.log('Req body = ', req.body);
  const { email, password } = req.body;

  let user = await User.findOne({ email });

  console.log('User = ', user);
  if (!user) {
    return res.render('login.ejs');
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.render('login.ejs');
  }

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

  res.cookie('token', token, {
    httpOnly: true,
    secure: false,
    maxAge: 3600000, //1h
  });

  return res.render('profile.ejs', { user });
});
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  //check if already registered
  const exists = await User.findOne({ email });

  if (exists) {
    return res.render('register');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const db = await User.create({
    name,
    email,
    password: hashedPassword,
  });
  res.redirect('/');
});

const port = 3000;
app.listen(port, () => console.log(`Server is running on port ${port}`));

import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise'; //mysql driver connect
import { authenticate } from './middleware/auth.js';
import { sequelize } from './models/index.js';
import { User } from './models/user.model.js';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//throw if connection fails
await sequelize.authenticate();

//if you need migrations - create table automatically if not exists
await sequelize.sync();

/*const url = 'mongodb://localhost:27017/';
mongoose
  .connect(url, {
    dbName: 'June2025-FullStack',
  })
  .then(() => console.log('MongoDB Connected.....'))
  .catch((err) => console.log('Error :', err));


const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '1234',
  database: 'june2025',
  waitForConnections: true,
  connectionLimit: 10,
});
*/

//const JWT_SECRET = 'mySuperSecretKey';

const JWT_SECRET = process.env.JWT_SECRET || 'mySuperSecretKey';

//model
/*const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});
const User = mongoose.model('user', userSchema);*/

//this is used to redirection between pages
app.get('/', (req, res) => {
  res.render('login.ejs');
});
app.get('/register', (req, res) => {
  res.render('register.ejs');
});
app.get('/profile', authenticate, async (req, res) => {
  const user = await User.findByPk(req.userId);

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
  //console.log('Req body = ', req.body);
  const { email, password } = req.body;

  let user = await User.findOne({ where: { email } });

  //console.log('User = ', user);
  if (!user) {
    return res.status(401).send('Invalid Email Id');
  }

  //console.log('User = ', user);
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).send('Invalid Password');
  }

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });

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
  const exists = await User.findOne({ where: { email } });

  if (exists) {
    return res.status(401).send('User Already Exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({
    name,
    email,
    password: hashedPassword,
  });

  res.redirect('/');
});

const port = 3000;
app.listen(port, () => console.log(`Server is running on port ${port}`));

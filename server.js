import express from 'express';
import mongoose from 'mongoose';

const app = express();
app.use(express.urlencoded({ extended: true }));

const url = 'mongodb://localhost:27017/';
mongoose
  .connect(url, {
    dbName: 'June2025-FullStack',
  })
  .then(() => console.log('MongoDB Connected.....'))
  .catch((err) => console.log('Error :', err));

app.get('/', (req, res) => {
  res.render('login.ejs');
});

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model('user', userSchema);

//this is used to redirection between pages
app.get('/', async (req, res) => {
  res.render('login.ejs');
});
app.get('/register', async (req, res) => {
  res.render('register.ejs');
});

//used after click on submit button
app.post('/login', async (req, res) => {
  console.log('Req body = ', req.body);
  const { email, password } = req.body;

  let user = await User.findOne({ email });

  console.log('User = ', user);
  if (!user || user.password !== password) {
    return res.render('login.ejs');
  }

  return res.render('profile.ejs', { user });
});
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  const db = await User.create({
    name,
    email,
    password,
  });
  res.redirect('/');
});

const port = 3000;
app.listen(port, () => console.log(`Server is running on port ${port}`));

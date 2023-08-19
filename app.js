const config = require('./utils/config');
const express = require('express');
require('express-async-errors'); 
const app = express();
const cors = require('cors');
const logger = require('./utils/logger');
const blogRouter = require('./controllers/blogs');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');
const middleware = require('./utils/middleware');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user')
const Blog = require('./models/blog')

const url = config.MONGODB_URI;
logger.info('connecting to', url);

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    logger.info('connected to MongoDB');
  })
  .catch((error) => {
    logger.info('error connecting to MongoDB:', error.message);
  });

mongoose.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

app.use(cors());
app.use(express.json());

app.use('/api/login', loginRouter);
app.use('/api/users', usersRouter);

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing');
  app.use('/api/testing', testingRouter);
}

app.use(middleware.tokenExtractor);
app.use(middleware.tokenValidator);

app.use('/api/blogs', blogRouter);

app.post('/api/blogs', async (request, response) => {
  const body = request.body;

  const user = await User.findOne({}); 

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id, 
  });

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  response.status(201).json(savedBlog);
});


app.delete('/api/blogs/:id', async (request, response) => {
  const id = request.params.id;

  await Blog.findByIdAndRemove(id);
  
  response.status(204).end();
});

app.put('/api/blogs/:id', async (request, response) => {
  const id = request.params.id;
  const updatedBlog = request.body;

  const updated = await Blog.findByIdAndUpdate(id, updatedBlog, { new: true });
  
  response.json(updated);
});

app.get('/api/blogs', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
  response.json(blogs);
});


app.post('/api/users', async (request, response) => {
  const body = request.body;

  if (!body.username || !body.password) {
    return response.status(400).json({ error: 'Username and password are required' });
  }

  if (body.username.length < 3 || body.password.length < 3) {
    return response.status(400).json({ error: 'Username and password must be at least 3 characters long' });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(body.password, saltRounds);

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  });

  const savedUser = await user.save();
  response.json(savedUser);
});


app.get('/api/users', async (request, response) => {
  const users = await User.find({}).populate('blogs', { title: 1, url: 1, likes: 1 });
  response.json(users);
});





app.use(middleware.errorHandler);

module.exports = app;

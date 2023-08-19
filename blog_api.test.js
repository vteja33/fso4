const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const helper = require('./list_helper.test');

const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});
  const blogObjects = helper.initialBlogs.map(blog => new Blog(blog));
  const promiseArray = blogObjects.map(blog => blog.save());
  await Promise.all(promiseArray);
});

describe('POST /api/blogs', () => {
  test('a blog with missing likes property defaults to 0', async () => {
    const newBlog = {
      title: 'New Blog Title',
      author: 'New Blog Author',
      url: 'http://example.com/new-blog',
    };

    const response = await api.post('/api/blogs').send(newBlog);
    expect(response.body.likes).toBe(0);
  });

  test('a blog without title and url properties returns status code 400', async () => {
    const newBlog = {
      author: 'New Blog Author',
      likes: 10,
    };

    await api.post('/api/blogs').send(newBlog).expect(400);
  });
});

describe('Deleting a blog post', () => {
  test('succeeds with valid id', async () => {
    const newBlog = new Blog({
      title: 'Test Blog',
      author: 'Test Author',
      url: 'http://test-url.com',
      likes: 10,
    });
    const savedBlog = await newBlog.save();

    await api.delete(`/api/blogs/${savedBlog.id}`).expect(204);

    const blogsAtEnd = await Blog.find({});
    expect(blogsAtEnd).toHaveLength(0);
  });

  test('fails with invalid id', async () => {
    await api.delete('/api/blogs/123456').expect(400);
  });
});

describe('Updating a blog post', () => {
  test('succeeds with valid id', async () => {
    const newBlog = new Blog({
      title: 'Test Blog',
      author: 'Test Author',
      url: 'http://test-url.com',
      likes: 10,
    });
    const savedBlog = await newBlog.save();

    const updatedBlog = {
      title: 'Updated Test Blog',
      author: 'Updated Test Author',
      url: 'http://updated-test-url.com',
      likes: 15,
    };

    const response = await api
      .put(`/api/blogs/${savedBlog.id}`)
      .send(updatedBlog)
      .expect(200);

    expect(response.body.title).toBe(updatedBlog.title);
    expect(response.body.author).toBe(updatedBlog.author);
    expect(response.body.url).toBe(updatedBlog.url);
    expect(response.body.likes).toBe(updatedBlog.likes);
  });

  test('fails with invalid id', async () => {
    const updatedBlog = {
      title: 'Updated Test Blog',
      author: 'Updated Test Author',
      url: 'http://updated-test-url.com',
      likes: 15,
    };

    await api.put('/api/blogs/123456').send(updatedBlog).expect(400);
  });
});


afterAll(() => {
  mongoose.connection.close();
});

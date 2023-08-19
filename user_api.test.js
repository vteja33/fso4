const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const helper = require('./test_helper')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')

describe('Creating a new user', () => {
  test('succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'newuser',
      name: 'New User',
      password: 'password123',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map(user => user.username);
    expect(usernames).toContain(newUser.username);
  });

  test('fails with proper status code and message if username already exists', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'testuser',
      name: 'Test User',
      password: 'password123',
    };

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(response.body.error).toContain('`username` to be unique');

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });

  test('fails with proper status code and message if username or password is invalid', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUserWithShortUsername = {
      username: 'us',
      name: 'Short Username User',
      password: 'password123',
    };

    const newUserWithShortPassword = {
      username: 'newuser2',
      name: 'Short Password User',
      password: 'pw',
    };

    const response1 = await api
      .post('/api/users')
      .send(newUserWithShortUsername)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(response1.body.error).toContain('Username and password must be at least 3 characters long');

    const response2 = await api
      .post('/api/users')
      .send(newUserWithShortPassword)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(response2.body.error).toContain('Username and password must be at least 3 characters long');

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });
});

describe('Getting the list of users', () => {
  test('returns all users', async () => {
    const response = await api.get('/api/users');
    expect(response.body).toHaveLength(initialUsers.length);
  });
});



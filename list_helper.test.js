const listHelper = require('../utils/list_helper');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);

test('blogs are returned as JSON', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

describe('dummy', () => {
  test('dummy returns one', () => {
    const blogs = [];
    const result = listHelper.dummy(blogs);
    expect(result).toBe(1);
  });
});

describe('total likes', () => {
  const listWithOneBlog = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5,
      __v: 0,
    }
  ];

  test('when list has only one blog, equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog);
    expect(result).toBe(5);
  });
});

describe('favorite blog', () => {
  const blogs = [
    {
      _id: '5a422a851b54a676234d17f7',
      title: 'React patterns',
      author: 'Michael Chan',
      url: 'https://reactpatterns.com/',
      likes: 7,
      __v: 0,
    },
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5,
      __v: 0,
    },
  ];

  test('finds the favorite blog', () => {
    const result = listHelper.favoriteBlog(blogs);
    const expected = {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      likes: 12,
    };
    expect(result).toEqual(expected);
  });
});

describe('Author who has the largest amount of blogs', () => {
    test('of empty list is {}', () => {
        const resultEmptyBlogList = listHelper.mostBlogs([])
        expect(resultEmptyBlogList).toEqual({})
    })

    test('when list has only one blog equals to the author of that blog', () => {
        const blog = blogs[0]
        const mostBlogs = listHelper.mostBlogs([blog])
        expect(mostBlogs).toEqual({
            author: blog.author,
            blogs: 1
        })
    })

    test('of a bigger list is calculated right', () => {
        const mostBlogs = listHelper.mostBlogs(blogs)
        expect(mostBlogs).toEqual({
            author: "Robert C. Martin",
            blogs: 3
        })
    })
})

describe('Author whose blog posts have the largest amount of likes', () => {
    test('of empty list is {}', () => {
        const resultEmptyBlogList = listHelper.mostLikes([])
        expect(resultEmptyBlogList).toEqual({})
    })

    test('when list has only one blog equals to the author of that blog', () => {
        const blog = blogs[0]
        const mostBlogs = listHelper.mostLikes([blog])
        expect(mostBlogs).toEqual({
            author: blog.author,
            likes: 7
        })
    })

    test('of a bigger list is calculated right', () => {
        const mostBlogs = listHelper.mostLikes(blogs)
        expect(mostBlogs).toEqual({
            author: "Edsger W. Dijkstra",
            likes: 17
        })
    })
})

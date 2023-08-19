const _ = require('lodash');


const dummy = (blogs) => {
  // ...
  return 1;
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0);
};

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return {};
  } else {
    const authorCounts = _.countBy(blogs, 'author');
    const mostFrequent = _.maxBy(_.keys(authorCounts), (author) => authorCounts[author]);
    return {
      author: mostFrequent,
      blogs: authorCounts[mostFrequent],
    };
  }
};

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return {};
  } else {
    const groupedByAuthor = _.groupBy(blogs, 'author');
    const authorLikes = _.mapValues(groupedByAuthor, (blogs) => _.sumBy(blogs, 'likes'));
    const mostLikedAuthor = _.maxBy(_.keys(authorLikes), (author) => authorLikes[author]);
    return {
      author: mostLikedAuthor,
      likes: authorLikes[mostLikedAuthor],
    };
  }
};



module.exports = {
  dummy,
  totalLikes,
  mostBlogs,
  mostLikes
};


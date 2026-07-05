const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const API_BASE_URL = "http://localhost:5000";


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }

  if (isValid(username)) {
    return res.status(409).json({message: "User already exists"});
  }

  users.push({username, password});
  return res.status(200).json({message: "User successfully registered. Now you can login"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book);
  }

  return res.status(404).json({message: "Book not found"});
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author.toLowerCase();
  const matchingBooks = Object.fromEntries(
    Object.entries(books).filter(([, book]) => book.author.toLowerCase() === author)
  );

  if (Object.keys(matchingBooks).length > 0) {
    return res.status(200).json(matchingBooks);
  }

  return res.status(404).json({message: "No books found for this author"});
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title.toLowerCase();
  const matchingBooks = Object.fromEntries(
    Object.entries(books).filter(([, book]) => book.title.toLowerCase() === title)
  );

  if (Object.keys(matchingBooks).length > 0) {
    return res.status(200).json(matchingBooks);
  }

  return res.status(404).json({message: "No books found with this title"});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({message: "Book not found"});
  }

  if (Object.keys(book.reviews).length === 0) {
    return res.status(200).json({message: "No reviews found for this book."});
  }

  return res.status(200).json(book.reviews);
});

const getAllBooks = async () => {
  const response = await axios.get(`${API_BASE_URL}/`);
  return response.data;
};

const getBookByISBN = async (isbn) => {
  const response = await axios.get(`${API_BASE_URL}/isbn/${isbn}`);
  return response.data;
};

const getBookByAuthor = async (author) => {
  const response = await axios.get(`${API_BASE_URL}/author/${encodeURIComponent(author)}`);
  return response.data;
};

const getBookByTitle = async (title) => {
  const response = await axios.get(`${API_BASE_URL}/title/${encodeURIComponent(title)}`);
  return response.data;
};

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBookByAuthor = getBookByAuthor;
module.exports.getBookByTitle = getBookByTitle;

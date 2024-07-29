/**
 * Author: Dustin Craven
 * Date: 7/28/2024
 * File Name: app.spec.js
 * Description: Testing file for In-N-Out-Books App
 */

// Require statements for In-N-Out-Books app and supertest
const request = require('supertest');
const app = require('../src/app');

// Test suite for week 4 assignment (Chapter 3 of textbook)
describe("Chapter 3: API Tests", () => {
  // Test case for getting all books
  it("Should return an array of books.", async () => {
    const res = await request(app).get("/api/books");

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);

    res.body.forEach((book) => {
      expect(book).toHaveProperty("id");
      expect(book).toHaveProperty("title");
      expect(book).toHaveProperty("author");
    });
  });

  // Test case for getting a book by it's id
  it("Should return a single book.", async () => {
    const res = await request(app).get("/api/books/5");

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("id", 5);
    expect(res.body).toHaveProperty("title", "The Return of the King");
    expect(res.body).toHaveProperty("author", "J.R.R. Tolkien");
  });

  // Test case for status code 400 if entered id is not a number
  it("Should return a 400 error if the id is not a number", async () => {
    const res = await request(app).get("/api/books/foo");

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("Input Was Not Valid. Id must be a number.");
  });
});

// Test suite for week 5 assignment (Chapter 4 of textbook)
describe("Chapter 4: API Tests", () => {
  // Test case for adding a new book to mock database
  it("Should return a 201-status code when adding a new book.", async () => {
    const res = await request(app).post("/api/books").send({id: 6, title: "The Hobbit", author: "J. R. R. Tolkien"});

    expect(res.statusCode).toEqual(201);
  });

  // Test case for 400 error when new book is missing title
  it("Should return a 400-status code when adding a new book with missing title.", async () => {
    const res = await request(app).post("/api/books").send({id: 7,  author: "J. R. R. Tolkien"});

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("Bad Request");
  });

  // Test case for deleting a book from mock database
  it("Should return a 204-status code when deleting a book.", async () => {
    const res = await request(app).delete("/api/books/6");

    expect(res.statusCode).toEqual(204);
  });
});
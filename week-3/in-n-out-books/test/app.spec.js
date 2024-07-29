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

// Test suite for week 6 assignment (Chapter 5 of textbook)
describe("Chapter 5: API Tests", () => {
  // Test case for updating a book in the mock database
  it("Should update a book and return a 204-status code.", async () => {
    const res = await request(app).put("/api/books/5").send({
      id: 5,
      title: "Harry Potter and the Prisoner of Azkaban",
      author: "J.K. Rowling"
    });

    expect(res.statusCode).toEqual(204);
  });

  // Test case for status code 400 if entered id is not a number
  it("Should return a 400 status code when updating a recipe with a non-numeric id.", async () => {
    const res = await request(app).put("/api/books/foo").send({
      title: "Test",
      author: "Test"
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("Input Was Not Valid. Id must be a number.");
  });

  // Test case for status code 400 if trying to update a book with missing/extra keys
  it("Should return a 400 status code when updating a recipe with missing keys or extra keys.", async () => {
    const res1 = await request(app).put("/api/books/1").send({
      title: "Test Book"
    });

    expect(res1.statusCode).toEqual(400);
    expect(res1.body.message).toEqual("Bad Request");

    const res2 = await request(app).put("/api/books/1").send({
      title: "Test Book",
      author: "Test Author",
      extraKey: "extra"
    });

    expect(res2.statusCode).toEqual(400);
    expect(res2.body.message).toEqual("Bad Request");
  });
});

// Test suite for week 7 assignment (Chapter 6 of textbook)
describe("Chapter 6: API Tests", () => {
  // Test case for authenticating a user login
  it("should log a user in and return a 200-status with 'Authentication successful' message.", async () => {
    const res = await request(app).post("/api/login").send({
      email: "harry@hogwarts.edu",
      password: "potter"
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual("Authentication successful");
  });

  // Test case for status 401 when a login has incorrect credentials
  it("Should return a 401-status code with ‘Unauthorized’ message when logging in with incorrect credentials.", async () => {
    const res = await request(app).post("/api/login").send({
      email: "harry@hogwarts.edu",
      password: "hedwig"
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual("Unauthorized");
  });

  // Test case for status 400 if email or password are missing from login
  it("Should return a 400-status code with ‘Bad Request’ when missing email or password.", async () => {
    const res1 = await request(app).post("/api/login").send({
      email: "harry@hogwarts.edu"
    });

    expect(res1.statusCode).toEqual(400);
    expect(res1.body.message).toEqual("Bad Request");

    const res2 = await request(app).post("/api/login").send({
      password: "potter"
    });

    expect(res2.statusCode).toEqual(400);
    expect(res2.body.message).toEqual("Bad Request");
  });
});

// Test suite for week 8 assignment (Chapter 7 of textbook)
describe("Chapter 7: API Tests", () => {
  // Test case for successful answered security questions
  it("Should return a 200 status with ‘Security questions successfully answered’ message.", async () => {
    const res = await request(app).post("/api/users/harry@hogwarts.edu/verify-security-question").send({
      securityQuestions: [
        { answer: "Hedwig" },
        { answer: "Quidditch Through the Ages" },
        { answer: "Evans" }
      ]
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual("Security questions successfully answered");
  });

  // Test case for status 400 if the entry does not pass the validator
  it("should return 400 status code with 'Bad Request' message when the request body fails ajv validation.", async () => {
    const res = await request(app).post("/api/users/harry@hogwarts.edu/verify-security-question").send({
      securityQuestions: [
        { question: "What is your pet's name?", answer: "Hedwig" },
        { question: "What is your favorite book?", answer: "Quidditch Through the Ages" },
        { question: "What is your mother's maiden name?", answer: "Evans" }
      ]
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("Bad Request");
  });

  // Test case for status 401 if any of the entered answers are incorrect
  it("should return 401 status code with 'Unauthorized' message when the security questions are incorrect.", async () => {
    const res = await request(app).post("/api/users/harry@hogwarts.edu/verify-security-question").send({
      securityQuestions: [
        { answer: "Fluffy" },
        { answer: "Quidditch Through the Ages" },
        { answer: "Evans" }
      ]
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual("Unauthorized");
  });
});
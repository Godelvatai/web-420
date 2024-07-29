/**
 * Author: Dustin Craven
 * Date: 7/28/2024
 * File Name: app.js
 * Description: Express application for the In-N-Out-Books site app
 */

// Require statements to setup an Express application
const express = require("express");
const bcrypt = require("bcryptjs");
const createError = require("http-errors");

// Creates an Express application
const app = express();

// Require statement for mock database files
const books = require("../database/books");
const users = require("../database/users");

// Require statement and instance of Ajv package
const Ajv = require("ajv");
const ajv = new Ajv();

// Ajv JSON Schema object for validation
const securityQuestionsSchema = {
  type: "object",
  properties: {
    securityQuestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          answer: { type: "string" }
        },
        required: ["answer"],
        additionalProperties: false
      }
    }
  },
  required: ["securityQuestions"],
  additionalProperties: false
};

// app.use statements telling Express to parse incoming requests as JSON payloads
// and to parse incoming urlencoded payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define the port number
const port = process.env.PORT || 3000;

// Define the routes
app.get("/", async (req, res, next) => {
  // HTML content for the landing page
  const html = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="author" content="Dustin Craven">
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>In-N-Out-Books App</title>
      <style>
        body, h1, h2, h3 { margin: 0; padding: 0; border: 0;}
        body {
          background: #424242;
          color: #zf;
          margin: 1.25rem;
          font-size: 1.25rem;
        }
        h1, h2, h3 { color: #EF5350; font-family: 'Emblema One', cursive;}
        h1, h2 { text-align: center }
        h3 { color: #zf; }
        .container { width: 50%; margin: 0 auto; font-family: 'Lora', serif; }
        .book { border: 1px solid #EF5350; padding: 1rem; margin: 1rem 0; }
        .book h3 { margin-top: 0; }
        main a { color: #zf; text-decoration: none; }
        main a:hover { color: #EF5350; text-decoration: underline;}
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <h1>In-N-Out-Books App</h1>
          <h2>Discover and Share Moments That Transport You Into Stories</h2>
        </header>
        <br />
        <main>
          <div class="book">
            <h3>The Fellowship of the Ring</h3>
            <p>Author: J. R. R. Tolkien</p>
          </div>
          <div class="book">
            <h3>Harry Potter and the Philosopher's Stone</h3>
            <p>Author: J.K. Rowling</p>
          </div>
          <div class="book">
            <h3>The Two Towers</h3>
            <p>Author: J. R. R. Tolkien</p>
          </div>
          <div class="book">
            <h3>Harry Potter and the Chamber of Secrets</h3>
            <p>Author: J.K. Rowling</p>
          </div>
          <div class="book">
            <h3>The Return of the King</h3>
            <p>Author: J. R. R. Tolkien</p>
          </div>
        </main>
      </div>
    </body>
  </html>
  `; // end HTML content for the landing page
  res.send(html); // Sends the HTML content to the client
 });

// Route to get all books from mock database
app.get("/api/books", async (req, res, next) => {
  try {
    // Get array of all books and send it as the response
    const allBooks = await books.find();
    res.send(allBooks);
  } catch(err) {
    // Log error message and pass to next middleware
    console.error("Error: ", err.message);
    next(err);
  }
});

// Route to get a single book, matching by the book's id number
app.get("/api/books/:id", async (req, res, next) => {
  try {
    // Parse id as int and store it in a variable
    let { id } = req.params;
    id = parseInt(id);

    // Return 400 error if id is not a number
    if(isNaN(id)) {
      return next(createError(400, "Input Was Not Valid. Id must be a number."));
    }

    // Get the book from the mock database that matches the id entered and send the book as the response
    const book = await books.findOne({ id: id });
    res.send(book);
  } catch(err) {
    // Log error message and pass to next middleware
    console.error("Error: ", err.message);
    next(err);
  }
});

// Route to add a new book
app.post("/api/books", async (req, res, next) => {
  try {
    const newBook = req.body;

    const expectedKeys = ["id", "title", "author"];
    const receivedKeys = Object.keys(newBook);

    if(!receivedKeys.every(key => expectedKeys.includes(key)) || receivedKeys.length !== expectedKeys.length) {
      console.error("Bad Request: Missing keys or extra keys", receivedKeys);
      return next(createError(400, "Bad Request"));
    }

    const result = await books.insertOne(newBook);
    res.status(201).send({ id: result.ops[0].id });
  } catch(err) {
    console.error("Error: ", err.message);
    next(err);
  }
});

// Route to delete a book from mock database
app.delete("/api/books/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await books.deleteOne({ id: parseInt(id) });
    res.status(204).send();
  } catch(err) {
    if(err.message === "No matching item found") {
      return next(createError(410, "Book not found"));
    }

    console.error("Error: ", err.message);
    next(err);
  }
});

// Route to update an existing book in the mock database
app.put("/api/books/:id", async (req, res, next) => {
  try {
    let { id } = req.params;
    id = parseInt(id);
    let book = req.body;

    if(isNaN(id)) {
      return next(createError(400, "Input Was Not Valid. Id must be a number."));
    }

    const expectedKeys = ["id", "title", "author"];
    const receivedKeys = Object.keys(book);

    if(!receivedKeys.every(key => expectedKeys.includes(key)) || receivedKeys.length !== expectedKeys.length) {
      console.error("Bad Request: Missing keys or extra keys", receivedKeys);
      return next(createError(400, "Bad Request"));
    }

    const result = await books.updateOne({ id: id }, book);
    res.status(204).send();
  } catch(err) {
    if(err.message === "No matching item found") {
      return next(createError(404, "Book not found"));
    }
    console.error("Error: ", err.message);
    next(err)
  }
});

// Route to login as an existing user
app.post("/api/login", async (req, res, next) => {
  try {
    // Set user object to user variable
    const user = req.body;

    // Variables for key comparison
    const expectedKeys = ["email", "password"];
    const receivedKeys = Object.keys(user);

    // Check that the user has the correct number of keys
    if(!receivedKeys.every(key => expectedKeys.includes(key)) || receivedKeys.length !== expectedKeys.length) {
      console.error("Bad Request: Missing keys or extra keys", receivedKeys);
      return next(createError(400, "Bad Request"));
    }

    // Use variable to check for a matching user, set variable to null if one isn't found
    let existingUser;
    try {
      existingUser = await users.findOne({ email: user.email });
    } catch(err) {
      existingUser = false;
    }

    // Return 404 error is the user was not found
    if(existingUser === false) {
      return next(createError(404, "User not found"));
    }

    // Compare the entered password to existing user's password
    if(!bcrypt.compareSync(user.password, existingUser.password)) {
      return next(createError(401, "Unauthorized"))
    }

    res.status(200).send({ message: "Authentication successful"});
  } catch(err) {
    console.error("Error: ", err.message);
    next(err);
  }
});

// Route to verify a user's security questions
app.post("/api/users/:email/verify-security-question", async (req, res, next) => {
  try {
    const { email } = req.params;
    const { securityQuestions } = req.body;

    const validate = ajv.compile(securityQuestionsSchema);
    const valid = validate(req.body);

    if(!valid) {
      console.error("Bad Request: Invalid request body", validate.errors);
      return next(createError(400, "Bad Request"));
    }

    const user = await users.findOne({ email: email });

    if(securityQuestions[0].answer !== user.securityQuestions[0].answer || securityQuestions[1].answer !== user.securityQuestions[1].answer || securityQuestions[2].answer !== user.securityQuestions[2].answer) {
      console.error("Unauthorized: Security questions do not match");
      return next(createError(401, "Unauthorized"));
    }

    res.status(200).send({ message: "Security questions successfully answered" });
  } catch(err) {
    console.error("Error: ", err.message);
    next(err);
  }
});

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);

  res.json({
    type:'error',
    status: err.status,
    message: err.message,
    stack: req.app.get('env') === 'development' ?err.stack : undefined
  });
});

// Export app
module.exports = app;
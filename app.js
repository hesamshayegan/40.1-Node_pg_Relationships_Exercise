/** BizTime express application. */


// Import the Express library
const express = require("express");
// Create a new Express application
const app = express();
// Import the custom ExpressError class
const ExpressError = require("./expressError");

//***to be functional in both routes I need to export router -> module.exports = router ***//
// Import the companiesRoutes module
const companiesRoutes = require("./routes/companies");
// Import the invoicesRoutes module
const invoicesRoutes = require("./routes/invoices");

// Use the json() middleware to parse incoming JSON requests
app.use(express.json());

// Use the companiesRoutes module to define routes for the /companies endpoint
app.use("/companies", companiesRoutes);
// Use the invoicesRoutes module to define routes for the /invoices endpoint
app.use("/invoices", invoicesRoutes);


/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});


module.exports = app;

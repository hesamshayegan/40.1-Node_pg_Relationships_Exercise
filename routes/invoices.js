/** Routes for invoices. */


// Import the Express library
const express = require("express");
// Import the custom ExpressError class
const ExpressError = require("../expressError");
// Import the database connection module
const db = require("../db");
// Create a new Express router
let router = express.Router();

// This router will be used to define routes for the /invoices endpoint

router.get('/', async (req, res, next) => {
    try {
      const result = await db.query('SELECT * FROM invoices');
      return res.json({ "invoices": result.rows })
    } catch (e) {
      return next(e);
    }
});


router.get("/:id", async function (req, res, next) {
    try {
        let id = req.params.id;

        const invResult = await db.query(
            `SELECT i.id, 
                    i.comp_code, 
                    i.amt, 
                    i.paid, 
                    i.add_date, 
                    i.paid_date, 
                    c.name, 
                    c.description 
            FROM invoices AS i
                INNER JOIN companies AS c ON (i.comp_code = c.code)  
            WHERE id = $1`,
            [id]);

        if (invResult.rows.length === 0) {
            throw new ExpressError(`No such an invoice: ${id}`, 404)
        }

        const data = invResult.rows[0];
        const invoice = {
            id: data.id,
        company: {
            code: data.comp_code,
            name: data.name,
            description: data.description,
        },
        amt: data.amt,
        paid: data.paid,
        add_date: data.add_date,
        paid_date: data.paid_date,
        }

        return res.json({"invoice": invoice});
    }
  
    catch (err) {
      return next(err);
    }
    
  });

  router.post("/", async function (req, res, next) {
    try {
      let {comp_code, amt} = req.body;
  
      const result = await db.query(
            `INSERT INTO invoices (comp_code, amt) 
             VALUES ($1, $2) 
             RETURNING *`,
          [comp_code, amt]);
  
      return res.status(201).json({"invoice": result.rows[0]});
    }
  
    catch (err) {
      return next(err);
    }
});


router.put("/:id", async function (req, res, next) {
    try {
        let {amt, paid} = req.body;
        let id = req.params.id;
        let paidDate = null;

        const currResult = await db.query(
            `SELECT paid
            FROM invoices
            WHERE id = $1`,
            [id])

        if (currResult.rows.length === 0) {
            throw new ExpressError(`No such invoice: ${id}`, 404);
        }

    const currPaidDate = currResult.rows[0].paid_date;
    
    // If paying unpaid invoice: sets paid_date to today
    //If un-paying: sets paid_date to null
    // Else: keep current paid_date
    if (!currPaidDate && paid) {
        paidDate = new Date();
    } else if (!paid) {
        paidDate = null
    } else {
        paidDate = currPaidDate
    }

    const result = await db.query(
            `UPDATE invoices
            SET amt = $1, paid=$2, paid_date=$3
            WHERE id=$4
            RETURNING *`,
            [amt, paid, paidDate, id]);

            return res.json({"invoice": result.rows[0]});
    }
    catch(e) {
        return next(e)
    }

})

router.delete("/:id", async function (req, res, next) {
    try {
      let id = req.params.id;
  
      const result = await db.query(
            `DELETE FROM invoices
             WHERE id = $1
             RETURNING id`,
          [id]);
  
      if (result.rows.length === 0) {
        throw new ExpressError(`No such invoice: ${id}`, 404);
      }
  
      return res.json({"status": "deleted"});
    }
  
    catch (err) {
      return next(err);
    }
});


module.exports = router;
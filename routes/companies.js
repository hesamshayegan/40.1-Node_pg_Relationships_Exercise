/** Routes for companies. */


// Import the Express library
const express = require("express");
// Import the Slugify library
const slugify = require("slugify");
// Import the custom ExpressError class
const ExpressError = require("../expressError");
// Import the database connection module
const db = require("../db");
// Create a new Express router
let router = express.Router();

// This router will be used to define routes for the /companies endpoint


router.get('/', async (req, res, next) => {
    try {
      const result = await db.query('SELECT * FROM companies ORDER BY name');
      return res.json({ "companies": result.rows })
    } catch (e) {
      return next(e);
    }
})


router.get('/:code', async (req, res, next) => {
  try {
    // debugger;
    const { code } = req.params
    
    const compResult = await db.query(
      `SELECT * FROM companies 
      WHERE code=$1`, [code]);
    

    const invResult = await db.query(
      `SELECT id
       FROM invoices
       WHERE comp_code = $1`,
    [code]
    );  
    
    if (compResult.rows.length === 0) {
      throw new ExpressError(`No such company: ${code}`, 404)
    }

    const company = compResult.rows[0];
    const invoices = invResult.rows;
    
    company.invoices = invoices.map(inv => inv.id);

    return res.json({ "company": company})

  } catch (e) {
    return next(e);
  }
})


router.post('/', async (req, res, next) => {
  try {
    const { name, description } = req.body
    const code = slugify(name, {lower: true})
    
    const compResult = await db.query(
          `INSERT INTO companies (code, name, description)
          VALUES ($1, $2, $3)
          RETURNING *`,
          [code, name, description]);
    
    const company = compResult.rows[0];

    return res.status(201).json({"company": company})
  } 
  catch (e) {
    return next(e);
  }
});


router.put('/:code', async (req, res, next) => {
  try {
      const { name, description } = req.body;
      const code = req.params.code

      const compResult = await db.query(
        `UPDATE companies 
        SET name=$1, description=$2
        WHERE code=$3
        RETURNING *`,
        [name, description, code]);
      

      if (compResult.rows.length === 0) {
      throw new ExpressError(`No such company: ${code}`, 404)
    }
      else {
        return res.json({"company": compResult.rows[0]});
      }
      

  }   catch(e){
        return next(e)
  }
})

router.delete('/:code', async (req, res, next) => {
  try {

      const code = req.params.code
      const compResult = await db.query(
        `DELETE FROM companies
        WHERE code=$1 RETURNING *`,
        [code]);
      if (compResult.rows.length == 0) {
        throw new ExpressError(`No such company: ${code}`, 404)
      }
      else {
        return res.send({ status: "deleted" });

      }
  }

    catch(e){
      return next(e)
  } 
})




module.exports = router;
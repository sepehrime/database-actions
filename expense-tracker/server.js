import express from "express";
import { pool } from "./db.js";

const app = express();
app.use(express.json());
app.use(express.static("public"));

/** List all categories, for the "add expense" dropdown. */
app.get("/api/categories", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, name FROM categories ORDER BY name",
  );
  res.json(rows);
});

/** List expenses, newest first, with the category name joined in. */
app.get("/api/expenses", async (req, res) => {
  const { rows } = await pool.query(`
    SELECT e.id, e.description, e.amount, e.spent_on, c.name AS category
    FROM expenses e
    JOIN categories c ON c.id = e.category_id
    ORDER BY e.spent_on DESC, e.id DESC
  `);
  res.json(rows);
});

/**
 * Add an expense. Body: { description, amount, spent_on, category_id }.
 * Values travel as $1..$4 parameters, never pasted into the SQL string,
 * so user input cannot change the query itself (SQL injection).
 */
app.post("/api/expenses", async (req, res) => {
  const { description, amount, spent_on, category_id } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO expenses (description, amount, spent_on, category_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, description, amount, spent_on, category_id`,
    [description, amount, spent_on, category_id],
  );
  res.status(201).json(rows[0]);
});

/** Total spent per month, oldest first. */
app.get("/api/totals/by-month", async (req, res) => {
  const { rows } = await pool.query(`
    SELECT to_char(date_trunc('month', spent_on), 'YYYY-MM') AS month,
           SUM(amount) AS total
    FROM expenses
    GROUP BY 1
    ORDER BY 1
  `);
  res.json(rows);
});

/**
 * Total spent per category. Should return rows shaped like:
 *   [{ "category": "Rent", "total": "10000.00" }, ...]
 */
app.get("/api/totals/by-category", async (req, res) => {
  // TODO(Jay): write the SQL for totals by category.
  const sql = ` SELECT c.name AS category, SUM(e.amount) AS total
  FROM  expenses e
  JOIN categories c 
  ON c.id = e.category_id
  GROUP BY c.id, c.name
  ORDER BY total DESC `;
  const { rows } = await pool.query(sql);
  res.json(rows);
});

// Postgres errors (bad input, failed CHECK, missing foreign key) become a 400 with the message.
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(400).json({ error: err.message });
});

const port = process.env.PORT ?? 3000;
app.listen(port, () =>
  console.log(`Expense tracker on http://localhost:${port}`),
);

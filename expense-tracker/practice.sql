-- SQL basics practice on the expenses database.
-- Write each query under its exercise, run it in psql, and check the row count hint.

-- 1. All expenses over $100, biggest first. (6 rows)
SELECT description, amount FROM expenses
WHERE amount>100
ORDER BY amount DESC;

-- 2. The 3 most expensive expenses that are NOT rent. (3 rows)
SELECT e.description, e.amount FROM expenses e
JOIN categories c
ON c.id = e.category_id
WHERE c.name <>'Rent'
ORDER BY e.amount DESC
LIMIT 3;

-- 3. How many coffees did you buy, and how much did they cost in total? (1 row)
SELECT COUNT(*) AS coffee_count, SUM(amount) AS total FROM expenses
WHERE description ILIKE '%coffee%';

-- 4. Every expense in October 2026, oldest first. (5 rows)
SELECT * FROM expenses
WHERE spent_on >= DATE '2026-10-01'
AND spent_on < DATE '2026-11-01'
ORDER BY spent_on;

-- 5. Every "Fun" expense with its date, description and amount.
--    Filter on the category NAME, not the id, so you need a JOIN. (7 rows)
SELECT e.spent_on, e.description, e.amount FROM expenses e
JOIN categories c ON c.id = e.category_id
WHERE c.name = 'Fun';

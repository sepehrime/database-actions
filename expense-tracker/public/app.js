const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/** Today's local date as YYYY-MM-DD (valueAsDate would use UTC and can be off by a day). */
const today = () => new Date().toLocaleDateString('en-CA');

/** Fetch JSON from the API; throws with the server's error message on failure. */
async function api(path, options) {
  const res = await fetch(path, options);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error);
  return body;
}

/** Replace a table body's rows. Each row is an array of [text, className?] cells. */
function fillTable(selector, rows) {
  const tbody = document.querySelector(`${selector} tbody`);
  tbody.replaceChildren(...rows.map((cells) => {
    const tr = document.createElement('tr');
    for (const [text, cls] of cells) {
      const td = document.createElement('td');
      td.textContent = text;
      if (cls) td.className = cls;
      tr.append(td);
    }
    return tr;
  }));
}

async function loadCategories() {
  const categories = await api('/api/categories');
  const select = document.querySelector('select[name="category_id"]');
  select.replaceChildren(...categories.map((c) => new Option(c.name, c.id)));
}

async function loadExpenses() {
  const expenses = await api('/api/expenses');
  fillTable('#expenses', expenses.map((e) => [
    [e.spent_on], [e.description], [e.category], [money.format(e.amount), 'num'],
  ]));
}

async function loadTotals() {
  const [byCategory, byMonth] = await Promise.all([
    api('/api/totals/by-category').catch(() => []),
    api('/api/totals/by-month'),
  ]);
  fillTable('#by-category', byCategory.map((r) => [[r.category], [money.format(r.total), 'num']]));
  fillTable('#by-month', byMonth.map((r) => [[r.month], [money.format(r.total), 'num']]));
}

document.querySelector('#add-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;
  const error = document.querySelector('#form-error');
  error.textContent = '';
  try {
    await api('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });
    form.reset();
    form.spent_on.value = today();
    await Promise.all([loadExpenses(), loadTotals()]);
  } catch (err) {
    error.textContent = err.message;
  }
});

document.querySelector('input[name="spent_on"]').value = today();
loadCategories();
loadExpenses();
loadTotals();

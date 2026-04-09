const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = 3001;
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "taskapp"
});

app.use(cors());
app.use(express.json());

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL
    )
  `);

  await pool.query(`
    ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Pendiente',
    ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'Media',
    ADD COLUMN IF NOT EXISTS estimated_hours INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS due_date DATE,
    ADD COLUMN IF NOT EXISTS owner_name TEXT NOT NULL DEFAULT 'Equipo'
  `);

  const existing = await pool.query("SELECT COUNT(*)::int AS count FROM tasks");
  if (existing.rows[0].count === 0) {
    await pool.query(
      `INSERT INTO tasks
        (title, description, status, priority, estimated_hours, due_date, owner_name)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7),
        ($8, $9, $10, $11, $12, $13, $14)`,
      [
        "Preparar despliegue Docker",
        "Revisar el compose, comprobar puertos y validar persistencia.",
        "En progreso",
        "Alta",
        3,
        "2026-04-15",
        "Daniel",
        "Migrar manifiestos a Kubernetes",
        "Crear deployments y services equivalentes para frontend y backend.",
        "Pendiente",
        "Media",
        5,
        "2026-04-18",
        "Equipo DevOps"
      ]
    );
  }
}

async function waitForDb(retries = 10, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await initDb();
      return;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }

      console.log(`Waiting for database... attempt ${attempt} of ${retries}`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

app.get("/tasks", async (req, res) => {
  const result = await pool.query(`
    SELECT id, title, description, status, priority, estimated_hours, due_date, owner_name
    FROM tasks
    ORDER BY id
  `);
  res.json(result.rows);
});

app.post("/tasks", async (req, res) => {
  const {
    title,
    description = "",
    status = "Pendiente",
    priority = "Media",
    estimatedHours = 1,
    dueDate = null,
    ownerName = "Equipo"
  } = req.body;

  const result = await pool.query(
    `INSERT INTO tasks
      (title, description, status, priority, estimated_hours, due_date, owner_name)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, title, description, status, priority, estimated_hours, due_date, owner_name`,
    [title, description, status, priority, estimatedHours, dueDate || null, ownerName]
  );

  res.status(201).json(result.rows[0]);
});

app.put("/tasks/:id", async (req, res) => {
  const {
    title,
    description = "",
    status = "Pendiente",
    priority = "Media",
    estimatedHours = 1,
    dueDate = null,
    ownerName = "Equipo"
  } = req.body;

  const result = await pool.query(
    `UPDATE tasks
    SET
      title = $1,
      description = $2,
      status = $3,
      priority = $4,
      estimated_hours = $5,
      due_date = $6,
      owner_name = $7
    WHERE id = $8
    RETURNING id, title, description, status, priority, estimated_hours, due_date, owner_name`,
    [title, description, status, priority, estimatedHours, dueDate || null, ownerName, req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Task not found" });
  }

  return res.json(result.rows[0]);
});

app.delete("/tasks/:id", async (req, res) => {
  const result = await pool.query(
    "DELETE FROM tasks WHERE id = $1 RETURNING id",
    [req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Task not found" });
  }

  return res.status(204).send();
});

waitForDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database initialization failed", error);
    process.exit(1);
  });

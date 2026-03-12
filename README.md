# AI Prompt Library

A web-based AI Prompt Library for internal product adoption tracking.

## Tech Stack

- **Frontend:** React + Tailwind CSS (Vite)
- **Backend:** Python FastAPI
- **Database:** PostgreSQL with SQLAlchemy ORM

## Pushing to GitHub

From the project root (the folder that contains `docker-compose.yml` and `backend/`):

```bash
git init
git add .
git status   # confirm no .env or venv/ or node_modules/ are staged (they’re in .gitignore)
git commit -m "Initial commit: AI Prompt Library with containerized Postgres"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

If the repo already exists on GitHub and you’re adding to it, skip `git init` and use `git remote add origin ...` only if you don’t already have `origin`. Never commit `backend/.env` or the root `.env` (they contain secrets); the example files (`.env.example`, `.env.docker.example`) are safe and should be committed so others know what to copy.

## Running on another machine (clone from GitHub)

Anyone (or you on another machine) can run the app from the repo like this:

1. **Clone the repo**
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   cd YOUR_REPO_NAME
   ```

2. **Set up the database (container)**  
   Copy the env template, start the container, then create the backend `.env` as in **Option A** below (copy `backend/.env.example` to `backend/.env`, set `DATABASE_URL` to match the container user/password).

3. **Backend**  
   From `backend/`: create a venv, `pip install -r requirements.txt`, `python -m app.create_tables`, then `uvicorn app.main:app --reload`.

4. **Frontend**  
   From `frontend/`: `npm install`, then `npm run dev`.

The README **Setup** section below has the full step-by-step; the only thing not in the repo is the actual `.env` files (each machine creates those from the example files).

## File Structure

```
Prompt Library/
├── backend/
│   ├── .env.example
│   ├── requirements.txt
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── prompt.py
│   │   │   └── vote.py
│   │   ├── schemas/
│   │   │   ├── user.py
│   │   │   ├── prompt.py
│   │   │   └── vote.py
│   │   ├── api/
│   │   │   ├── auth.py
│   │   │   ├── prompts.py
│   │   │   └── export.py
│   │   └── services/
│   │       └── pdf_export.py
│   └── create_tables.py
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── api/
│       │   └── client.js
│       ├── components/
│       │   ├── Layout.jsx
│       │   ├── Login.jsx
│       │   ├── PromptForm.jsx
│       │   ├── PromptList.jsx
│       │   ├── PromptCard.jsx
│       │   └── Filters.jsx
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   └── LoginPage.jsx
│       └── context/
│           └── AuthContext.jsx
└── README.md
```

## Setup

### First-time: what order do I do things?

If you use **Podman (or Docker)** for the database, you do **not** install or configure PostgreSQL on your machine. The container does everything:

1. **You** only set the user name and password in a `.env` file (or use the built-in defaults).
2. **You** start the container with `podman compose up -d`.
3. **The Postgres container** reads that `.env` and automatically creates the user, password, and database inside the container. You never log into Postgres or run SQL yourself.
4. **Your backend** uses the same user/password in its own `.env` to connect to the database on `localhost`.

So: configure the `.env` files first, then start the container, then run the backend. No separate “configure PostgreSQL” step.

---

### Option A: Contain the database with Docker or Podman (recommended)

Run PostgreSQL in a container so you don’t need a local Postgres install.

**Step 1 – Tell the container what user/password/database to create**

From the **project root** (the folder that contains `docker-compose.yml`), copy the example env file. You can edit it to change the user or password, or leave it as-is to use the defaults (`promptlib` / `promptlib` / `prompt_library`):

```bash
cp .env.docker.example .env
# optional: edit .env to set POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
```

**Step 2 – Start the database container**

Run this from the **project root** (the folder that contains `docker-compose.yml` and `.env`). If you run it from `backend/`, the container may not see the root `.env` and can create the wrong user.

This starts Postgres inside the container. It creates the user and database **only the first time** the volume is created. If you already had a container/volume from before you had a proper `.env`, remove the volume and start fresh (see Troubleshooting: "role \"promptlib\" does not exist").

**Docker:**
```bash
cd /path/to/Prompt\ Library
docker compose up -d
```

**Podman:**
```bash
cd /path/to/Prompt\ Library
podman compose up -d
```

**Step 3 – Point the backend at that database**

In the `backend/` folder, create a `.env` file so the Python app can connect. Use the **same** user, password, and database name you used in the root `.env` (or the defaults):

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and set at least:

```
DATABASE_URL=postgresql://promptlib:promptlib@localhost:5432/prompt_library
SECRET_KEY=your-secret-key-for-mock-sso
```

If you changed `POSTGRES_USER` or `POSTGRES_PASSWORD` in the root `.env`, use those same values in `DATABASE_URL`. If you run Podman **rootless** and had to change the port (e.g. to `54320`), use that port in `DATABASE_URL` (e.g. `localhost:54320`).

**Step 4 – Create tables and run the backend**

Still in `backend/`, create the tables and start the API (see “Backend” below). The app will connect to the database in the container; no extra configuration inside the container is needed.

---

Data is stored in a volume (`prompt_library_pgdata`). To remove the DB and start fresh: `docker compose down -v` or `podman compose down -v`.

### Option B: Use a host-installed PostgreSQL

Create the database (e.g. `createdb prompt_library`), set `DATABASE_URL` in `backend/.env`, then run the backend as below.

---

### Backend

Do this from the `backend/` directory. **Use Python 3.11 or 3.12.** Python 3.14 (and other very new releases) are not yet supported by some dependencies (e.g. pydantic-core, psycopg2-binary), and `pip install` may fail with build errors. If you see errors building `pydantic-core` or `psycopg2-binary`, recreate the venv with a supported version (see below).

1. Create a virtual environment and install dependencies:
   ```bash
   cd backend
   # Use Python 3.11 or 3.12 (required for dependencies to install)
   python3.12 -m venv venv
   # or:  py -3.12 -m venv venv     # Windows
   source venv/bin/activate          # macOS/Linux
   # or:  venv\Scripts\activate      # Windows
   pip install -r requirements.txt
   ```

2. Copy `.env.example` to `.env` and set your PostgreSQL connection string (and `SECRET_KEY`). If you used Option A above, you already did this in Step 3.

3. Create the database tables (run as two separate commands):
   ```bash
   python -m app.create_tables
   ```

4. Run the API:
   ```bash
   uvicorn app.main:app --reload
   ```

   Keep the virtual environment **activated** when you run steps 3 and 4 (`venv` should appear in your prompt). If you open a new terminal, `cd backend` and run `source venv/bin/activate` again before using `python` or `uvicorn`.

### Frontend

1. Install and run:
   ```bash
   cd frontend && npm install && npm run dev
   ```

2. Open http://localhost:5173 (or the port Vite shows).

## Troubleshooting

- **`Failed building wheel for pydantic-core` or `psycopg2-binary`** — You are likely using Python 3.14 (or another very new version). Use Python 3.11 or 3.12 instead. Remove the existing venv (`rm -rf venv` in `backend/`), then create a new one with a supported version, e.g. `python3.12 -m venv venv`, activate it, and run `pip install -r requirements.txt` again.
- **`No module named 'dotenv'` / `command not found: uvicorn`** — Activate the virtual environment and install dependencies first (`pip install -r requirements.txt`).
- **`role "user" does not exist`** — Edit `backend/.env` and set `DATABASE_URL=postgresql://promptlib:promptlib@localhost:5432/prompt_library` (and ensure the container is running).
- **`role "promptlib" does not exist`** — Usually one of two causes: (1) **Wrong Postgres:** Another Postgres (e.g. Homebrew) may be using port 5432, so the app talks to that one instead of the container. Check with `podman ps` that `prompt_library_db` is running, and with `lsof -i :5432` (or `netstat`) that the container is listening on 5432. If something else is on 5432, either stop it or in `docker-compose.yml` change `ports` to `"54320:5432"` and in `backend/.env` set `DATABASE_URL=postgresql://promptlib:promptlib@localhost:54320/prompt_library`. (2) **Container created with wrong user:** Recreate the volume. From the **project root**: run `podman compose down -v`, then `podman compose up -d` (ensure root `.env` has `POSTGRES_USER=promptlib`, etc.). Then run `python -m app.create_tables` from `backend/`.

## Features

- **Mock SSO:** Placeholder login (email-based) for real SSO integration later.
- **Prompt submission:** Submit prompts with Category and Product.
- **Help me create a prompt:** Describe what you want; AI generates a structured prompt, then you’re taken to Submit a prompt with the text pre-filled. Requires `OPENAI_API_KEY` in `backend/.env`.
- **Dashboard (Library):** List prompts with filtering (Category, Product) and sorting by votes.
- **Thumbs up:** Vote on prompts (one vote per user per prompt).
- **Test in CX AI Assistant:** Each prompt in the Library has a “Test in CX AI Assistant” link. Clicking it copies the prompt text to your clipboard and opens [CX AI Assistant](https://cxassistant.cisco.com/) in a new tab so you can paste and try the prompt there.
- **Export:** "Save Library" generates a PDF of the current filtered/sorted list.

## Categories

- Customer Baseline
- Feature Adoption
- Outcome Adoption
- QBR Preparation
- Product Name/General

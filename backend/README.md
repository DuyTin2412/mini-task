# Backend

NestJS + Sequelize + PostgreSQL API

## Setup

```bash
npm install
```

Create `.env`:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=123456
DB_NAME=my_project_db
JWT_SECRET=your_secret_key
```

Start PostgreSQL (from project root, where docker-compose.yml is):

```bash
docker-compose up -d
```

## Run

```bash
npm run start:dev
```

Runs on http://localhost:3000. Swagger docs at http://localhost:3000/api.

# MiniTaskManagement
## Structure
```
my-project/
├── backend/     NestJS + Sequelize + PostgreSQL API
├── frontend/    Next.js UI
└── docker-compose.yml   PostgreSQL container
```
## Quick start

1. Start the database:
   ```bash
   docker-compose up -d
   ```
2. Run the backend (see `backend/README.md`):
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```
3. Run the frontend (see `frontend/README.md`):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

Backend: http://localhost:3000 (Swagger at `/api`)
Frontend: http://localhost:3001

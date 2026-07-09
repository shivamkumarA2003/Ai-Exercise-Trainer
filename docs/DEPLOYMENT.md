# Deployment

## Frontend: Vercel
1. Set the project root to `frontend`.
2. Add environment variables from `frontend/.env.example`.
3. Set `NEXT_PUBLIC_API_URL` to the deployed backend URL plus `/api`.
4. Deploy with the default Next.js build command.

## Backend: Render or Railway
1. Set the service root to `backend`.
2. Install dependencies with `pip install -r requirements.txt`.
3. Start with `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`.
4. Add environment variables from `backend/.env.example`.

## Supabase
1. Create a Supabase project.
2. Run `database/schema.sql` in the SQL editor.
3. Enable Google provider in Authentication settings.
4. Add frontend redirect URLs for local and production domains.
5. Use the anon key in the frontend and the service role key only in the backend.

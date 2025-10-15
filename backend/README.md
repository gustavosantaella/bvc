# PyNest service

This is a template for a PyNest service.

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
MONGO_DATABASE=bvc
```

### Vercel Environment Variables

Make sure to configure these environment variables in your Vercel project:

- `MONGO_URL`: Your MongoDB connection string
- `MONGO_DATABASE`: Your MongoDB database name (e.g., "bvc")
- `VERCEL`: Set to "1" (automatically set by Vercel)

## Start Service

## Step 1 - Create environment

- install requirements:

```bash
pip install -r requirements.txt
```

## Step 2 - start service local

1. Run service with main method

```bash
python main.py
```

1. Run service using uvicorn

```bash
uvicorn "app:app" --host "0.0.0.0" --port "8000" --reload
```

## Step 3 - Send requests

Go to the fastapi docs and use your api endpoints - <http://127.0.0.1:8000/docs>

## Deployment

This project has two separate components:

1. **API HTTP** (`main.py`) → Deploy to **Vercel**
2. **WebSocket Client** (`src/ws/bvc.py`) → Deploy to **Railway** or **Render**

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Start

**Deploy API to Vercel:**
```bash
vercel --prod
```

**Deploy WebSocket to Railway:**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway up
```

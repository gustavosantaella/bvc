# Guía de Deployment

Este proyecto tiene dos componentes que requieren diferentes tipos de hosting:

## 🏗️ Arquitectura

```
┌─────────────────────┐
│  Frontend (Vercel)  │
│  - Angular App      │
└──────────┬──────────┘
           │
           ↓ Consume API
┌─────────────────────┐
│  Backend API        │
│  (Vercel)           │ ← Solo API HTTP (main.py)
│  - REST Endpoints   │
└──────────┬──────────┘
           │
           ↓ Lee/Escribe
┌─────────────────────┐
│  MongoDB Atlas      │ ← Base de datos compartida
└──────────┬──────────┘
           ↑
           │ Escribe datos
┌─────────────────────┐
│  WebSocket Client   │
│  (Railway/Render)   │ ← Proceso continuo (bvc.py)
│  - Conexión 24/7    │
└─────────────────────┘
```

## 📦 Deployment

### 1. API HTTP en Vercel

**Qué despliega:** `main.py` - Solo endpoints REST

**Pasos:**
1. Ve a [vercel.com](https://vercel.com)
2. Importa tu repositorio
3. Configura las variables de entorno:
   - `MONGO_URL`: Tu connection string de MongoDB Atlas
   - `MONGO_DATABASE`: Nombre de tu base de datos (ej: `bvc`)

**Archivos relevantes:**
- `vercel.json` - Configuración de Vercel
- `main.py` - Aplicación principal

### 2. WebSocket Client en Railway

**Qué despliega:** `src/ws/bvc.py` - Cliente que se conecta a BVC 24/7

**Pasos:**

#### Opción A: Usando Railway (Recomendado - Gratis)

1. Ve a [railway.app](https://railway.app)
2. Crea una cuenta con GitHub
3. Click en "New Project"
4. Selecciona "Deploy from GitHub repo"
5. Selecciona tu repositorio
6. Configura:
   - **Root Directory**: `backend`
   - **Start Command**: `python src/ws/bvc.py`
7. Agrega variables de entorno:
   - `MONGO_URL`: Tu connection string de MongoDB Atlas
   - `MONGO_DATABASE`: Nombre de tu base de datos

#### Opción B: Usando Render

1. Ve a [render.com](https://render.com)
2. Crea una cuenta
3. Click en "New +" → "Background Worker"
4. Conecta tu repositorio
5. Configura:
   - **Name**: bvc-websocket-client
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python src/ws/bvc.py`
6. Agrega variables de entorno:
   - `MONGO_URL`: Tu connection string de MongoDB Atlas
   - `MONGO_DATABASE`: Nombre de tu base de datos

### 3. MongoDB Atlas (Base de datos)

**Pasos:**
1. Ve a [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Crea una cuenta gratis
3. Crea un cluster (M0 - Free tier)
4. En "Database Access", crea un usuario
5. En "Network Access", agrega `0.0.0.0/0` (permitir desde cualquier IP)
6. Obtén tu connection string
7. Reemplaza `<password>` y `<dbname>` en el string

**Connection String ejemplo:**
```
mongodb+srv://usuario:password@cluster.mongodb.net/bvc?retryWrites=true&w=majority
```

## 🔧 Variables de Entorno

Configura en TODOS los servicios:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `MONGO_URL` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `MONGO_DATABASE` | Nombre de la base de datos | `bvc` |

## 📝 Notas Importantes

### ⚠️ Por qué no todo en Vercel?

**Vercel es serverless:**
- ✅ Perfecto para API HTTP que responden a requests
- ❌ NO puede ejecutar procesos continuos en segundo plano
- ❌ NO puede mantener conexiones WebSocket como cliente

**Railway/Render son servicios tradicionales:**
- ✅ Pueden ejecutar procesos 24/7
- ✅ Perfectos para el cliente WebSocket que debe estar siempre conectado

### 🔄 Flujo de Datos

1. **bvc.py** (en Railway) se conecta al WebSocket de BVC
2. Recibe datos en tiempo real del mercado
3. Guarda los datos en **MongoDB Atlas**
4. **main.py** (en Vercel) lee esos datos de MongoDB
5. El **frontend** consume la API de Vercel

## 🧪 Testing Local

**API HTTP:**
```bash
cd backend
python main.py
# Servidor en http://localhost:8000
```

**WebSocket Client:**
```bash
cd backend
python src/ws/bvc.py
# Se conecta a BVC y guarda datos en MongoDB
```

## 🚀 Comandos Útiles

```bash
# Instalar dependencias
pip install -r requirements.txt

# Ejecutar API
python main.py

# Ejecutar WebSocket client
python src/ws/bvc.py

# Ver logs en Railway
railway logs

# Ver logs en Render
# Desde el dashboard de Render
```

## 📊 Monitoreo

- **Railway**: Dashboard → Logs (tiempo real)
- **Render**: Dashboard → Logs
- **Vercel**: Dashboard → Functions → Logs
- **MongoDB Atlas**: Dashboard → Metrics

## ❓ Troubleshooting

**El WebSocket client no se conecta:**
- Verifica las variables de entorno en Railway/Render
- Revisa los logs del servicio
- Confirma que MongoDB Atlas permite conexiones desde `0.0.0.0/0`

**La API no retorna datos:**
- Verifica que el WebSocket client esté corriendo
- Confirma que hay datos en MongoDB Atlas
- Revisa los logs de Vercel

**Error de conexión a MongoDB:**
- Verifica el connection string
- Confirma que el usuario tiene permisos
- Revisa la configuración de Network Access en Atlas


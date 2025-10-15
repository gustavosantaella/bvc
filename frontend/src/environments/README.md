# 📁 Environments - Variables de Entorno

Esta carpeta contiene los archivos de configuración de variables de entorno para diferentes ambientes del proyecto.

## 📄 Archivos

### `environment.ts` - Desarrollo
Variables para el entorno de **desarrollo** (local).

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  appName: 'BVC Frontend',
  version: '1.0.0'
};
```

### `environment.prod.ts` - Producción
Variables para el entorno de **producción**.

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.tudominio.com/api',
  appName: 'BVC Frontend',
  version: '1.0.0'
};
```

## 🔧 Cómo Usar

### 1. Importar en tu componente o servicio

```typescript
import { environment } from 'src/environments/environment';

export class MiServicio {
  apiUrl = environment.apiUrl;
  
  getData() {
    return this.http.get(`${this.apiUrl}/endpoint`);
  }
}
```

### 2. Ejemplo en un componente

```typescript
import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  template: `<h1>{{ appName }}</h1>`
})
export class AppComponent {
  appName = environment.appName;
  isProduction = environment.production;
}
```

### 3. Ejemplo con HttpClient

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUsers() {
    return this.http.get(`${this.apiUrl}/users`);
  }
}
```

## 🚀 Comandos

### Desarrollo (usa `environment.ts`)
```bash
npm start
# o
ng serve
```

### Producción (usa `environment.prod.ts`)
```bash
npm run build
# o
ng build --configuration=production
```

## ⚙️ Configuración

La configuración de reemplazo de archivos está en `angular.json`:

```json
"fileReplacements": [
  {
    "replace": "src/environments/environment.ts",
    "with": "src/environments/environment.prod.ts"
  }
]
```

## 🔐 Variables Comunes

Puedes agregar más variables según tus necesidades:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  appName: 'BVC Frontend',
  version: '1.0.0',
  
  // APIs externas
  googleMapsApiKey: 'YOUR_API_KEY',
  stripePublicKey: 'YOUR_STRIPE_KEY',
  
  // Features flags
  enableAnalytics: false,
  enableDebugMode: true,
  
  // Configuraciones
  maxFileSize: 5242880, // 5MB en bytes
  defaultLanguage: 'es',
  itemsPerPage: 20,
  
  // URLs adicionales
  assetsUrl: 'http://localhost:4200/assets',
  websocketUrl: 'ws://localhost:3000'
};
```

## ⚠️ Seguridad

- **NUNCA** commitas claves API o secretos en los archivos de environment
- Usa variables de entorno del sistema para información sensible
- Agrega archivos con información sensible al `.gitignore`
- Para producción, considera usar servicios de configuración externos

## 📝 Buenas Prácticas

1. **Mantén la consistencia**: Asegúrate de que ambos archivos tengan las mismas propiedades
2. **Documenta**: Comenta las variables que no sean obvias
3. **Valida**: Crea una interfaz TypeScript para validar la estructura:

```typescript
// environment.interface.ts
export interface Environment {
  production: boolean;
  apiUrl: string;
  appName: string;
  version: string;
}

// environment.ts
import { Environment } from './environment.interface';

export const environment: Environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  appName: 'BVC Frontend',
  version: '1.0.0'
};
```

## 🌍 Múltiples Ambientes

Si necesitas más ambientes (staging, testing, etc.):

1. Crea nuevos archivos: `environment.staging.ts`, `environment.test.ts`
2. Agrega configuraciones en `angular.json`:

```json
"configurations": {
  "staging": {
    "fileReplacements": [
      {
        "replace": "src/environments/environment.ts",
        "with": "src/environments/environment.staging.ts"
      }
    ]
  }
}
```

3. Usa el comando:
```bash
ng serve --configuration=staging
ng build --configuration=staging
```


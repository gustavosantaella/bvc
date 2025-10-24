# 📊 Guía de Configuración de Google AdSense

Esta guía te ayudará a configurar Google AdSense en tu aplicación BVC (Bolsa de Valores de Caracas).

## 📋 Prerrequisitos

1. **Cuenta de Google AdSense aprobada**
   - Si no tienes una, regístrate en: https://www.google.com/adsense
   - Espera la aprobación de tu sitio web (puede tomar de 1 a 7 días)

2. **Dominio verificado**
   - Tu sitio debe estar publicado en un dominio público
   - Google AdSense no funciona en `localhost`

## 🔧 Pasos de Configuración

### 1. Obtener tu ID de Cliente de AdSense

1. Inicia sesión en tu cuenta de AdSense: https://www.google.com/adsense
2. Ve a **Anuncios** > **Resumen**
3. Copia tu ID de cliente (formato: `ca-pub-XXXXXXXXXXXXXXXX`)

### 2. Crear Bloques de Anuncios

Para cada posición de anuncio en la aplicación, necesitas crear un bloque:

1. En AdSense, ve a **Anuncios** > **Por unidad de anuncio**
2. Haz clic en **Nueva unidad de anuncio**
3. Selecciona el tipo según la posición:

#### Tipos de anuncios y sus posiciones en la app:

| Posición | Tipo Recomendado | Tamaño | ID en Config |
|----------|------------------|--------|--------------|
| Banner superior (después del header) | Anuncio de display | 970x90 o Responsivo | `headerBanner` |
| Entre secciones de contenido | Anuncio de display | 728x90 o Responsivo | `inFeedMain` |
| Sección de gráficos | Anuncio de display | 336x280 o Responsivo | `chartsInFeed` |
| Antes del footer | Anuncio de display | 970x90 o Responsivo | `footerBanner` |
| Sidebar flotante (desktop) | Anuncio de display | 160x600 | `sidebarFloat` |

4. Copia el ID del bloque de anuncio (solo el número, no todo el código)

### 3. Actualizar la Configuración

Edita el archivo `src/app/config/adsense.config.ts`:

```typescript
export const ADSENSE_CONFIG = {
  // Reemplaza con tu ID de cliente
  clientId: 'ca-pub-1234567890123456',
  
  adSlots: {
    headerBanner: '1234567890',      // ID del bloque 1
    inFeedMain: '2345678901',        // ID del bloque 2
    chartsInFeed: '3456789012',      // ID del bloque 3
    footerBanner: '4567890123',      // ID del bloque 4
    sidebarFloat: '5678901234',      // ID del bloque 5
  },
  // ... resto de la config
};
```

### 4. Actualizar el Script en index.html

Edita `src/index.html` en la línea 144:

```html
<!-- Google AdSense -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456"
 crossorigin="anonymous"></script>
```

Reemplaza `ca-pub-1234567890123456` con tu ID de cliente.

### 5. Actualizar el Componente AdSense

Edita `src/app/components/adsense/adsense.component.ts` en la línea 12:

```typescript
@Input() adClient: string = 'ca-pub-1234567890123456'; // Tu ID aquí
```

### 6. Usar la Configuración en los Componentes

Puedes importar y usar la configuración en tus componentes:

```typescript
import { ADSENSE_CONFIG } from '../../config/adsense.config';

// En el template:
<app-adsense
  [adClient]="ADSENSE_CONFIG.clientId"
  [adSlot]="ADSENSE_CONFIG.adSlots.headerBanner"
  [adFormat]="ADSENSE_CONFIG.formats.leaderboard.format"
  [adStyle]="ADSENSE_CONFIG.formats.leaderboard.style"
></app-adsense>
```

## 📍 Posiciones de Anuncios Actuales

La aplicación tiene anuncios estratégicamente posicionados en:

### 1. **Banner Superior (Sticky)**
- **Ubicación**: Justo después del header
- **Formato**: Leaderboard horizontal (970x90)
- **Visibilidad**: Alta - Siempre visible al hacer scroll
- **Archivo**: `src/app/pages/initial/app.component.html` (línea ~276)

### 2. **Anuncio Entre Secciones**
- **Ubicación**: Entre la sección de gráficos y la tabla de datos
- **Formato**: Banner horizontal (728x90)
- **Visibilidad**: Media-Alta
- **Archivo**: `src/app/pages/initial/app.component.html` (línea ~894)

### 3. **Anuncio en Gráficos**
- **Ubicación**: Dentro del componente de gráficos, antes del carrusel
- **Formato**: Large Rectangle (336x280)
- **Visibilidad**: Alta - Los usuarios pasan tiempo en esta sección
- **Archivo**: `src/app/components/market-charts/market-charts.component.html` (línea ~270)

### 4. **Banner Antes del Footer**
- **Ubicación**: Justo antes del footer
- **Formato**: Leaderboard horizontal (970x90)
- **Visibilidad**: Media
- **Archivo**: `src/app/pages/initial/app.component.html` (línea ~1692)

### 5. **Sidebar Flotante (Solo Desktop)**
- **Ubicación**: Lado derecho de la pantalla, flotante
- **Formato**: Wide Skyscraper (160x600)
- **Visibilidad**: Alta en desktop - Siempre visible
- **Archivo**: `src/app/pages/initial/app.component.html` (línea ~1706)
- **Nota**: Solo se muestra en pantallas XL (>1280px)

## 🎨 Personalización de Anuncios

### Modificar Estilos

Puedes personalizar la apariencia del contenedor de anuncios editando:
`src/app/components/adsense/adsense.component.css`

### Agregar Nuevos Anuncios

Para agregar un nuevo anuncio:

1. Crea un bloque de anuncio en AdSense
2. Agrega el ID en `adsense.config.ts`
3. Inserta el componente en el HTML deseado:

```html
<div class="my-4">
  <app-adsense
    [adSlot]="'TU_NUEVO_ID'"
    adFormat="auto"
    [adStyle]="'display:block; width:100%; height:250px;'"
  ></app-adsense>
</div>
```

### Deshabilitar Anuncios Temporalmente

Para deshabilitar un anuncio sin eliminarlo:

```html
<!-- Comenta el componente -->
<!-- <app-adsense ...></app-adsense> -->
```

O condiciona su renderizado:

```html
<app-adsense 
  *ngIf="showAds"
  ...
></app-adsense>
```

## 📊 Mejores Prácticas

1. **No satures tu sitio con anuncios**
   - Google penaliza sitios con demasiados anuncios
   - Mantén un balance entre contenido y publicidad
   - Actualmente hay 5 posiciones, lo cual es razonable

2. **Usa anuncios responsivos cuando sea posible**
   - Se adaptan mejor a diferentes dispositivos
   - Mejoran la experiencia del usuario

3. **Monitorea el rendimiento**
   - Revisa regularmente tu panel de AdSense
   - Ajusta posiciones según el CTR (Click-Through Rate)
   - Experimenta con diferentes formatos

4. **Respeta las políticas de AdSense**
   - No hagas clic en tus propios anuncios
   - No pidas a otros que hagan clic
   - No coloques anuncios en páginas sin contenido

5. **Optimización móvil**
   - El sidebar flotante solo se muestra en desktop
   - Los banners son responsivos
   - Considera agregar anuncios específicos para móvil si es necesario

## 🚀 Despliegue

Después de configurar AdSense:

1. Compila la aplicación:
```bash
npm run build:prod
```

2. Despliega en tu servidor o plataforma (Vercel, Netlify, etc.)

3. Espera de 24 a 48 horas para que Google AdSense comience a mostrar anuncios reales

4. Durante el desarrollo, verás anuncios de prueba o espacios en blanco

## ⚠️ Solución de Problemas

### Los anuncios no se muestran

1. **Verifica que estés en un dominio público** - AdSense no funciona en localhost
2. **Revisa la consola del navegador** - Busca errores de AdSense
3. **Confirma que el ID de cliente sea correcto**
4. **Espera 24-48 horas** - Los anuncios nuevos tardan en activarse
5. **Revisa el estado de tu cuenta de AdSense** - Asegúrate de que esté aprobada

### Los anuncios se muestran pero están en blanco

- Es normal durante las primeras 24-48 horas
- Google necesita tiempo para analizar tu sitio y enviar anuncios relevantes
- Si persiste, revisa que tu sitio cumpla con las políticas de AdSense

### Error "adsbygoogle.push() error"

- Asegúrate de que el script de AdSense esté cargado en `index.html`
- Verifica que el componente use `isPlatformBrowser` para SSR compatibility

## 📞 Soporte

Para más información:
- [Centro de Ayuda de Google AdSense](https://support.google.com/adsense)
- [Políticas del programa AdSense](https://support.google.com/adsense/answer/48182)
- [Comunidad de AdSense](https://support.google.com/adsense/community)

## 📈 Métricas Importantes

Monitorea estas métricas en tu panel de AdSense:

- **RPM (Revenue Per Mille)**: Ingresos por cada 1000 impresiones
- **CTR (Click-Through Rate)**: Porcentaje de clics vs impresiones
- **CPC (Cost Per Click)**: Ganancia promedio por clic
- **Impresiones**: Número de veces que se mostraron tus anuncios
- **Clics**: Número de clics en los anuncios

---

**¡Buena suerte con la monetización de tu sitio! 💰**


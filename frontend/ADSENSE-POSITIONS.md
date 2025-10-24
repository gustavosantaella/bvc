# 📍 Mapa de Posiciones de Anuncios de Google AdSense

Este documento muestra visualmente dónde están posicionados los anuncios de Google AdSense en la aplicación BVC.

## 🗺️ Vista General de la Página

```
┌─────────────────────────────────────────────────────────┐
│                    HEADER / NAVBAR                      │
│  Logo | BVC | Navegación | Idiomas | Fecha/Hora        │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  🟨 BANNER SUPERIOR (Sticky)                            │
│     Leaderboard 970x90 - Siempre visible al scroll      │
│     adSlot: headerBanner                                │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  Panel de Estado del Mercado (Botón flotante derecha)  │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│                     BANNERS INFO                        │
│  • Sistema gratuito (info banner)                      │
│  • Información de moneda (warning banner)              │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│           📊 SECCIÓN DE GRÁFICOS DEL MERCADO            │
├─────────────────────────────────────────────────────────┤
│  Filtros de instrumentos (ng-select)                   │
│  Filtros de fechas (date range)                        │
├─────────────────────────────────────────────────────────┤
│  🟦 ANUNCIO IN-FEED EN GRÁFICOS                         │
│     Large Rectangle 336x280                             │
│     adSlot: chartsInFeed                                │
├─────────────────────────────────────────────────────────┤
│  Carrusel de Gráficos:                                  │
│  • Slide 1: Mapa de Calor (Treemap)                    │
│  • Slide 2: Variación Porcentual                       │
│  • Slide 3: Análisis de Volumen                        │
│  • Slide 4: Gráfico de Velas/Precio                    │
│  • Slide 5: Monto Efectivo                             │
│  • Slide 6: Correlación                                │
│  • Slide 7: Volatilidad                                │
│  • Slide 8: Distribución de Precios                    │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│         🌟 INSTRUMENTOS DESTACADOS                      │
│  • Mejor rendimiento de ayer                           │
│  • Mejor rendimiento de hoy                            │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│         📉 INSTRUMENTOS CON MENOR RENDIMIENTO           │
│  • Peor rendimiento de ayer                            │
│  • Peor rendimiento de hoy                             │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  🟩 ANUNCIO ENTRE SECCIONES                             │
│     Banner 728x90                                       │
│     adSlot: inFeedMain                                  │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│          📈 TABLA DE DATOS DEL MERCADO                  │
├─────────────────────────────────────────────────────────┤
│  Barra de búsqueda + Botón refrescar                   │
│  Filtros (Todos/Ganadores/Perdedores)                  │
├─────────────────────────────────────────────────────────┤
│  Tabla con datos:                                       │
│  • Símbolo | Descripción | Precio                      │
│  • Variación | Volumen | Monto | Hora                  │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  🟪 BANNER ANTES DEL FOOTER                             │
│     Leaderboard 970x90                                  │
│     adSlot: footerBanner                                │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│                      FOOTER                             │
│  About | Enlaces Rápidos | Información                 │
│  Copyright © BVC Analytics                             │
└─────────────────────────────────────────────────────────┘

                     ┌──────────────┐
                     │  🟧 SIDEBAR  │  ← Solo Desktop (XL)
                     │   FLOTANTE   │     Wide Skyscraper
                     │   160x600    │     adSlot: sidebarFloat
                     │              │     Posición: fija derecha
                     └──────────────┘     Siempre visible
```

## 📊 Detalle de Cada Posición

### 1. 🟨 Banner Superior (Header Banner)

**Ubicación:** Justo después del header, sticky
**Archivo:** `src/app/pages/initial/app.component.html` (línea ~276)
**Formato:** Leaderboard horizontal
**Tamaño:** 970x90 px (responsivo)
**ID de Bloque:** `headerBanner`

```html
<div class="bg-gray-100 py-4 sticky top-16 z-40">
  <div class="max-w-7xl mx-auto px-4 flex justify-center">
    <app-adsense
      adSlot="XXXXXXXXXX"
      adFormat="horizontal"
      [adStyle]="'display:block; max-width:970px; width:100%; height:90px;'"
    ></app-adsense>
  </div>
</div>
```

**Ventajas:**
- ✅ Siempre visible (sticky)
- ✅ Alta visibilidad
- ✅ Primera impresión del usuario
- ✅ No interfiere con contenido principal

---

### 2. 🟦 Anuncio en Sección de Gráficos

**Ubicación:** Dentro del componente de gráficos, antes del carrusel
**Archivo:** `src/app/components/market-charts/market-charts.component.html` (línea ~270)
**Formato:** Large Rectangle
**Tamaño:** 336x280 px
**ID de Bloque:** `chartsInFeed`

```html
<div class="bg-white rounded-xl shadow-lg p-6 mb-6">
  <div class="flex justify-center">
    <app-adsense
      adSlot="XXXXXXXXXX"
      adFormat="rectangle"
      [adStyle]="'display:block; width:100%; max-width:336px; height:280px;'"
    ></app-adsense>
  </div>
</div>
```

**Ventajas:**
- ✅ Alto engagement (usuarios pasan tiempo viendo gráficos)
- ✅ Posición natural en el flujo de contenido
- ✅ No interrumpe la experiencia de usuario

---

### 3. 🟩 Anuncio Entre Secciones

**Ubicación:** Entre sección de gráficos y tabla de datos
**Archivo:** `src/app/pages/initial/app.component.html` (línea ~894)
**Formato:** Banner horizontal
**Tamaño:** 728x90 px (responsivo)
**ID de Bloque:** `inFeedMain`

```html
<div class="max-w-7xl mx-auto my-8">
  <div class="bg-white rounded-xl shadow-lg p-6">
    <div class="flex justify-center">
      <app-adsense
        adSlot="XXXXXXXXXX"
        adFormat="rectangle"
        [adStyle]="'display:block; width:100%; max-width:728px; height:90px;'"
      ></app-adsense>
    </div>
  </div>
</div>
```

**Ventajas:**
- ✅ Separación natural entre contenido
- ✅ Alta visibilidad durante navegación
- ✅ Buena posición para anuncios responsivos

---

### 4. 🟪 Banner Antes del Footer

**Ubicación:** Justo antes del footer
**Archivo:** `src/app/pages/initial/app.component.html` (línea ~1692)
**Formato:** Leaderboard horizontal
**Tamaño:** 970x90 px (responsivo)
**ID de Bloque:** `footerBanner`

```html
<div class="max-w-7xl mx-auto my-8">
  <div class="bg-white rounded-xl shadow-lg p-6">
    <div class="flex justify-center">
      <app-adsense
        adSlot="XXXXXXXXXX"
        adFormat="horizontal"
        [adStyle]="'display:block; width:100%; max-width:970px; height:90px;'"
      ></app-adsense>
    </div>
  </div>
</div>
```

**Ventajas:**
- ✅ Captura atención antes de salir
- ✅ No interfiere con contenido principal
- ✅ Posición estándar efectiva

---

### 5. 🟧 Sidebar Flotante (Solo Desktop)

**Ubicación:** Lado derecho de la pantalla, posición fija
**Archivo:** `src/app/pages/initial/app.component.html` (línea ~1706)
**Formato:** Wide Skyscraper vertical
**Tamaño:** 160x600 px
**ID de Bloque:** `sidebarFloat`
**Visibilidad:** Solo pantallas XL (>1280px)

```html
<div class="hidden xl:block fixed right-4 top-1/2 transform -translate-y-1/2 z-30">
  <div class="bg-white rounded-xl shadow-2xl p-4">
    <app-adsense
      adSlot="XXXXXXXXXX"
      adFormat="vertical"
      [adStyle]="'display:block; width:160px; height:600px;'"
    ></app-adsense>
  </div>
</div>
```

**Ventajas:**
- ✅ Siempre visible en desktop
- ✅ No interfiere con contenido
- ✅ Alta visibilidad constante
- ✅ Ideal para sesiones largas

**Nota:** Este anuncio se oculta automáticamente en tablets y móviles para no interferir con la experiencia en pantallas pequeñas.

---

## 🎯 Estrategia de Posicionamiento

### Principios Aplicados

1. **No Intrusivo**: Los anuncios están integrados naturalmente en el diseño
2. **Responsive**: Se adaptan a diferentes tamaños de pantalla
3. **Balance**: 5 posiciones para un buen equilibrio contenido/publicidad
4. **Visible pero no molesto**: Posiciones estratégicas sin saturar
5. **Optimización móvil**: Sidebar solo en desktop para mejor UX móvil

### Métricas Esperadas

| Posición | Visibilidad | Engagement | RPM Estimado |
|----------|-------------|------------|--------------|
| Banner Superior | Alta | Medio | $$$ |
| Gráficos In-feed | Muy Alta | Alto | $$$$ |
| Entre Secciones | Alta | Medio-Alto | $$$ |
| Antes Footer | Media | Medio | $$ |
| Sidebar Desktop | Muy Alta | Alto | $$$$ |

**Leyenda:**
- $ = Bajo
- $$ = Medio
- $$$ = Alto
- $$$$ = Muy Alto

### Recomendaciones

1. **Monitor Heatmaps**: Usa Google Analytics para ver dónde hacen clic los usuarios
2. **A/B Testing**: Prueba diferentes tamaños y posiciones
3. **Responsive Ads**: Considera usar anuncios responsivos automáticos
4. **Auto Ads**: Considera habilitar Auto Ads de Google para optimización automática
5. **Anchor Ads**: Considera agregar anuncios de anclaje móvil (se muestran en la parte inferior en móviles)

## 🔧 Personalización Adicional

### Agregar Más Anuncios

Si deseas agregar más posiciones:

```html
<div class="my-custom-ad-container">
  <app-adsense
    adSlot="TU_NUEVO_SLOT_ID"
    adFormat="auto"
    [fullWidthResponsive]="true"
    [adStyle]="'display:block;'"
  ></app-adsense>
</div>
```

### Anuncios Condicionales

Muestra anuncios solo en ciertas condiciones:

```html
<app-adsense 
  *ngIf="userIsPremium === false"
  [adSlot]="adsenseService.getAdSlot('headerBanner')"
  ...
></app-adsense>
```

### Anuncios por Página

Para diferentes anuncios en diferentes rutas:

```typescript
// En tu componente
getAdSlot(): string {
  const route = this.router.url;
  if (route.includes('/graficos')) return 'SLOT_GRAFICOS';
  if (route.includes('/tabla')) return 'SLOT_TABLA';
  return 'SLOT_DEFAULT';
}
```

## 📱 Comportamiento Responsive

| Dispositivo | Banner Superior | In-Feed Gráficos | Entre Secciones | Footer | Sidebar |
|-------------|----------------|------------------|-----------------|--------|---------|
| Móvil (<768px) | ✅ Responsivo | ✅ 300x250 | ✅ Responsivo | ✅ Responsivo | ❌ Oculto |
| Tablet (768-1279px) | ✅ 728x90 | ✅ 336x280 | ✅ 728x90 | ✅ 728x90 | ❌ Oculto |
| Desktop (≥1280px) | ✅ 970x90 | ✅ 336x280 | ✅ 728x90 | ✅ 970x90 | ✅ 160x600 |

---

**Última actualización:** Octubre 2025
**Total de posiciones:** 5 anuncios estratégicos
**Cobertura:** Desktop + Tablet + Móvil (responsive)


/**
 * Configuración de Google AdSense
 *
 * IMPORTANTE: Reemplaza 'ca-pub-XXXXXXXXXXXXXXXX' con tu ID de cliente de AdSense
 * y los 'XXXXXXXXXX' con los IDs de tus bloques de anuncios
 */

export const ADSENSE_CONFIG = {
  // Tu ID de cliente de AdSense (obtenerlo de https://www.google.com/adsense)
  //   clientId: 'ca-pub-XXXXXXXXXXXXXXXX',
  clientId: 'ca-pub-7887143920740339',

  // IDs de bloques de anuncios específicos
  adSlots: {
    // Banner horizontal superior (debajo del header)
    headerBanner: '5476314402',

    // Anuncio entre secciones de contenido
    inFeedMain: '5476314402',

    // Anuncio en la sección de gráficos
    chartsInFeed: '5476314402',

    // Banner antes del footer
    footerBanner: '5476314402',

    // Sidebar flotante (visible en desktop)
    sidebarFloat: '5476314402',
  },

  // Configuraciones de formato de anuncios
  formats: {
    // Leaderboard - Banner horizontal (970x90 o 728x90)
    leaderboard: {
      format: 'horizontal',
      style: 'display:block; max-width:970px; width:100%; height:90px;',
    },

    // Medium Rectangle - Cuadrado mediano (300x250)
    mediumRectangle: {
      format: 'rectangle',
      style: 'display:block; width:100%; max-width:300px; height:250px;',
    },

    // Large Rectangle - Rectángulo grande (336x280)
    largeRectangle: {
      format: 'rectangle',
      style: 'display:block; width:100%; max-width:336px; height:280px;',
    },

    // Wide Skyscraper - Banner vertical (160x600)
    wideSkyscraper: {
      format: 'vertical',
      style: 'display:block; width:160px; height:600px;',
    },

    // Banner horizontal pequeño (728x90)
    banner: {
      format: 'horizontal',
      style: 'display:block; width:100%; max-width:728px; height:90px;',
    },
  },
};

# Proyecto Angular + Tailwind CSS

Este proyecto fue creado con [Angular CLI](https://github.com/angular/angular-cli) versión 18 y configurado con [Tailwind CSS](https://tailwindcss.com/).

## 🚀 Características

- ✅ Angular 18 con componentes standalone
- ✅ Tailwind CSS 3.x configurado y listo para usar
- ✅ Router de Angular configurado
- ✅ PostCSS y Autoprefixer incluidos
- ✅ Configuración de desarrollo optimizada

## 📋 Requisitos Previos

- Node.js (versión 20.x o superior recomendada)
- npm (viene incluido con Node.js)

## 🛠️ Instalación

Las dependencias ya están instaladas. Si necesitas reinstalarlas:

```bash
npm install
```

## 💻 Servidor de Desarrollo

Ejecuta el siguiente comando para iniciar el servidor de desarrollo:

```bash
npm start
```

O también puedes usar:

```bash
ng serve
```

Navega a `http://localhost:4200/`. La aplicación se recargará automáticamente si cambias algún archivo fuente.

## 🎨 Usando Tailwind CSS

Tailwind CSS está completamente configurado. Puedes usar las clases utility directamente en tus componentes:

```html
<div class="flex items-center justify-center h-screen bg-blue-500">
  <h1 class="text-4xl font-bold text-white">¡Hola Tailwind!</h1>
</div>
```

### Configuración de Tailwind

El archivo de configuración se encuentra en `tailwind.config.js`. Puedes personalizarlo según tus necesidades:

```javascript
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      // Agrega tus personalizaciones aquí
    },
  },
  plugins: [],
}
```

## 🏗️ Construcción

Ejecuta el siguiente comando para construir el proyecto:

```bash
npm run build
```

O:

```bash
ng build
```

Los archivos de construcción se almacenarán en el directorio `dist/`.

## 🧪 Ejecutar Pruebas Unitarias

```bash
ng test
```

Ejecuta las pruebas unitarias a través de [Karma](https://karma-runner.github.io).

## 📦 Estructura del Proyecto

```
├── src/
│   ├── app/              # Componentes de la aplicación
│   ├── assets/           # Recursos estáticos (imágenes, etc.)
│   ├── index.html        # HTML principal
│   ├── main.ts           # Punto de entrada de la aplicación
│   └── styles.css        # Estilos globales (con directivas de Tailwind)
├── tailwind.config.js    # Configuración de Tailwind CSS
├── angular.json          # Configuración de Angular CLI
├── package.json          # Dependencias del proyecto
└── tsconfig.json         # Configuración de TypeScript
```

## 📚 Recursos Útiles

### Angular
- [Documentación de Angular](https://angular.io/docs)
- [Angular CLI](https://angular.io/cli)
- [Angular Router](https://angular.io/guide/router)

### Tailwind CSS
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com/)
- [Tailwind Play (Playground)](https://play.tailwindcss.com/)

## 🤝 Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia el servidor de desarrollo |
| `npm run build` | Construye el proyecto para producción |
| `npm test` | Ejecuta las pruebas unitarias |
| `ng generate component nombre` | Genera un nuevo componente |
| `ng generate service nombre` | Genera un nuevo servicio |
| `ng generate module nombre` | Genera un nuevo módulo |

## 📝 Notas

- Este proyecto usa **componentes standalone** de Angular, lo que significa que no necesitas declarar componentes en módulos.
- Los estilos de Tailwind se procesan automáticamente durante el desarrollo y la construcción.
- Para producción, Tailwind CSS eliminará automáticamente las clases CSS no utilizadas (tree-shaking).

## 🎯 Próximos Pasos

1. Edita `src/app/app.component.html` para personalizar la página de inicio
2. Crea nuevos componentes con `ng generate component nombre-componente`
3. Configura tus rutas en `src/app/app.routes.ts`
4. Personaliza los colores y temas de Tailwind en `tailwind.config.js`

¡Feliz desarrollo! 🚀

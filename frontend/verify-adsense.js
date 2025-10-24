/**
 * Script de verificación de configuración de Google AdSense
 *
 * Ejecuta este script para verificar que tu configuración de AdSense esté correcta
 *
 * Uso: node verify-adsense.js
 */

const fs = require("fs");
const path = require("path");

console.log("\n🔍 Verificando configuración de Google AdSense...\n");

let hasErrors = false;
const warnings = [];

// 1. Verificar archivo de configuración
const configPath = path.join(
  __dirname,
  "src",
  "app",
  "config",
  "adsense.config.ts"
);
console.log("✓ Verificando archivo de configuración...");

if (!fs.existsSync(configPath)) {
  console.error(
    "❌ ERROR: No se encontró el archivo de configuración en:",
    configPath
  );
  hasErrors = true;
} else {
  const configContent = fs.readFileSync(configPath, "utf8");

  // Verificar clientId
  if (configContent.includes("ca-pub-XXXXXXXXXXXXXXXX")) {
    warnings.push(
      "⚠️  ADVERTENCIA: El clientId de AdSense aún no ha sido configurado"
    );
    warnings.push(
      "   Actualiza src/app/config/adsense.config.ts con tu ID de cliente"
    );
  } else {
    console.log("   ✓ ClientId configurado");
  }

  // Verificar adSlots
  const slotPlaceholders = (configContent.match(/XXXXXXXXXX/g) || []).length;
  if (slotPlaceholders > 0) {
    warnings.push(
      `⚠️  ADVERTENCIA: ${slotPlaceholders} bloques de anuncios sin configurar`
    );
    warnings.push(
      "   Actualiza los IDs de bloques en src/app/config/adsense.config.ts"
    );
  } else {
    console.log("   ✓ Todos los bloques de anuncios configurados");
  }
}

// 2. Verificar index.html
const indexPath = path.join(__dirname, "src", "index.html");
console.log("\n✓ Verificando index.html...");

if (!fs.existsSync(indexPath)) {
  console.error("❌ ERROR: No se encontró index.html");
  hasErrors = true;
} else {
  const indexContent = fs.readFileSync(indexPath, "utf8");

  if (!indexContent.includes("adsbygoogle.js")) {
    console.error("❌ ERROR: Script de AdSense no encontrado en index.html");
    hasErrors = true;
  } else if (indexContent.includes("ca-pub-XXXXXXXXXXXXXXXX")) {
    warnings.push("⚠️  ADVERTENCIA: ClientId en index.html no configurado");
    warnings.push(
      "   Actualiza la línea del script de AdSense en src/index.html"
    );
  } else {
    console.log("   ✓ Script de AdSense configurado correctamente");
  }
}

// 3. Verificar componente AdSense
const adsenseComponentPath = path.join(
  __dirname,
  "src",
  "app",
  "components",
  "adsense",
  "adsense.component.ts"
);
console.log("\n✓ Verificando componente AdSense...");

if (!fs.existsSync(adsenseComponentPath)) {
  console.error("❌ ERROR: Componente AdSense no encontrado");
  hasErrors = true;
} else {
  const componentContent = fs.readFileSync(adsenseComponentPath, "utf8");

  if (componentContent.includes("ca-pub-XXXXXXXXXXXXXXXX")) {
    warnings.push(
      "⚠️  ADVERTENCIA: ClientId por defecto en el componente AdSense"
    );
    warnings.push(
      "   Actualiza @Input() adClient en src/app/components/adsense/adsense.component.ts"
    );
  } else {
    console.log("   ✓ Componente AdSense configurado");
  }
}

// 4. Contar posiciones de anuncios
console.log("\n✓ Verificando posiciones de anuncios...");

const appComponentPath = path.join(
  __dirname,
  "src",
  "app",
  "pages",
  "initial",
  "app.component.html"
);
const chartsComponentPath = path.join(
  __dirname,
  "src",
  "app",
  "components",
  "market-charts",
  "market-charts.component.html"
);

let adCount = 0;

if (fs.existsSync(appComponentPath)) {
  const appContent = fs.readFileSync(appComponentPath, "utf8");
  const appAds = (appContent.match(/<app-adsense/g) || []).length;
  adCount += appAds;
  console.log(`   ✓ ${appAds} anuncios en app.component.html`);
}

if (fs.existsSync(chartsComponentPath)) {
  const chartsContent = fs.readFileSync(chartsComponentPath, "utf8");
  const chartsAds = (chartsContent.match(/<app-adsense/g) || []).length;
  adCount += chartsAds;
  console.log(`   ✓ ${chartsAds} anuncios en market-charts.component.html`);
}

console.log(`\n   Total: ${adCount} posiciones de anuncios encontradas`);

// 5. Verificar importaciones
console.log("\n✓ Verificando importaciones...");

const appComponentTsPath = path.join(
  __dirname,
  "src",
  "app",
  "pages",
  "initial",
  "app.component.ts"
);
if (fs.existsSync(appComponentTsPath)) {
  const appTsContent = fs.readFileSync(appComponentTsPath, "utf8");
  if (appTsContent.includes("AdsenseComponent")) {
    console.log("   ✓ AdsenseComponent importado en app.component.ts");
  } else {
    console.error(
      "❌ ERROR: AdsenseComponent no importado en app.component.ts"
    );
    hasErrors = true;
  }
}

const chartsComponentTsPath = path.join(
  __dirname,
  "src",
  "app",
  "components",
  "market-charts",
  "market-charts.component.ts"
);
if (fs.existsSync(chartsComponentTsPath)) {
  const chartsTsContent = fs.readFileSync(chartsComponentTsPath, "utf8");
  if (chartsTsContent.includes("AdsenseComponent")) {
    console.log(
      "   ✓ AdsenseComponent importado en market-charts.component.ts"
    );
  } else {
    console.error(
      "❌ ERROR: AdsenseComponent no importado en market-charts.component.ts"
    );
    hasErrors = true;
  }
}

// Resumen
console.log("\n" + "=".repeat(60));
console.log("📊 RESUMEN DE VERIFICACIÓN");
console.log("=".repeat(60));

if (hasErrors) {
  console.log("\n❌ Se encontraron errores que deben corregirse");
}

if (warnings.length > 0) {
  console.log("\n⚠️  Advertencias:\n");
  warnings.forEach((warning) => console.log(warning));
}

if (!hasErrors && warnings.length === 0) {
  console.log("\n✅ ¡Todo configurado correctamente!");
  console.log("\n📝 Próximos pasos:");
  console.log("   1. Compila el proyecto: npm run build:prod");
  console.log("   2. Despliega en tu servidor");
  console.log("   3. Espera 24-48 horas para que los anuncios aparezcan");
  console.log("   4. Monitorea el rendimiento en tu panel de AdSense");
} else {
  console.log("\n📝 Próximos pasos:");
  console.log("   1. Corrige los errores y advertencias mencionadas arriba");
  console.log("   2. Consulta ADSENSE-SETUP.md para más detalles");
  console.log("   3. Ejecuta este script nuevamente para verificar");
}

console.log("\n" + "=".repeat(60) + "\n");

process.exit(hasErrors ? 1 : 0);

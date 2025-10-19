const fs = require("fs");
const { execSync } = require("child_process");
const pkg = require("../package.json");

const version = pkg.version;
const name = pkg.name || "build";
const zipName = `${name}-${version}.zip`;

console.log(`📦 Packaging ${zipName}...`);

try {
  // Собираем проект (prod)
  execSync("npm run build", { stdio: "inherit" });
  execSync("npm run build:host", { stdio: "inherit" });

  // Удаляем старый архив, если есть
  if (fs.existsSync(zipName)) {
    fs.unlinkSync(zipName);
  }

  // Создаём новый архив
  execSync(`zip -r ${zipName} .env package.json package-lock.json tailwind.config.js postcss.config.js host .certinfo .debug .certignore dist public AOM CSXS config.json`, { stdio: "inherit" });

  console.log(`✅ Done: ${zipName}`);
} catch (err) {
  console.error("❌ Packaging failed:", err);
  process.exit(1);
}
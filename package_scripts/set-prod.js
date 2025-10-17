const fs = require("fs");

const file = "CSXS/manifest.xml";
let xml = fs.readFileSync(file, "utf8");

// заменяем public → dist
xml = xml.replace("./public/index-dev.html", "./dist/index.html");

fs.writeFileSync(file, xml);
console.log("Manifest switched to PROD mode");

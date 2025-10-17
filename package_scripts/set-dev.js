const fs = require("fs");

const file = "CSXS/manifest.xml";
let xml = fs.readFileSync(file, "utf8");

// заменяем dist → public
xml = xml.replace("./dist/index.html", "./public/index-dev.html");

fs.writeFileSync(file, xml);
console.log("Manifest switched to DEV mode");
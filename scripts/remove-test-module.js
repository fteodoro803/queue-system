// This script removes the "meteor.testModule" field from package.json
// This is necessary because the test module is not needed in production,
// making the build smaller and faster

import { readFileSync, writeFileSync } from "fs";

const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
delete pkg?.meteor?.testModule;

writeFileSync("package.json", JSON.stringify(pkg, null, 2));

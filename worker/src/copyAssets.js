var packageJsonPath = './package.json';

var packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));


packageJson.scripts = packageJson.scripts || {};
packageJson.scripts.customScript = "cd worker && cd src && node moveFolder.js && cd .. && cd ..";


fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
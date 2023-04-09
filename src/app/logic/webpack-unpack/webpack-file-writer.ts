const fs = require("fs");
const Path = require("path");

const inputFile = process.argv[2];
const outputFolder = process.argv[3];

const deleteFolderRecursive = function (path: string) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file: string, index: number) => {
      const curPath = Path.join(path, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

const structure = JSON.parse(fs.readFileSync(inputFile, "utf-8"));
let newDependencyNames: { [index: string]: string } = {};
let depCount = 0;

try {
  deleteFolderRecursive(outputFolder);
} catch (e) {
  console.log(`Dir not exisiting`);
}

fs.mkdirSync(outputFolder);

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
let fileIdForFixedName = {};
let fileName = (id: string | number) => `file${id}`;
// generate dependency names
for (let file of structure) {
  for (let dep in file.deps) {
    const fixedDepName = escapeRegExp(dep + "");
    if (!newDependencyNames[fixedDepName]) {
      newDependencyNames[fixedDepName] = fileName(depCount);
      depCount++;
    }
  }

  let fixedDepName = escapeRegExp(file.id + "");
  if (!file.id) {
    console.log("NO ID!!");
    console.log(file.id);
    console.log(file);
    fixedDepName = escapeRegExp(depCount + "_NO_ID_");
    file.id = depCount + "_NO_ID_";
  }

  if (!newDependencyNames[fixedDepName]) {
    newDependencyNames[fixedDepName] = fileName(depCount);
    if (file.entry === true) {
      newDependencyNames[fixedDepName] = `ENTRYPOINT_${depCount}`;
    }
    depCount++;
  }
}

let getDependencyName = (dependencyHash: string | number) => {
  const fixedDepName = escapeRegExp(dependencyHash + "");
  let replacementName = newDependencyNames[fixedDepName];
  if (!replacementName) {
    replacementName = newDependencyNames[fixedDepName];
  }
  return replacementName;
};

let wroteTo: { [index: string]: number } = {};

for (let file of structure) {
  // if (file.id) {
  const fileName = getDependencyName(file.id);
  let fixedSource = file.source;

  if (!wroteTo[fileName]) {
    wroteTo[fileName] = 1;
  } else {
    wroteTo[fileName]++;
  }

  for (let dep in file.deps) {
    const fixedDepName = escapeRegExp(dep + "");
    let replacementName = getDependencyName(dep);
    fixedSource = fixedSource.replace(
      new RegExp(`${fixedDepName}`, "g"),
      `./${replacementName}.js`
    );
  }

  let header = `//ORIGINAL_DEPENDENCY_NAME=${file.id}\n// UsedDependencies:\n`;
  for (let dep in file.deps) {
    // const fixedDepName = escapeRegExp(dep + "");
    header += `// ${getDependencyName(dep)} = ${dep}\n`;
  }

  header += "\n\n";
  fixedSource = header + fixedSource;

  console.log(`writing to ${outputFolder}/${fileName}_${wroteTo[fileName]}.js`);
  fs.writeFileSync(
    `${outputFolder}/${fileName}_${wroteTo[fileName]}.js`,
    fixedSource,
    "utf-8"
  );
  // }
}

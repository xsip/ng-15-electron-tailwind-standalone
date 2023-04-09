import {parseWebpackFile} from './webpack-parser'
import {ReplaySubject} from 'rxjs';
const fs: typeof import("fs")  = window.require('fs');
const path: typeof import('path') = window.require('path');

const md5 = window.require('md5');
const beautify = window.require('js-beautify').js;

const fs_extra = window.require('fs-extra');

const writeFile = (path: string, data: string) => {
    fs_extra.outputFile(path, data, function (err: any) {
        if (err) {
            console.log(err); // => null
        }


    });
}

interface HashList {
    [index: string]: string
};
const moduleHash: { [index: string]: string } = {};

interface Module {
    id: string;
    source: string;
    deps: { [index: string]: number };
    entry: boolean;
}
function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const collectHashes = (modules: Module[]): HashList => {
    const hashList: HashList = {};
    modules.forEach(module => {
        if (!hashList[module.id + '']) {
            hashList[module.id + ''] = md5(module.id + '');
        }
        if (module.deps) {
            const deps = Object.values(module.deps);
            deps.forEach(dep => {
                if (!hashList[dep + '']) {
                    hashList[dep + ''] = md5(dep + '');
                }
            })
        }
    });
    return hashList;
}
const fixSource = (module: Module, hashList: HashList) => {
    let source = module.source;
    // let moduleInfo = `// moduleId: ${module.id} | hash: ${hashList[module.id]}\n// isEntryPoint: ${module.entry ? 'true' : 'false'}\n// Dependencies:\n`;
    let moduleInfo = {
      moduleId: module.id,
      hash: hashList[module.id],
      isEntryPoint:module.entry,
      dependencies: [] as any[]
    }
    if (module.deps) {
        Object.values(module.deps).sort((a, b) => parseInt(b + '', 0) - parseInt(a + '', 0)).forEach(dep => {
            const escapedDep = escapeRegExp(dep+'');
            moduleInfo.dependencies.push({id: dep, hash: hashList[dep + '']} );
            // moduleInfo += `// id: ${dep} | hash: ${hashList[dep + '']}\n`;
            // console.log(`replacing ${dep} with ${hashList[dep + '']}`);
            source = source.replace(new RegExp('\\( \'', 'g'), '(\'');
            source = source.replace(new RegExp('\\( "', 'g'), '("');
            source = source.replace(new RegExp('\' \\)', 'g'), '\')');
            source = source.replace(new RegExp('" \\)', 'g'), '")');
            source = source.replace(new RegExp(`require\\(${escapedDep}\\)`, 'g'), `require("./${hashList[dep + '']}")`/*.js*/);
            source = source.replace(new RegExp(`require\\("${escapedDep}"\\)`, 'g'), `require("./${hashList[dep + '']}")`/*.js*/);
            source = source.replace(new RegExp(`require\\('${escapedDep}'\\)`, 'g'), `require("./${hashList[dep + '']}.")`/*.js*/);
        })
    }
    return `\nconst meta = ${JSON.stringify(moduleInfo, null,2)};\n` + '\n\n' + source;
}

const timeout = () => {
  return new Promise((res: any,rej: any) => {
    setTimeout(() => {
      res(true);
    }, 10);
  })
}
export const unpack = async (inputDir: string, fileName: string, outputDir: string, status: ReplaySubject<string>) => {
  status.next(`Searching For Modules`);
  await timeout();
  const modules = parseWebpackFile(fs.readFileSync(inputDir + '/' + fileName, 'utf-8'), {})
  status.next(`Found Modules (${modules?.length})`);
  await timeout();
  if (modules) {
    status.next(`Collecting hashes`);
    await timeout();
    const hashList = collectHashes(modules);
    modules.forEach((row) => {
      status.next(`Writing ${row.entry ? 'index_' +fileName.replace(/\//g, '_').replace(/\./g, '_') + '.js'  : hashList[row.id + ''] + '.js'}`);
      writeFile(
        path.join(
          outputDir ,
          row.entry ? 'index_' +fileName.replace(/\//g, '_').replace(/\./g, '_') + '.js'  : hashList[row.id + ''] + '.js'),
        beautify(fixSource(row, hashList), {
          "indent_size": "4",
          "indent_char": " ",
          "max_preserve_newlines": "5",
          "preserve_newlines": true,
          "keep_array_indentation": false,
          "break_chained_methods": false,
          "indent_scripts": "normal",
          "brace_style": "collapse",
          "space_before_conditional": true,
          "unescape_strings": false,
          "jslint_happy": false,
          "end_with_newline": false,
          "wrap_line_length": "0",
          "indent_inner_html": false,
          "comma_first": false,
          "e4x": false,
          "indent_empty_lines": false
        }));
    });
    status.next('Done');
    await timeout();
  }
}

import assert from "assert";
import * as acorn from "acorn";
import * as astring from "astring";
import * as fs from "fs";
// @ts-ignore
import * as scan from "scope-analyzer";
// @ts-ignore
const multisplice = require("multisplice");
/*import {
  Program,
  Property,
  ArrayExpression,
  ObjectExpression,
  FunctionDeclaration,
  BlockStatement,
  MethodDefinition,
  ClassBody,
} from "estree";*/
// type Program = any;
// type Property = any;
// type ArrayExpression = any;
// type ObjectExpression = any;
// type FunctionDeclaration = any;
// type ClassBody = any;
// type BlockStatement = any;
// type MethodDefinition = any;
export const patchSpotify = (source: string, opts: any) => {
  //@ts-ignore
  var ast: Program = acorn.parse(source, { ecmaVersion: 2019 });
  // fs.writeFileSync('tree.json', JSON.parse(ast, null,2), 'utf-8');
  if (opts && opts.source) {
    source = opts.source;
  }

  if (source && Buffer.isBuffer(source)) {
    source = source.toString();
  }

  assert(
    !source || typeof source === "string",
    "webpack-unpack: source must be a string or Buffer"
  );

  const meta = unpackJsonpPrelude(ast, source);
  // if (!meta) return;

  // var entryId = meta.entryId;
  // var factories = meta.factories;

  /*if (!factories.every(isFunctionOrEmpty)) {
    return
  }*/
  return [];
};

function unpackJsonpPrelude(ast: Program, source: string) {
  // (prelude).push(factories)
  if (
    ast.body[0].type !== "ExpressionStatement" ||
    ast.body[0].expression.type !== "CallExpression" ||
    ast.body[0].expression.callee.type !== "MemberExpression"
  ) {
    return;
  }

  var callee = ast.body[0].expression.callee;
  // (webpackJsonp = webpackJsonp || []).push
  // @ts-ignore
  if (callee.computed || callee.property.name !== "push") return;
  if (callee.object.type !== "AssignmentExpression") return;

  var args = ast.body[0].expression.arguments;
  // ([ [bundleIds], [factories])
  if (args.length !== 1) return;
  if (args[0].type !== "ArrayExpression") return;
  if (args[0].elements[0].type !== "ArrayExpression") return;
  if (
    args[0].elements[1].type !== "ArrayExpression" &&
    args[0].elements[1].type !== "ObjectExpression"
  )
    return;

  var playerFactory: Property = getPlayerLocation(args[0].elements[1]);
  // @ts-ignore
  fs.writeFileSync(
    "tmpDate.js",
    // @ts-ignore
    source.substr(playerFactory.value.start, playerFactory.value.end),
    "utf-8"
  );
// @ts-ignore
  const newAst: Program = acorn.parse(
    // @ts-ignore
    source.substr(playerFactory.value.start, playerFactory.value.end),
    { ecmaVersion: 2019 }
  );
  for (const fileMember of ((newAst.body[0] as FunctionDeclaration)
    .body as BlockStatement).body) {
    if (fileMember.type === "ClassDeclaration") {
      const classBody: ClassBody = fileMember.body;
      for (const classFunc of classBody.body) {
        const classMember = classFunc as MethodDefinition;
        if (classMember.kind === "constructor") {
          const classMemberBody: BlockStatement = classMember.value.body;
          // classMember.value.body
          // @ts-ignore
          console.log(
            source.substr(
              // @ts-ignore
              (classMember.value.body.start, classMember.value.body.end)
            )
          );
        }
      }
    }
  }
  console.log(newAst);

  /*return {
    factories: factories,
    entryId: undefined,
  };*/
}

function isFunctionOrEmpty(node: any) {
  return node.factory === null || node.factory.type === "FunctionExpression";
}

function getModuleRange(body: any) {
  if (body.body.length === 0) {
    // exclude {} braces
    return { start: body.start + 1, end: body.end - 1 };
  }
  return {
    start: body.body[0].start,
    end: body.body[body.body.length - 1].end,
  };
}

function rewriteMagicIdentifiers(moduleWrapper: any, source: any, offset: any) {
  var magicBindings = moduleWrapper.params.map(scan.getBinding);
  var magicNames = ["module", "exports", "require"];
  var edit = source ? multisplice(source) : null;

  magicBindings.forEach(function (binding: any, i: any) {
    var name = magicNames[i];
    binding.getReferences().forEach(function (ref: any) {
      if (ref === binding.definition) return;

      ref.name = name;
      if (edit) edit.splice(ref.start - offset, ref.end - offset, name);
    });
  });

  return edit ? edit.toString() : null;
}

function getDependencies(moduleWrapper: any) {
  var deps = {};
  if (moduleWrapper.params.length < 3) return deps;

  var req = scan.getBinding(moduleWrapper.params[2]);
  req.getReferences().forEach(function (ref: any) {
    if (
      ref.parent.type === "CallExpression" &&
      ref.parent.callee === ref &&
      ref.parent.arguments[0].type === "Literal"
    ) {
      // @ts-ignore
      deps[ref.parent.arguments[0].value] = ref.parent.arguments[0].value;
    }
  });

  return deps;
}

function find(arr: any[], fn: any) {
  for (var i = 0; i < arr.length; i++) {
    if (fn(arr[i])) return arr[i];
  }
}

function getPlayerLocation<T>(
  expression: ArrayExpression | ObjectExpression
): T {
  if (expression.type === "ObjectExpression") {
    return (expression.properties as Property[]).find(
      (prop: Property, numIndex: number) => {
        var index;
        if (prop.key.type === "Literal") {
          index = prop.key.value;
        } else if (prop.key.type === "Identifier") {
          index = prop.key.name;
        }

        if (index === "AQRb") {
          console.log("found");
          console.log(numIndex);
          return prop;
        }

        // return { factory: prop.value, index: index };
      }
    ) as any;
  } else {
    throw Error(`Can't patch vendor bundle..`);
  }
}

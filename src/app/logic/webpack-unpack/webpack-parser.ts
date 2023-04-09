// import assert from 'assert';
// @ts-ignore
// const assert: typeof import("assert")  = 'assert';
// @ts-ignore
const acorn: typeof import("acorn")  = window.require('acorn');
// @ts-ignore
const astring: typeof import("astring")  = window.require('astring');
// @ts-ignore
const scan: typeof import("scope-analyzer")  = window.require('scope-analyzer');

const multisplice = window.require('multisplice');
// @ts-ignore
// const {Program}: typeof import("@types/estree") = window.require('@types/estree');
type Program = any;
// const  fs: typeof import("fs") = window.require('fs');
export const parseWebpackFile = (source: string, opts: any) => {
    //@ts-ignore
    var ast: Program = acorn.parse(source, {ecmaVersion: 2019});
    // fs.writeFileSync('tree.json', JSON.parse(ast, null,2), 'utf-8');
    if (opts && opts.source) {
        source = opts.source;
    }

    if (source && Buffer.isBuffer(source)) {
        source = source.toString();
    }

    /*assert(
        !source || typeof source === 'string',
        'webpack-unpack: source must be a string or Buffer'
    );*/

    var meta = unpackRuntimePrelude(ast);

    if (!meta) meta = unpackJsonpPrelude(ast);
    if (!meta) return;

    var entryId = meta.entryId;
    var factories = meta.factories;

    /*if (!factories.every(isFunctionOrEmpty)) {
      return
    }*/
    var modules = [];
    for (var i = 0; i < factories.length; i++) {
        var factory = factories[i];
        if (factory.factory === null) continue;

        scan.crawl(factory.factory);
        // If source is available, rewrite the require,exports,module var names in place
        // Else, generate a string afterwards.
        var range = getModuleRange(factory.factory.body);
        var moduleSource = rewriteMagicIdentifiers(
            factory.factory,
            source ? source.slice(range.start, range.end) : null,
            range.start
        );
        if (!moduleSource) {
            moduleSource = astring.generate({
                type: 'Program',
                body: factory.factory.body.body,
            } as  Program);
        }

        var deps = getDependencies(factory.factory);

        modules.push({
            id: factory.index,
            source: moduleSource,
            deps: deps,
            entry: factory.index === entryId,
        });
    }

    return modules;
}

function unpackRuntimePrelude(ast:  Program) {
    // !(prelude)(factories)
    if (
        ast.body[0].type !== 'ExpressionStatement' ||
        ast.body[0].expression.type !== 'UnaryExpression' ||
        ast.body[0].expression.argument.type !== 'CallExpression'
    ) {
        // console.log(ast.body[0]);
        return;
    }

    // prelude = (function(t){})
    var outer = ast.body[0].expression.argument;
    if (
        outer.callee.type !== 'FunctionExpression' ||
        outer.callee.params.length !== 1
    ) {
        return;
    }
    var prelude = outer.callee.body;

    // Find the entry point require call.
    var entryNode = find(prelude.body.slice().reverse(), function (node: any) {
        if (node.type !== 'ExpressionStatement') {

          return false;
        }
        node = node.expression;
        if (node.type === 'SequenceExpression') {
            var exprs = node.expressions;
            node = exprs[exprs.length - 1];
        }
        return (
            node.type === 'CallExpression' &&
            node.arguments.length === 1 &&
            node.arguments[0].type === 'AssignmentExpression'
        );
    });
    if (entryNode) {
        entryNode = entryNode.expression;
        if (entryNode.type === 'SequenceExpression') {
            entryNode = entryNode.expressions[entryNode.expressions.length - 1];
        }
        entryNode = entryNode.arguments[0].right;
    }
    var entryId = entryNode ? entryNode.value : null;

    // factories = [function(){}]
    if (
        outer.arguments.length !== 1 ||
        (outer.arguments[0].type !== 'ArrayExpression' &&
            outer.arguments[0].type !== 'ObjectExpression')
    ) {

        return;
    }
    var factories = getFactories(outer.arguments[0]);

    return {
        factories: factories,
        entryId: entryId,
    };
}

function unpackJsonpPrelude(ast: Program) {
    // (prelude).push(factories)
    if (
        ast.body[0].type !== 'ExpressionStatement' ||
        ast.body[0].expression.type !== 'CallExpression' ||
        ast.body[0].expression.callee.type !== 'MemberExpression'
    ) {
        return;
    }

    var callee = ast.body[0].expression.callee;
    // (webpackJsonp = webpackJsonp || []).push
    // @ts-ignore
    if (callee.computed || callee.property.name !== 'push') return;
    if (callee.object.type !== 'AssignmentExpression') return;


    var args = ast.body[0].expression.arguments;
    // @ts-ignore
  if(!args[0] || !args[0].elements[0] || !args[0].elements[1])
    return;
    // ([ [bundleIds], [factories])
    if (args.length !== 1) return;
    if (args[0].type !== 'ArrayExpression') return;
    if (args[0].elements[0].type !== 'ArrayExpression') return;
    if (
        args[0].elements[1].type !== 'ArrayExpression' &&
        args[0].elements[1].type !== 'ObjectExpression'
    )
        return;

    var factories = getFactories(args[0].elements[1]);

    return {
        factories: factories,
        entryId: undefined,
    };
}

function isFunctionOrEmpty(node: any) {
    return node.factory === null || node.factory.type === 'FunctionExpression';
}

function getModuleRange(body: any) {
    if (body.body.length === 0) {
        // exclude {} braces
        return {start: body.start + 1, end: body.end - 1};
    }
    return {
        start: body.body[0].start,
        end: body.body[body.body.length - 1].end,
    };
}

function rewriteMagicIdentifiers(moduleWrapper: any, source: any, offset: any) {
    var magicBindings = moduleWrapper.params.map(scan.getBinding);
    var magicNames = ['module', 'exports', 'require'];
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
            ref.parent.type === 'CallExpression' &&
            ref.parent.callee === ref &&
            ref.parent.arguments[0].type === 'Literal'
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

function getFactories(node: any) {
    if (node.type === 'ArrayExpression') {
        return node.elements.map(function (factory: any, index: any) {
            return {factory: factory, index: index};
        });
    }
    if (node.type === 'ObjectExpression') {
        return node.properties.map(function (prop: any) {
            var index;
            if (prop.key.type === 'Literal') {
                index = prop.key.value;
            } else if (prop.key.type === 'Identifier') {
                index = prop.key.name;
            }
            return {factory: prop.value, index: index};
        });
    }
    return [];
}

const path = require('path');

function buildResolver(options = {}) {
  const aliasEntries = Object.entries(options.alias ?? {});
  const rootPrefix = Array.isArray(options.root) && options.root.length > 0 ? options.root[0] : '.';

  return function resolve(source) {
    if (typeof source !== 'string') return source;

    for (const [alias, target] of aliasEntries) {
      if (source === alias || source.startsWith(alias + '/')) {
        const remainder = source.slice(alias.length);
        const normalizedTarget = target.startsWith('./') || target.startsWith('../')
          ? path.join(rootPrefix, target)
          : target;
        const joined = remainder
          ? path.join(normalizedTarget, remainder.replace(/^\//, ''))
          : normalizedTarget;
        // Convert Windows backslashes to forward slashes for React Native tooling.
        return joined.split(path.sep).join('/');
      }
    }

    return source;
  };
}

module.exports = function moduleResolverFallback(babel) {
  return {
    name: 'module-resolver-fallback',
    pre() {
      this.__resolveAlias = buildResolver(this.opts ?? {});
    },
    visitor: {
      ImportDeclaration(path) {
        if (!this.__resolveAlias) return;
        const original = path.node.source.value;
        const resolved = this.__resolveAlias(original);
        if (resolved !== original) {
          path.node.source.value = resolved;
        }
      },
      ExportNamedDeclaration(path) {
        if (!this.__resolveAlias || !path.node.source) return;
        if (!path.node.source) return;
        const original = path.node.source.value;
        const resolved = this.__resolveAlias(original);
        if (resolved !== original) {
          path.node.source.value = resolved;
        }
      },
      ExportAllDeclaration(path) {
        if (!this.__resolveAlias) return;
        const original = path.node.source.value;
        const resolved = this.__resolveAlias(original);
        if (resolved !== original) {
          path.node.source.value = resolved;
        }
      },
      CallExpression(path) {
        if (!this.__resolveAlias) return;
        const callee = path.get('callee');
        if (
          callee.isIdentifier({ name: 'require' }) ||
          callee.isImport()
        ) {
          const args = path.get('arguments');
          if (args && args[0] && args[0].isStringLiteral()) {
            const original = args[0].node.value;
            const resolved = this.__resolveAlias(original);
            if (resolved !== original) {
              args[0].replaceWith(babel.types.stringLiteral(resolved));
            }
          }
        }
      },
    },
  };
};

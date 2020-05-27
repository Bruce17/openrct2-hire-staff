exports.createTypeScriptConfig = (outDir) => ({
  compilerOptions: {
    target: 'es5',
    module: 'commonjs',
    declaration: true,
    outDir,
    strict: true,
  },
  include: ['./src'],
  exclude: ['node_modules', '**/__tests__/*'],
});

exports.createNodemonConfig = () => ({
  events: {
    restart: 'npm run build:develop',
  },
});

exports.createVsCodeConfig = () => ({
  'typescript.tsdk': 'node_modules/typescript/lib',
});

exports.createTemplateModFile = (apiPath, modName, userName, modType) => `/// <reference path="${apiPath}" />

const main = () => {
  console.log('Your plug-in has started!');
};

registerPlugin({
  name: '${modName}',
  version: '1.0',
  authors: ['${userName}'],
  type: '${modType}',
  main,
});
  
`;

exports.createTemplateReadmeMd = (heading, text) => `# ${heading}

${text}
`;

module.exports = exports;
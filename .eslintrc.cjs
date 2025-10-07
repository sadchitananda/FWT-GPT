module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true
  },
  extends: ['eslint:recommended', 'plugin:react-hooks/recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  settings: {
    react: {
      version: '18.0'
    }
  },
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }]
  },
  plugins: ['react-refresh']
};

const { existsSync, promises: fs } = require('node:fs')
const { esbuildPluginIstanbul } = require('esbuild-plugin-istanbul')

// Respeta CHROME_BIN. Edge es una alternativa Chromium documentada para Windows.
if (!process.env.CHROME_BIN && process.platform === 'win32') {
  const candidatos = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe']
  process.env.CHROME_BIN = candidatos.find(existsSync)
}

module.exports = function (config) {
  const cobertura = Boolean(config.coverage)
  // El plugin usa la transformación interna de NYC; excluimos specs antes de instrumentar.
  const excluirPruebas = {
    name: 'excluir-pruebas',
    setup(build) {
      build.onLoad({ filter: /\.spec\.jsx?$|[\\/]pruebas[\\/]/ }, async ({ path }) => ({ contents: await fs.readFile(path, 'utf8'), loader: 'jsx' }))
    },
  }
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [{ pattern: 'src/**/*.spec.js*', watched: true, type: 'module' }],
    preprocessors: { 'src/**/*.spec.js*': ['esbuild'] },
    esbuild: {
      singleBundle: false, target: 'es2022', jsx: 'automatic', loader: { '.js': 'jsx' },
      plugins: cobertura ? [excluirPruebas, esbuildPluginIstanbul({ filter: /\.jsx?$/, loader: 'jsx', name: 'istanbul' })] : [],
    },
    reporters: cobertura ? ['progress', 'coverage'] : ['progress'],
    coverageReporter: {
      dir: 'coverage', subdir: '.',
      reporters: [{ type: 'text-summary' }, { type: 'html', subdir: 'html' }, { type: 'json-summary', file: 'coverage-summary.json' }, { type: 'json', file: 'coverage-final.json' }],
    },
    // Solo para un contenedor de pruebas aislado; no usar con navegación externa.
    customLaunchers: { ChromeHeadlessCI: { base: 'ChromeHeadless', flags: ['--no-sandbox'] } },
    browsers: [process.env.CHROME_NO_SANDBOX === '1' ? 'ChromeHeadlessCI' : 'ChromeHeadless'], singleRun: true, autoWatch: false,
    client: { jasmine: { random: true } },
    browserNoActivityTimeout: 60000, port: 9876, colors: false, logLevel: config.LOG_INFO, concurrency: 1,
  })
}

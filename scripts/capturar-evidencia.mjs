import { spawnSync } from 'node:child_process'

// Renueva las capturas versionadas solo cuando se solicita expresamente.
// Las pruebas habituales dejan sus imágenes en test-results/.
const resultado = spawnSync(process.execPath, ['node_modules/@playwright/test/cli.js', 'test'], {
	stdio: 'inherit',
	env: { ...process.env, ARENA_CAPTURE_EVIDENCE: '1' },
})

process.exit(resultado.status ?? 1)

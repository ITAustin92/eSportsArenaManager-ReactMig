import { defineConfig } from '@playwright/test'
export default defineConfig({
	testDir: './tests/e2e',
	fullyParallel: false,
	workers: 1,
	timeout: 60000,
	reporter: [['list'], ['html', { open: 'never' }]],
	use: {
		baseURL: 'http://localhost:4173',
		headless: true,
		launchOptions: process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {},
		channel: !process.env.CHROME_BIN && process.platform === 'win32' ? 'msedge' : undefined,
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure',
	},
	webServer:
		process.env.ARENA_EXTERNAL_SERVER === '1'
			? undefined
			: {
					command: 'npm run dev -- --host 127.0.0.1 --port 4173 --strictPort',
					env: { VITE_API_URL: process.env.ARENA_TEST_API_URL ?? 'http://localhost:8080' },
					url: 'http://127.0.0.1:4173',
					reuseExistingServer: !process.env.CI,
				},
})

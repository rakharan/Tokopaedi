import { configDefaults, defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    test: {
        coverage: {
            provider: 'v8',
            enabled: true,
            exclude: ["src/migration/**", "src/domain/model/params/**", "src/domain/model/request/**", "src/domain/model/response/**", "src/cronJobs/**"],

        },
        poolOptions: {
            threads: {
                singleThread: true
            }
        },
        hookTimeout: 20000,
        clearMocks: true,
        exclude: [...configDefaults.exclude, "src/migration/**", "src/domain/model/params/**", "src/domain/model/request/**", "src/domain/model/response/**", "src/cronJobs/**", 'build'],
    },
    plugins: [tsconfigPaths()],
})
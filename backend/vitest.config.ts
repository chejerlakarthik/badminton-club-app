import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['src/**/*.test.ts'],
        exclude: ['**/*.js', 'node_modules', 'dist', '.git'],
        globals: true,
        environment: 'node',
    },
});

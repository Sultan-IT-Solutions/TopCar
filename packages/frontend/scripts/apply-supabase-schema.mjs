import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const migrationPath = resolve(
    projectRoot,
    'supabase/migrations/20260323_000001_initial_schema.sql',
);
const envFilePath = resolve(projectRoot, '.env.local');

function parseEnvFile(filePath) {
    if (!existsSync(filePath)) {
        return {};
    }

    return readFileSync(filePath, 'utf8')
        .split('\n')
        .reduce((accumulator, line) => {
            const trimmed = line.trim();

            if (!trimmed || trimmed.startsWith('#')) {
                return accumulator;
            }

            const separatorIndex = trimmed.indexOf('=');
            if (separatorIndex === -1) {
                return accumulator;
            }

            const key = trimmed.slice(0, separatorIndex).trim();
            const rawValue = trimmed.slice(separatorIndex + 1).trim();
            const value = rawValue.replace(/^['"]|['"]$/g, '');

            accumulator[key] = value;
            return accumulator;
        }, {});
}

const envFromFile = parseEnvFile(envFilePath);
const databaseUrl = process.env.DATABASE_URL || envFromFile.DATABASE_URL;

if (!databaseUrl) {
    console.error(
        'DATABASE_URL is missing. Add it to packages/frontend/.env.local or the current shell environment.',
    );
    process.exit(1);
}

if (!existsSync(migrationPath)) {
    console.error(`Migration file not found: ${migrationPath}`);
    process.exit(1);
}

const result = spawnSync(
    'psql',
    ['--dbname', databaseUrl, '-v', 'ON_ERROR_STOP=1', '-f', migrationPath],
    {
        stdio: 'inherit',
        env: process.env,
    },
);

if (result.error) {
    console.error(
        'Failed to execute psql. Make sure PostgreSQL client tools are installed.',
    );
    console.error(result.error);
    process.exit(1);
}

process.exit(result.status ?? 0);

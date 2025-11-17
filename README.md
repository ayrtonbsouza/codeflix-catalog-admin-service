# Catalog Admin Service

Catalog administration service built with NestJS.

## 📋 Prerequisites

- [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Remote - Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) for VS Code

## 🚀 How to Run the Project

### Using Dev Container (Recommended)

This project is configured to run in a Dev Container, providing a consistent and isolated development environment.

#### 1. Open the Project in Dev Container

1. Open the project in Visual Studio Code
2. When prompted, click **"Reopen in Container"** or:
   - Press `F1` (or `Cmd+Shift+P` on macOS)
   - Type: **"Dev Containers: Reopen in Container"**
   - Select the option

#### 2. Wait for Initial Setup

The container will:
- Build the Docker image
- Install project dependencies (`pnpm install`)
- **Rebuild sqlite3** (this process may take a few minutes)

⚠️ **IMPORTANT**: Wait for the complete setup process to finish, especially the **sqlite3 rebuild**, before running any test commands. The `post-create.sh` script automatically runs the sqlite3 rebuild, but this process may take a few minutes.

You'll know the setup is complete when you see the message:
```
=== Setup completed successfully! ===
```

#### 3. Verify sqlite3 Rebuild

If you need to verify or manually run the sqlite3 rebuild:

```bash
bash scripts/rebuild-sqlite3.sh
```

Or, if you prefer to use pnpm directly:

```bash
pnpm rebuild sqlite3
```

#### 4. Run the Project

After the setup is complete, you can run the project:

```bash
# Development mode (with hot-reload)
pnpm start:dev

# Production mode
pnpm start:prod

# Debug mode
pnpm start:debug
```

The server will be available at `http://localhost:3000`

## 🧪 Running Tests

⚠️ **WARNING**: **NEVER** run tests before the sqlite3 rebuild is complete. This will cause failures in database-related tests.

### Wait for sqlite3 Rebuild

Before running `pnpm test`, make sure that:

1. The `post-create.sh` script has completely finished
2. You've seen the sqlite3 rebuild success message:
   ```
   ✓ sqlite3 rebuilt successfully
   ```

If you're not sure if the rebuild was completed, run it manually:

```bash
bash scripts/rebuild-sqlite3.sh
```

Wait until you see the success message before proceeding.

### Test Commands

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:cov

# Run E2E tests
pnpm test:e2e

# Run tests in debug mode
pnpm test:debug
```

## 📦 Available Scripts

```bash
# Development
pnpm start:dev      # Start server in development mode
pnpm start:debug    # Start server in debug mode
pnpm start:prod     # Start server in production mode

# Build
pnpm build          # Compile TypeScript project

# Tests
pnpm test           # Run unit tests
pnpm test:watch     # Run tests in watch mode
pnpm test:cov       # Run tests with code coverage
pnpm test:e2e       # Run end-to-end tests

# Code Quality
pnpm lint           # Run ESLint and fix issues
pnpm format         # Format code with Prettier
```

## 🛠️ Technologies Used

- **NestJS** - Node.js framework
- **TypeScript** - Programming language
- **Sequelize** - Database ORM
- **SQLite3** - Database
- **Jest** - Testing framework
- **pnpm** - Package manager

## 📁 Project Structure

```
.
├── src/                    # Source code
│   ├── categories/         # Categories module
│   ├── core/               # Business logic (domain, application, infra)
│   └── main.ts             # Application entry point
├── test/                   # E2E tests
├── .devcontainer/          # Dev Container configuration
├── scripts/                # Helper scripts
│   └── rebuild-sqlite3.sh  # Script to rebuild sqlite3
└── package.json            # Project dependencies and scripts
```

## 🔧 Troubleshooting

### Error when running sqlite3-related tests

If you encounter errors related to sqlite3 when running tests:

1. Make sure the sqlite3 rebuild was completed:
   ```bash
   bash scripts/rebuild-sqlite3.sh
   ```

2. If the problem persists, try reinstalling dependencies:
   ```bash
   rm -rf node_modules
   pnpm install
   bash scripts/rebuild-sqlite3.sh
   ```

### Container doesn't start correctly

1. Check if Docker is running
2. Try rebuilding the container:
   - Press `F1`
   - Type: **"Dev Containers: Rebuild Container"**
   - Select the option

### Permission issues

If you encounter permission issues, make sure the user in the container has the correct permissions. The container is configured to use the `node` user (UID 1001).

## 📝 Additional Notes

- The project uses **pnpm** as the package manager. Do not use `npm` or `yarn`.
- Jest is configured to **not** run automatically. Run tests manually when needed.
- The container's default timezone is configured to `America/Sao_Paulo`.

## 📄 License

This project is private and unlicensed.

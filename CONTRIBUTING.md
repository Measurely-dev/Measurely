# Developing Measurely

## Getting Started

Thank you for your interest in contributing to Measurely!

### Prerequisites

Ensure you have the following installed:

- [Git](https://git-scm.com/)
- [Go](https://go.dev/)
- [Node.js v20.x (LTS)](https://nodejs.org/)
- [pnpm](https://pnpm.io/) (latest version)
- [Docker](https://docs.docker.com/get-docker/) (if needed for services)

## Local Development

### Clone the Repository

```sh
git clone https://github.com/measurely-dev/measurely.git
cd measurely
```

### Backend Setup

```sh
cd backend
go run cmd/main.go   # start backend server
```

### Frontend Setup

```sh
cd frontend
pnpm install
pnpm dev # start frontend server
```

Visit the app at `http://localhost:3000`.

## Creating a Pull Request

1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Push to your fork and open a PR

## Community & Support

For any questions, join our discussions on GitHub or reach out via our community channels.

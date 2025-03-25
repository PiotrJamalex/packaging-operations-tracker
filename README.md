
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/c9e05a68-8eee-424f-87df-c737a1034989

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c9e05a68-8eee-424f-87df-c737a1034989) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Running with Docker

This project can be run in a Docker container. Here's how to build and run it:

### Using Docker Compose (recommended)

```sh
# Build and start the container
docker-compose up -d

# Stop the container
docker-compose down
```

### Using Docker directly

```sh
# Build the Docker image
docker build -t packaging-operations-tracker .

# Run the container
docker run -p 8080:80 -d --name packaging-ops packaging-operations-tracker

# Stop the container
docker stop packaging-ops
```

The application will be available at http://localhost:8080

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Docker

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c9e05a68-8eee-424f-87df-c737a1034989) and click on Share -> Publish.

Alternatively, you can deploy the Docker container to any cloud provider that supports Docker containers.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)

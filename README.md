# Clerk Authentication with React and Vite

This project demonstrates how to implement authentication in a React application using [Clerk](https://clerk.com/).

> **Latest Update:** v1.0.1 - Performance Fixes & Compliance UI (Deployed: Jan 27, 2026)

## Features

- User authentication (sign up, sign in, sign out)
- Protected routes
- Public pages
- User profile management

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Clerk account

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with your Clerk publishable key:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=your_publishable_key
   ```
   You can get this key from your Clerk dashboard.

## Running the Application

```bash
npm run dev
```

The application will be available at http://localhost:5173

## Project Structure

- `src/App.tsx`: Main application component with routing and Clerk provider setup
- `src/main.ts`: Entry point for the application
- `src/index.css`: Global styles

## Authentication Flow

- Public users can access the home page and see basic information
- Users can sign up or sign in using Clerk's pre-built components
- Authenticated users can access protected routes
- The UserButton component provides user profile management

## Customization

You can customize the Clerk components by following the [Clerk documentation](https://clerk.com/docs/customization/overview).

## Learn More

- [Clerk Documentation](https://clerk.com/docs)
- [React Router Documentation](https://reactrouter.com/)
- [Vite Documentation](https://vitejs.dev/)# my-app2

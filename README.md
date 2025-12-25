
# Peak Progress - Habit Tracker

This is a Next.js application built with Firebase Studio that serves as a fun, family-oriented habit tracker. It visualizes daily progress as a "mountain climb" challenge.

## About The Project

Peak Progress is designed to help families or groups track a shared daily goal in a simple and visually engaging way. The main interface is a calendar where each day can be marked as a success (a "climb") or a miss.

The app is built with a modern tech stack and is designed to be easily customizable.

### Key Features

*   **Daily Tracking:** Easily log whether a daily goal was met.
*   **Visual Calendar:** A full-month calendar view provides an at-a-glance overview of your progress.
*   **Success/Miss Indicators:** Days are clearly marked with icons to show whether the goal was achieved.
*   **Streak Calculation:** Automatically calculates and displays your current streak of consecutive "climbs".
*   **Total Progress:** Tracks the total number of successful days.
*   **Local Storage:** All data is saved in your browser's local storage, so your progress is preserved between sessions.
*   **Responsive Design:** The interface is optimized for both desktop and mobile devices.

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Date Management:** [date-fns](https://date-fns.org/)
*   **Icons:** [Lucide React](https://lucide.dev/)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You need to have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) (or yarn) installed on your machine.

### Installation & Running

1.  Clone the repository:
    ```sh
    git clone <your-repository-url>
    ```
2.  Navigate to the project directory:
    ```sh
    cd <project-directory>
    ```
3.  Install NPM packages:
    ```sh
    npm install
    ```
4.  Run the development server:
    ```sh
    npm run dev
    ```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result. You can start editing the main page by modifying `src/app/page.tsx`.

# History Twister

**This app was written, debugged, and deployed entirely by ChatGPT (GPT-4) in April 2023.**

Twist history with History Twister, powered by AI. This application uses the OpenAI API to generate creative, alternative versions of historical events based on user prompts.

## Features

- Responsive design with a navbar and About modal
- Parses and respects line breaks in API responses
- Share twisted history via Email and Twitter with unique result URLs
- CTA buttons to twist history again or start over

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine
- An OpenAI API key

### Installing

1. Clone this repository:

`git clone git@github.com:mattlebel/history-twister.git`

2. Change to the project directory:

`cd history-twister`

3. Install dependencies:

`npm install`


4. Create a `.env` file in the project root and add your OpenAI API key:

`OPENAI_API_KEY=your_openai_api_key`


5. Initialize the database by running the `initialize-db.js` script:

`node initialize-db.js`


## Running the Application

Start the application by running:

`npm start`

The application should now be running at [http://localhost:3000](http://localhost:3000).

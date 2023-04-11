# History Twister

**This app was written, debugged, and deployed entirely by ChatGPT (GPT-4) in April 2023.**

Production demo URL: [https://historytwister.com](https://historytwister.com)

Twist history with History Twister, powered by AI. This application uses the OpenAI API to generate creative, alternative versions of historical events based on user prompts.

---

Here's an example:

> Newspaper article: It's a day after the United States has surrendered to Axis powers and lost World War 2. Citizens are being instructed to report to their respective internment camps.

**Result:** [https://historytwister.com/results.html?twist=63af0cbc-8bc6-4dff-98c8-d88c2c61cd2f](https://historytwister.com/results.html?twist=63af0cbc-8bc6-4dff-98c8-d88c2c61cd2f)

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

## Database Configuration

For local development, this application uses SQLite. For production, it uses PostgreSQL. The application automatically switches between SQLite and PostgreSQL based on the `NODE_ENV` environment variable.

## Deploying to Heroku

1. Install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) and log in to your Heroku account:
`heroku login`

2. Create a new Heroku application:

`heroku create your-app-name`

3. Via the Heroku dashboard, add the Heroku PostgreSQL add-on

4. Via the Heroku dashboard, set your OpenAI API key and `NODE_ENV` as Heroku environment variables

5. Deploy your application to Heroku:

`git push heroku main`

6. Open your deployed application in a web browser:

`heroku open`

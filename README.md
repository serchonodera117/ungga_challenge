# Ungga Challenge

[![PR's Welcomes](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)]()
[![GitHub pull requests](https://img.shields.io/github/issues-pr/cdnjs/cdnjs.svg?style=flat)]()

In this repository, you'll find an existing web interface project. The challenge is to develop the backend for this application, which will function as an interactive bot and communicate with the web interface through an API.


**Objective**: Develop a backend that serves as an assistant using ChatGPT and communicates with the web interface through an API. You can refer to OpenAI's documentation at [OpenAI Assistants](https://platform.openai.com/docs/assistants/overview) and [Function Calling](https://platform.openai.com/docs/guides/function-calling) for guidance.

**Language and Technology**: You are free to choose the programming language and technologies you deem most suitable for integrating ChatGPT and building the API.

**UI Requirement and Modification**: It is mandatory to use the existing web interface. You have the option to make modifications to the UI to seamlessly integrate and enhance the interaction with your assistant.

**Assistant Capabilities**:

- The assistant should be able to schedule appointments.
- It should extract and store information such as name, email, and phone number.
- If the assistant already has this information, it should use it for scheduling another appointment without prompting for the data again.

**Data Storage**: All messages and relevant information exchanged with the assistant should be saved in a database of your choice.

**Configuration**:

- Configure the backend to interact with the chosen database.
- Update the `.env` file with the assistant's URL. The backend should expect messages in the format: `{user_id: 'id', message: 'the user message'}`, and it should wait for a string response. *Note that this configuration may be subject to modification based on your implementation*.

**Project Run Instructions**:

Provide precise instructions for setting up and running your project, including any dependencies that need to be installed.


**Demo Video**:

Include a Loom video demonstrating the functionality of your project. Clearly show how the assistant interacts with the web interface.


## Getting started 🧑🏻‍💻

1. Clone this repository.
   ```bash
   git clone https://github.com/Nuclea-Solutions/ungga-challenge
   ```

2. In the root directory, run the following command:

   ```bash
      # using npm
      npm install
      # using pnpm
      pnpm install
      # using bun
      bun install
   ```

3. Run project

   ```bash
      # using npm
      npm run dev
      # using pnpm
      pnpm run dev
      # using bun
      bun run dev

   ```

## Run Storybook 🚀

- Running Storybook in this project runs the following command.

```bash
   # using npm
   npm run storybook
   # using pnpm
   pnpm run storybook
   # using bun
   bun run storybook
```

- Building Storybook runs the following command.

```bash
   # using npm
   npm run build-storybook
   # using pnpm
   pnpm run build-storybook
   # using bun
   bun run build-storybook

```

#### Project's Storybook link 🔗

https://64d0fe6c6d2314c32ab59491-zeicjrcspl.chromatic.com/

## Technologies Used (Frontend)💼

- Next js
- React js
- TypeScript
- Node js
- Tailwind css

## Technologies Used (Backend)💼

- TODO

## Contribution 👨🏻👧🏻🌍

If you want to contribute to this project, follow the steps below:

- Clone the repository.
- Create a new branch: `git checkout -b name`
- Create your commit: `git commit -m 'Add new functionality`
- Push your changes: `git push origin <branch>`
- Open a pull request.

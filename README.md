# INVANTI Portal
## Getting started

1. Clone this project onto your local machine.
2. Open up two terminals.
3. Using one of the terminals, `cd` into the root folder of this project.
4. Run `npm i` and wait for it to complete.
5. Then, run `npm run serve` to start the front end.
  - It is going to be at `localhost:3000`.
6. Using the other terminal, cd into the `functions` directory of this project.
7. Run `npm i` and wait for it to complete.
8. Run `firebase use invanti-test` to ensure you are using the correct Firebase project.
8. Then, run `npm run serve` to start backend.
  - On changes to code in the TypeScript files, use a 3rd terminal to run `npm run build` in the `functions` directory to update the running JS files.

## Dependencies
  - NPM: 6.4.1
  - Node: 10.10.0
  - Firebase (command line): 7.11.0

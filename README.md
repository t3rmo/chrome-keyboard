# Chrome Extension TypeScript Starter

![build](https://github.com/chibat/chrome-extension-typescript-starter/workflows/build/badge.svg)

Chrome Extension, TypeScript and Visual Studio Code

## Chrome Keyboard

This is a virtual keyboard extension for chromium based browsers.
The extension uses native keyboard events and is therefore compatible with modern JavaScript frameworks.
The extension is based on [simple-keyboard](https://github.com/hodgef/simple-keyboard).

### Plugin-specific HTML classes

When the following classes are present on the input, the plugin will behave differently.

- `no-keyboard` - do not pop up the keyboard when the input is focused. Instead, a button is shown to open the keyboard manually.

## Contribution

Suggestions and pull requests are welcomed!.

---

The base of this project was forked in version 0.4.6 from [Chrome Simple Keyboard](https://github.com/alex9849/chrome-simple-keyboard)
This project was bootstrapped with [Chrome Extension Typescript starter](https://github.com/chibat/chrome-extension-typescript-starter)

## Prerequisites

- [node + npm](https://nodejs.org/) (Current Version)

## Includes the following

- TypeScript
- Webpack
- React
- Jest
- Example Code
  - Chrome Storage
  - Options Version 2
  - count up badge number
  - background

## Project Structure

- src/typescript: TypeScript source files
- src/assets: static files
- dist: Chrome Extension directory
- dist/js: Generated JavaScript files

## Setup

```
npm install
```

## Build

```
npm run build
```

## Build in watch mode

### terminal

```
npm run watch
```

### Visual Studio Code

Run watch mode.

type `Ctrl + Shift + B`

## Load extension to chrome

Load `dist` directory

## Test

`npx jest` or `npm run test`

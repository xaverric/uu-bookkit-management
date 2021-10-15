#!/usr/bin/env node

let setState = require("./app/bookKitMng");
const commandLineArgs = require("command-line-args");
const commandLineUsage = require("command-line-usage");


const parametersdefinitions =[
  {
    name: "book",
    alias: "b",
    type: String,
    typeLabel: "{underline bookUri}",
    description: "URI to the book."
  },
  {
    name: "state",
    alias: "s",
    typeLabel: "{underline active}",
    description: "State to set.",
    type: String,
    defaultOption: true
  },
  {
    name: "username",
    alias: "U",
    type: String,
    description: "username credentials"
  },
  {
    name: "password",
    alias: "P",
    type: String,
    description: "password credentials"
  },
  {
    name: "help",
    alias: "h",
    type: Boolean,
    description: "Displays this usage guide."
  }
];


const sections = [
  {
    header: "book-manager",
    content: "Provides bulk management functions for BookKit."
  },
  {
    header: "Synopsis",
    content: [
      "book-manager {bold --book} {underline bookUri} {bold --state} {underline active} {bold --username} {underline accessCode1} {bold --password} {underline accessCode2}",
      "book-manager {bold --help}"
    ]
  },
  {
    header: "Parameters",
    optionList: parametersdefinitions
  }
];
const usage = commandLineUsage(sections);
const options = commandLineArgs(parametersdefinitions);

const valid = options.help || (options.book && options.state);
if (!valid || options.help) {
  console.log(usage);
  process.exit();
}


setState(options.book, options.state, options.username, options.password);

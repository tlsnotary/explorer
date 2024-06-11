#!/bin/bash

# changing directory to ./rs/verifier
cd ./rs/verifier

# checking if node_modules directory exists
if [ ! -d "./node_modules" ]; then
    # install the dependencies using npm i command if node_modules not found
    npm i
fi

# build the project using npm run build command
npm run build
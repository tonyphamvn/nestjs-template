#!/bin/bash

echo "Start DATABASE ..."
yarn db:up

if [ $NODE_ENV == "development" ]; then
    echo "Start dev ..."
    yarn start:dev
else
    echo "Start prod ..."
    node dist/main
fi

#!/bin/bash
set -ex

aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 490752553772.dkr.ecr.eu-central-1.amazonaws.com

docker build -t tlsnotary-explorer -f apps/Dockerfile .
docker tag tlsnotary-explorer:latest 490752553772.dkr.ecr.eu-central-1.amazonaws.com/tlsnotary-explorer:latest
docker push 490752553772.dkr.ecr.eu-central-1.amazonaws.com/tlsnotary-explorer:latest

exit 0

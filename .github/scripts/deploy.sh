#!/bin/bash
set -ex

ecs_cluster="tlsnotary-explorer"
services="tlsnotary-explorer"

for service in $services; do
  tlsnotary_explorer_revision=$(aws ecs describe-task-definition --task-definition $service --query "taskDefinition.revision")
  aws ecs update-service --cluster $ecs_cluster --service $service --force-new-deployment --task-definition $service:$tlsnotary_explorer_revision
done

aws ecs wait services-stable --cluster $ecs_cluster --services $services && break || continue

exit 0

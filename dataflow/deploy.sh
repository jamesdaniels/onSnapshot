#!/bin/bash

if [ "$#" -ne 2 ]; then
   echo "Usage:   ./run_oncloud.sh project-name  bucket-name"
   echo "Example: ./run_oncloud.sh cloud-training-demos  cloud-training-demos"
   exit
fi

PROJECT=$1
BUCKET=$2
MAIN=com.onsnapshot.dataflow.StreamDemoConsumer

mvn compile -e exec:java \
 -Dexec.mainClass=$MAIN \
      -Dexec.args="--project=$PROJECT_ID \
      --stagingLocation=gs://$BUCKET/staging/ \
      --tempLocation=gs://$BUCKET/staging-mytemp \
      --output=$PROJECT_ID:demos.streamdemo \
      --input=projects/$PROJECT_ID/topics/streamdemo \
      --runner=DataflowRunner"
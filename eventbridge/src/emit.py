import argparse
import boto3
import json
import os
from datetime import datetime

session = boto3.session.Session()
client = session.client("events")
bus = os.environ.get("EVENTBRIDGE_BUS_ARN", "template")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--file", required=True, help="payload")
    args = ap.parse_args()
    with open(args.file) as f:
        payload = json.load(f)
        print(json.dumps(payload))
        response = client.put_events(
            Entries=[
                {
                    "EventBusName": bus,
                    "Source": "cloud.heeki.emit",
                    "Time": datetime.now(),
                    "DetailType": "custom",
                    "Detail": json.dumps(payload)
                }
            ]
        )
        print(json.dumps(response))

if __name__ == "__main__":
    main()

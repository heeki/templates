## Implementation
Be sure to update the permissions policy for the Lambda authorizer with the new API endpoint that you create with this stack.

## Notes
Got tripped on with `sam local start-api` not recognizing attached Lambda functions. This was resolved by updating `type: AWS_PROXY` to `type: aws_proxy`.
Also, payloadFormatVersion can't take a parameter value, so had to hard code that to "1.0".

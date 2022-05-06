import boto3
import botocore

class AdptSQS:
    def __init__(self, session, queue_url):
        self.session = session
        self.client = self.session.client("sqs")
        self.queue_url = queue_url

    def send_message(self, message):
        response = self.client.send_message(
            QueueUrl=self.queue_url,
            MessageBody=message
        )
        return response

    def send_message_batch(self, batches):
        try:
            response = self.client.send_message_batch(
                QueueUrl=self.queue_url,
                Entries=batches
            )
        except botocore.exceptions.ClientError as e:
            print(e)
            half = len(batches)//2
            a = batches[:half]
            b = batches[half:]
            response = []
            if len(a) > 0:
                response.append(self.client.send_message_batch(
                    QueueUrl=self.queue_url,
                    Entries=a
                ))
            if len(b) > 0:
                response.append(self.client.send_message_batch(
                    QueueUrl=self.queue_url,
                    Entries=b
                ))
        return response

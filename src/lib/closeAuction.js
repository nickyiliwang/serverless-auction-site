import AWS from "aws-sdk";

const dynamodb = new AWS.DynamoDB.DocumentClient();
// Instead of returning something, we are instead creating a sqs client and using it to send emails to seller and bidder
const sqs = new AWS.SQS();

export async function closeAuction(auction) {
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id: auction.id },
    UpdateExpression: "set #status = :status",
    ExpressionAttributeValues: {
      ":status": "CLOSED",
    },
    ExpressionAttributeNames: {
      "#status": "status",
    },
  };

  await dynamodb.update(params).promise();
  const { title, seller, highestBid } = auction;
  const { amount, bidder } = highestBid;

  // instead of !highestBid, amount === 0 meant no one bid on it
  if (amount === 0) {
    // wait for the sqs to send message and then just return
    await sqs
      .sendMessage({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        // we needed to stringify this string for notification service
        MessageBody: JSON.stringify({
          subject: "Oh no your item isn't sold within the alloted time!",
          recipient: seller,
          body: `Your item "${title}" has timed out ! Better luck next time!`,
        }),
      })
      .promise();

    return;
  }

  // generating 2 promises to resolve at the same time with promise.All, and sending both the seller and bider the email
  const notifySeller = sqs
    .sendMessage({
      QueueUrl: process.env.MAIL_QUEUE_URL,
      // we needed to stringify this string for notification service
      MessageBody: JSON.stringify({
        subject: "You item has been sold!",
        recipient: seller,
        body: `Woohoo! Your item "${title} has been sold for $${amount}.`,
      }),
    })
    .promise();

  const notifyBidder = sqs
    .sendMessage({
      QueueUrl: process.env.MAIL_QUEUE_URL,
      // we needed to stringify this string for notification service
      MessageBody: JSON.stringify({
        subject: "Congratulations! You won an auction!",
        recipient: bidder,
        body: `What a great deal! You got yourself a "${title}" for $${amount}`,
      }),
    })
    .promise();

  return Promise.all([notifySeller, notifyBidder]);
}

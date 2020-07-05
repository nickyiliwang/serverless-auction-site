import { v4 as uuid } from "uuid";
import AWS from "aws-sdk";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {
  const { title } = JSON.parse(event.body);
  const now = new Date();

  const auction = {
    id: uuid(),
    title,
    status: "OPEN",
    createdAt: now.toISOString(),
  };

  // Waiting for the put action to finish, and return a promise, await the promise to finish then return.
  const putObjectPromise = await dynamodb
    .put({
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Item: auction,
    })
    .promise();

  await putObjectPromise.then((data) => {
    auction.status = "HAHAHAHAAHAHA";
  });

  return {
    statusCode: 201,
    body: JSON.stringify(auction),
  };
}

export const handler = createAuction;

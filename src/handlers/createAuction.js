import { v4 as uuid } from "uuid";
import AWS from "aws-sdk";
// before common middleware
import middy from "@middy/core";
// no need for JSON.parse, auto json parse
import httpJsonBodyParser from "@middy/http-json-body-parser";
// Normalizer, prevents throwing error if no prop, just shows undefined
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpErrorHandler from "@middy/http-error-handler";
import createError from "http-errors";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {
  // before httpJsonBodyParser
  // const { title } = JSON.parse(event.body);
  // after
  const { title } = event.body;
  const now = new Date();

  const auction = {
    id: uuid(),
    title,
    status: "OPEN",
    createdAt: now.toISOString(),
  };
  try {
    // Waiting for the put action to finish, and return a promise, await the promise to finish then return/ for error handling
    await dynamodb
      .put({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Item: auction,
      })
      .promise();
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 201,
    body: JSON.stringify(auction),
  };
}

// using middy here
export const handler = middy(createAuction)
  .use(httpJsonBodyParser())
  .use(httpEventNormalizer())
  .use(httpErrorHandler());

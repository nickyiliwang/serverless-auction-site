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

async function getAuctions(event, context) {
  let auctions;

  try {
    const result = await dynamodb.scan({
      TableName: process.env.AUCTIONS_TABLE_NAME,
    }).promise();

    auctions = result.Items
  } catch (error) {
    // not a good idea to expose internal error to users, dev only
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auctions),
  };
}

// using middy here
export const handler = middy(getAuctions)
  .use(httpJsonBodyParser())
  .use(httpEventNormalizer())
  .use(httpErrorHandler());

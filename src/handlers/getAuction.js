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

async function getAuction(event, context) {
  let auction;
  const { id } = event.pathParameters;

  try {
    const result = await dynamodb
      .get({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
      })
      .promise();

    auction = result.item;
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  if (!auction) {
    throw new createError.NotFound(`Auction with ID "${id}" not found !`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auction),
  };
}

// using middy here
export const handler = middy(getAuction)
  .use(httpJsonBodyParser())
  .use(httpEventNormalizer())
  .use(httpErrorHandler());

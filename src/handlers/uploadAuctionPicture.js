import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import createError from "http-errors";
import { getAuctionById } from "./getAuction";
import { uploadPictureToS3 } from "../lib/uploadPictureToS3";
import AWS from "aws-sdk";
import schema from "../lib/schemas/uploadAuctionPictureSchema";
import validator from "@middy/validator";

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function uploadAuctionPicture(event) {
  const { id } = event.pathParameters;
  const { email } = event.requestContext.authorizer;
  const auction = await getAuctionById(id);
  // remove corrupted/unneeded strings
  const base64 = event.body.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64, "base64");

  // Bid identity validation
  if (auction.seller !== email) {
    throw new createError.Forbidden(
      `You must be the owner to upload product image!`
    );
  }

  let updatedAuction;

  try {
    const pictureUrl = await uploadPictureToS3(auction.id + ".jpg", buffer);

    const params = {
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Key: { id },
      UpdateExpression: "set pictureUrl = :pictureUrl",
      ExpressionAttributeValues: {
        ":pictureUrl": pictureUrl,
      },
      ReturnValues: "ALL_NEW",
    };
    // pictureUrl
    const result = await dynamodb.update(params).promise();

    updatedAuction = result.Attributes;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction),
  };
}

export const handler = middy(uploadAuctionPicture)
  .use(httpErrorHandler())
  .use(validator({ inputSchema: schema }));

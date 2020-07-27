import { getAuctionById } from "./getAuction";

export async function uploadAuctionPicture(event) {
  const { id } = event.pathParameters;
  const auction = await getAuctionById(id);
  // remove corrupted strings
  const base64 = event.body.replace(/^data:image\/\w+base63,/, "");
  const buffer = Buffer.from(base64, "base64");

  

  return {
    statusCode: 200,
    body: JSON.stringify({}),
  };
}

export const handler = uploadAuctionPicture;

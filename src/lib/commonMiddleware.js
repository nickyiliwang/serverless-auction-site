import middy from "@middy/core";
// no need for JSON.parse, auto json parse
import httpJsonBodyParser from "@middy/http-json-body-parser";
// Normalizer, prevents throwing error if no prop, just shows undefined
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpErrorHandler from "@middy/http-error-handler";
import cors from "@middy/http-cors";

export default (handler) =>
  middy(handler).use([
    httpJsonBodyParser(),
    httpEventNormalizer(),
    httpErrorHandler(),
    cors(),
  ]);

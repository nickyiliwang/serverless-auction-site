## Serverless Auction Site

# Tech stack

CloudFormation template YAML created using the serverless bundle for CI/CD, including configuring IAM roles and creating lambda functions handles and API Gateway RESTful apis for CRUD operations. User data / auction data are stored in DynamoDB.

Auth0 for authentication and using it with AWS

middy middleware for json paring, error handling, normalizing, (commonMiddleware), http-errors to generate error messages for try catch, JSON schemas to validate requests, generate error messages response headers.

webpack and babel for compatibility

# TODO:

add Prod URL to Allowed Callback URLs, Allowed Logout URLs and Allowed Web Origins

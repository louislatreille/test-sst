import { StackContext, Api, Table, Auth } from "@serverless-stack/resources";
import * as iam from "aws-cdk-lib/aws-iam";

export function MyStack({ stack }: StackContext) {
  const mainTable = new Table(stack, "MainTable", {
    fields: {
      pk: "string",
      sk: "string",
    },
    primaryIndex: { partitionKey: "pk", sortKey: "sk" },
  });

  const cognitoAuth = new Auth(stack, "Auth", {
    login: ["email", "phone", "username", "preferredUsername"],
  });

  const api = new Api(stack, "api", {
    authorizers: {
      cognitoAuthorizer: {
        type: "user_pool",
        userPool: {
          id: cognitoAuth.userPoolId,
          clientIds: [cognitoAuth.userPoolClientId],
        },
      },
    },
    defaults: {
      function: {
        memorySize: "256 MB",
        timeout: "5 seconds",
      },
    },
    routes: {
      "GET /messages": {
        function: {
          handler: "functions/getMessages/handler.main",
          environment: { MAIN_TABLE_NAME: mainTable.tableName },
          permissions: [
            new iam.PolicyStatement({
              actions: ["dynamodb:Query"],
              effect: iam.Effect.ALLOW,
              resources: [mainTable.tableArn],
            }),
          ],
        },
      },
      "POST /messages": {
        function: {
          handler: "functions/postMessage/handler.main",
          environment: { MAIN_TABLE_NAME: mainTable.tableName },
          permissions: [
            new iam.PolicyStatement({
              actions: ["dynamodb:UpdateItem"],
              effect: iam.Effect.ALLOW,
              resources: [mainTable.tableArn],
            }),
          ],
        },
      },
      "POST /function3": {
        authorizer: "cognitoAuthorizer",
        function: {
          handler: "functions/function3/handler.main",
          environment: { COGNITO_POOL_ID: cognitoAuth.userPoolId, COGNITO_IDENTITY_POOL_ID: cognitoAuth.cognitoIdentityPoolId ?? "" },
        },
      },
    },
  });
  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}

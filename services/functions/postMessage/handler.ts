import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { middyfy } from "../utilities/middleware";
import { validateEnvVariables } from "../utilities/utilities";
import { Event, schema } from "./schema";

type Dependencies = {
  region: string;
  mainTableName: string;
};

export const builder = (deps: Dependencies) => {
  const mainTableName = deps.mainTableName;
  const ddbClient = new DynamoDBClient({ region: deps.region });

  const handler = async (event: Event) => {
    console.log("Hello from function 1!");

    const now = Date.now();
    const updateItem = new UpdateItemCommand({
      TableName: mainTableName,
      Key: {
        pk: {
          S: `U#${event.body.name}`,
        },
        sk: {
          S: `T#${now}`,
        },
      },
      UpdateExpression: "SET username = :username, message = :message",
      ExpressionAttributeValues: {
        ":username": {
          S: event.body.name,
        },
        ":message": {
          S: event.body.message,
        },
      },
    });

    await ddbClient.send(updateItem);

    return {
      statusCode: 200,
    };
  };

  return handler;
};

export const main = middyfy(
  builder({
    region: validateEnvVariables("AWS_REGION"),
    mainTableName: validateEnvVariables("MAIN_TABLE_NAME"),
  }),
  schema,
);

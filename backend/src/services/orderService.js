import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand, GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
dotenv.config();

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Create DocumentClient
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = 'rave-lite-orders';

export const createOrder = async (order) => {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      ...order,
      id: uuidv4().split('-')[0],
      createdAt: new Date().toISOString()
    }
  };
  await docClient.send(new PutCommand(params));
  return params.Item;
};

export const getAllOrders = async () => {
  const params = {
    TableName: TABLE_NAME
  };
  const result = await docClient.send(new ScanCommand(params));
  return result.Items;
};

export const getOrderById = async (id) => {
  const params = {
    TableName: TABLE_NAME,
    Key: { id }
  };
  const result = await docClient.send(new GetCommand(params));
  return result.Item;
};

export const getOrdersByUserEmail = async (email) => {
  const params = {
    TableName: TABLE_NAME,
    FilterExpression: 'userEmail = :email',
    ExpressionAttributeValues: {
      ':email': email
    }
  };
  const result = await docClient.send(new ScanCommand(params));
  return result.Items;
};

export const updateOrder = async (id, updates) => {
  const params = {
    TableName: TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set #status = :status',
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: {
      ':status': updates.status
    },
    ReturnValues: 'ALL_NEW'
  };
  const result = await docClient.send(new UpdateCommand(params));
  return result.Attributes;
};

export const deleteOrder = async (id) => {
  const params = {
    TableName: TABLE_NAME,
    Key: { id }
  };
  await docClient.send(new DeleteCommand(params));
};

export const cancelOrder = async (orderId) => {
  const params = {
    TableName: TABLE_NAME,
    Key: { id: orderId },
    UpdateExpression: 'set #status = :status',
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':status': 'Canceled',
    },
    ReturnValues: 'ALL_NEW'
  };
  const result = await docClient.send(new UpdateCommand(params));
  return result.Attributes;
};
// services/productService.js
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
const TABLE_NAME = 'rave-lite-products';

export const createProduct = async (product) => {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      ...product,       
      id: uuidv4().split('-')[0],
      createdAt: new Date().toISOString()
    }
  };
  await docClient.send(new PutCommand(params));
  return product;
};

export const getAllProducts = async () => {
  const params = {
    TableName: TABLE_NAME
  }; 
  const result = await docClient.send(new ScanCommand(params));
  return result.Items;
};

export const getProductById = async (id) => {
  const params = {
    TableName: TABLE_NAME,
    Key: { id }
  };
  const result = await docClient.send(new GetCommand(params));
  return result.Item;
};

export const updateProduct = async (id, updates) => {
  const params = {
    TableName: TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set #n = :n, price = :p, image = :i, description = :d',
    ExpressionAttributeNames: {
      '#n': 'name'
    },
    ExpressionAttributeValues: {
      ':n': updates.name,
      ':p': updates.price,
      ':i': updates.image,
      ':d': updates.description
    },
    ReturnValues: 'ALL_NEW'
  };
  const result = await docClient.send(new UpdateCommand(params));
  return result.Attributes;
};

export const deleteProduct = async (id) => {
  const params = {
    TableName: TABLE_NAME,
    Key: { id }
  };
  await docClient.send(new DeleteCommand(params));
};
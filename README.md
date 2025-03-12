# Rave Lite

Rave Lite is a modern e-commerce platform powered by AI, designed to provide a seamless and intuitive shopping experience. Built with React, Node.js, and AWS services, this application demonstrates how artificial intelligence can enhance online retail.

## Features

- **AI-powered Shopping Assistant**: Get product recommendations and support through an integrated AI assistant
- **Product Browsing**: Browse through a catalog of products with search functionality
- **Shopping Cart**: Add products to your cart and manage quantities
- **Order Management**: Place orders and track their status
- **User Profiles**: Manage your user information and view order history
- **Admin Dashboard**: Manage products and orders (admin access)

## Project Structure

The project is organized into frontend and backend directories:

### Frontend (React + Vite)

```
frontend/
├── public/             # Public assets
├── src/                # Source files
│   ├── assets/         # Static assets
│   ├── components/     # React components
│   ├── config/         # Configuration files
│   └── utils/          # Utility functions
└── package.json        # Dependencies and scripts
```

### Backend (Node.js + Express)

```
backend/
├── src/
│   ├── controllers/    # Request handlers
│   ├── routes/         # API route definitions
│   ├── services/       # Business logic
│   └── lambda/         # AWS Lambda functions
└── package.json        # Dependencies and scripts
```

## Technologies Used

- **Frontend**:
  - React
  - React Router
  - Tailwind CSS
  - Axios
  - Vite

- **Backend**:
  - Node.js
  - Express
  - AWS DynamoDB
  - AWS Lambda
  - OpenAI API
  - AWS Bedrock

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- AWS account with appropriate credentials
- OpenAI API key

### Installation

1. Clone the repository:
```
git clone <repository-url>
cd rave-lite
```

2. Install backend dependencies:
```
cd backend
npm install
```

3. Set up environment variables:
Create a `.env` file in the backend directory with the following variables:
```
OPENAI_API_KEY=your_openai_api_key
OPENAI_ASSISTANT_ID=your_assistant_id
BEDROCK_AGENT_ID=your_bedrock_agent_id
BEDROCK_AGENT_ALIAS_ID=your_bedrock_agent_alias_id
AWS_REGION=your_aws_region
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
```

4. Install frontend dependencies:
```
cd ../frontend
npm install
```

5. Create a `.env` file in the frontend directory:
```
VITE_API_BASE_URL=http://localhost:3000/api
```

### Running the Application

1. Start the backend server:
```
cd backend
npm run dev
```

2. Start the frontend development server:
```
cd frontend
npm run dev
```

3. Access the application at `http://localhost:5173`

## API Endpoints

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a specific product
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

### Orders

- `POST /api/orders` - Create a new order
- `GET /api/orders` - Get all orders
- `GET /api/orders/user` - Get orders by user email
- `GET /api/orders/:id` - Get a specific order
- `PUT /api/orders/:id` - Update an order
- `DELETE /api/orders/:id` - Delete an order

### AI Assistant

- `POST /api/ai/start` - Start a new OpenAI conversation
- `POST /api/ai/message` - Send a message to OpenAI assistant
- `POST /api/ai/bedrock/start` - Start a new AWS Bedrock conversation
- `POST /api/ai/bedrock/message` - Send a message to AWS Bedrock assistant

## Building for Production

1. Build the frontend:
```
cd frontend
npm run build
```

2. The production-ready files will be available in the `frontend/dist` directory, which can be served by the backend or a static file server.

## Contact

For questions or more information, please contact [Ishaq Ansari](mailto:ishaq.ansari.work@gmail.com).

## License

This project is licensed under the ISC License.
# Trucking Platform - Load Posting System

## Project Overview

This application is a platform that connects shippers and truckers, allowing shippers to post loads and truckers to bid on them. The system includes real-time tracking, financial management, and a benefits system for truckers with eligibility criteria.

## Features Implemented

- ✅ **Load Posting System**: Shippers can post loads with detailed information
- ✅ **Bidding Mechanism**: Truckers can bid on loads that match their criteria
- ✅ **Eligibility Criteria for Truckers**: Verification system for truckers based on predefined criteria
- ✅ **Load Tracking**: Real-time tracking of loads with status updates and map visualization
- ✅ **Financial Management**: Transaction ledger for both shippers and truckers
- ✅ **Benefits System**: Discount and benefit management for eligible truckers
- ✅ **SuperAdmin Dashboard**: For system administrators to manage users and operations

## Tech Stack

### Frontend
- **Next.js**: React framework for building the user interface
- **Tailwind CSS**: For styling components
- **Axios**: For making API requests to the backend
- **React Context API**: For state management

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework for building the API
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT**: For authentication and authorization
- **Socket.io**: For real-time updates (would be implemented for production)

## Architecture

The application follows a MERN stack architecture with the addition of Next.js on the frontend:

- **Models**: MongoDB schema definitions for Users, Shippers, Truckers, Loads, Bids, etc.
- **Controllers**: Handle business logic and database operations
- **Routes**: Define API endpoints
- **Middleware**: Authentication, authorization, and error handling
- **Frontend Pages**: Next.js pages for different views
- **Components**: Reusable React components
- **Context**: State management with React Context API

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn package manager

### Installation

1. Clone the repository
```bash
git clone https://github.com/Lovjeet1233/Trucking-Platform.git
cd Trucking-Platform
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Set up environment variables
   - Copy `.env.example` to `.env` and update the values with your own
   ```bash
   cp .env.example .env
   ```
   - Update the MongoDB URI, JWT secret, and other required values

4. Install frontend dependencies
```bash
cd ../frontend
npm install
```

5. Run the application
   - Backend:
   ```bash
   cd backend
   npm run dev
   ```
   - Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

6. Access the application
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api/v1

## API Documentation

The API is built around RESTful principles. Here are the main endpoints:

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user
- `GET /api/v1/auth/logout` - Logout user

### Shipper Operations
- `POST /api/v1/shippers` - Create shipper profile
- `GET /api/v1/shippers/profile` - Get shipper profile
- `PUT /api/v1/shippers/profile` - Update shipper profile

### Trucker Operations
- `POST /api/v1/truckers` - Create trucker profile
- `GET /api/v1/truckers/profile` - Get trucker profile
- `PUT /api/v1/truckers/profile` - Update trucker profile
- `PUT /api/v1/truckers/location` - Update trucker location

### Load Management
- `POST /api/v1/loads` - Create a new load
- `GET /api/v1/loads` - Get all loads
- `GET /api/v1/loads/:id` - Get a single load
- `PUT /api/v1/loads/:id` - Update a load
- `DELETE /api/v1/loads/:id` - Delete a load
- `GET /api/v1/loads/shipper/me` - Get shipper's loads
- `GET /api/v1/loads/available` - Get available loads for truckers

### Bidding System
- `POST /api/v1/bids` - Place a bid
- `GET /api/v1/bids/load/:loadId` - Get bids for a load
- `GET /api/v1/bids/trucker/me` - Get trucker's bids
- `PUT /api/v1/bids/:id/withdraw` - Withdraw a bid
- `PUT /api/v1/bids/:id/accept` - Accept a bid
- `PUT /api/v1/bids/:id/reject` - Reject a bid

### Load Tracking
- `POST /api/v1/tracking` - Create tracking update
- `GET /api/v1/tracking/load/:loadId` - Get tracking updates for a load
- `GET /api/v1/tracking/load/:loadId/latest` - Get latest tracking update
- `POST /api/v1/tracking/load/:loadId/issue` - Report an issue

### Financial Management
- `GET /api/v1/financial/user/me` - Get user's transactions
- `GET /api/v1/financial/:id` - Get a transaction

### Benefits System
- `GET /api/v1/benefits` - Get all benefits
- `POST /api/v1/benefits/:id/claim` - Claim a benefit
- `GET /api/v1/benefits/claims/me` - Get trucker's claimed benefits

## Database Models

The system uses several MongoDB models to represent the data:

1. **User**: Base user model with authentication details
2. **Shipper**: Extended user model for shipper-specific details
3. **Trucker**: Extended user model for trucker-specific details, including eligibility criteria
4. **Load**: Represents a load posted by a shipper
5. **Bid**: Represents a bid placed by a trucker on a load
6. **LoadTracking**: Stores tracking updates for loads
7. **Transaction**: Financial transactions between parties
8. **Benefit**: Available benefits for truckers
9. **BenefitClaim**: Claims made by truckers for benefits

## Use of AI Tools

Throughout the development process, I utilized several AI tools to assist with various aspects of the project:

### Claude (Anthropic)
- **Purpose**: Used for generating code structures, architectural planning, and debugging complex issues
- **Pros**: 
  - Excellent for generating comprehensive code solutions
  - Good understanding of MERN stack architecture
  - Helpful for explaining complex concepts
- **Cons**: 
  - Occasionally generates code that needs adjustments
  - Limited understanding of some newer Next.js features

### GitHub Copilot
- **Purpose**: Used for code completion and suggestions during implementation
- **Pros**:
  - Speeds up coding by suggesting completions
  - Context-aware suggestions based on project codebase
  - Good for repetitive patterns
- **Cons**:
  - Sometimes suggests deprecated methods
  - Quality varies depending on context

### ChatGPT (OpenAI)
- **Purpose**: Used for troubleshooting specific issues and generating smaller code snippets
- **Pros**:
  - Quick solutions for specific error messages
  - Good for generating small, focused code segments
- **Cons**:
  - Less comprehensive for full architecture planning
  - Occasionally provides outdated solutions

## Challenges Faced and Solutions

1. **Challenge**: Setting up proper authentication with JWT
   **Solution**: Implemented custom middleware for token verification and used HTTP-only cookies for added security

2. **Challenge**: Real-time tracking implementation
   **Solution**: Created a tracking system with regular updates and map visualization; a full Socket.io implementation would be added for production

3. **Challenge**: Modeling complex relationships between entities
   **Solution**: Designed MongoDB schemas with proper references and population strategies

4. **Challenge**: Role-based access control
   **Solution**: Implemented custom middleware to check user roles and permissions for each route

5. **Challenge**: Handling bidding logic and lowest bid selection
   **Solution**: Created a sorting mechanism for bids and automated processes for accepting/rejecting bids

6. **Challenge**: Handling CORS issues between frontend and backend
   **Solution**: Properly configured CORS middleware on the backend and API requests on the frontend

## Partially Implemented Features

- **Real-time updates**: Basic polling is implemented, but Socket.io would be used for production
- **Advanced filtering**: Basic filtering is available, but advanced geolocation-based filtering would be enhanced
- **Payment processing**: The system models transactions but doesn't integrate with payment gateways
- **Advanced analytics**: Basic stats are available but detailed analytics would be added

## Future Enhancements

1. **Real-time notifications** using Socket.io
2. **Mobile applications** for truckers to update tracking on the go
3. **Advanced analytics dashboard** for business intelligence
4. **Integration with payment gateways** for financial transactions
5. **Integration with map services** for route optimization
6. **Document verification system** for trucker eligibility

## Project Structure

```
Trucking-Platform/
├── backend/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   └── server.js         # Entry point
├── frontend/
│   ├── components/       # React components
│   │   ├── auth/         # Authentication components
│   │   ├── bids/         # Bidding components
│   │   ├── layout/       # Layout components
│   │   ├── loads/        # Load management components
│   │   ├── shipper/      # Shipper-specific components
│   │   ├── tracking/     # Tracking components
│   │   └── ui/           # UI components
│   ├── context/          # React context for state management
│   ├── pages/            # Next.js pages
│   ├── public/           # Static assets
│   ├── styles/           # CSS styles
│   └── utils/            # Utility functions
└── .env.example          # Example environment variables
```

## Demo

A video demonstration of the application can be found at:(https://drive.google.com/file/d/1b9QgZF2JK1C2DlPPX_S76x4L8eVzHbcp/view?usp=drive_link)

## License

This project is licensed under the MIT License.

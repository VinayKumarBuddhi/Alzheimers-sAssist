# Alzheimer's Assist Backend

A Node.js backend for the Alzheimer's Assist application that provides face recognition capabilities to help Alzheimer's patients remember their family members.

## Features

- **User Authentication**: Register and login with face recognition or traditional credentials
- **Family Member Management**: Add, retrieve, update, and delete family member information
- **Face Recognition**: Generate face embeddings and compare faces using Python scripts
- **RESTful API**: Complete REST API for all operations
- **Security**: JWT authentication, password hashing, and input validation
- **Database**: MongoDB integration with Mongoose ODM

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Face Recognition**: Python with face_recognition library
- **Authentication**: JWT tokens
- **Security**: bcryptjs, helmet, rate limiting

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Python 3.7+ with pip
- Required Python packages (see requirements.txt)

## Installation

1. **Clone the repository and navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Install Python dependencies:**
   ```bash
   cd python
   pip install -r requirements.txt
   cd ..
   ```

4. **Set up environment variables:**
   ```bash
   cp config.env .env
   # Edit .env with your configuration
   ```

5. **Start MongoDB:**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   ```

6. **Run the server:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/alzheimers-assist

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Frontend URL
FRONTEND_URL=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Python Script Path
PYTHON_SCRIPT_PATH=./python/face_recognition.py
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/login-face` - Login with face recognition
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Family Members

- `POST /api/family/add` - Add new family member
- `POST /api/family/retrieve` - Retrieve family member by face
- `GET /api/family/all` - Get all family members
- `GET /api/family/:id` - Get family member by ID
- `PUT /api/family/:id` - Update family member
- `DELETE /api/family/:id` - Delete family member
- `GET /api/family/search/:name` - Search family members by name

### Health Check

- `GET /api/health` - Server health check

## Face Recognition

The backend uses Python scripts for face recognition:

- `python/generate_embedding.py` - Generates face embeddings from images
- `python/compare_faces.py` - Compares face embeddings for matching

### Face Recognition Process

1. **Image Input**: Receive base64 encoded image or file path
2. **Face Detection**: Use face_recognition library to detect faces
3. **Embedding Generation**: Generate 128-dimensional face embeddings
4. **Storage**: Store embeddings in MongoDB
5. **Comparison**: Compare embeddings using Euclidean distance
6. **Matching**: Determine matches based on tolerance threshold

## Database Models

### User Model
```javascript
{
  username: String,
  password: String (hashed),
  faceEmbedding: [Number], // 128-dimensional
  faceImage: String,
  email: String,
  fullName: String,
  dateOfBirth: Date,
  emergencyContact: Object,
  isActive: Boolean,
  lastLogin: Date
}
```

### Family Member Model
```javascript
{
  userId: ObjectId,
  name: String,
  relation: String,
  mobile: String,
  isClose: Boolean,
  address: String,
  faceEmbedding: [Number], // 128-dimensional
  faceImage: String,
  additionalInfo: String,
  importantNotes: String,
  isActive: Boolean,
  lastSeen: Date
}
```

## Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive validation for all inputs
- **Rate Limiting**: Protection against brute force attacks
- **CORS**: Configured for frontend communication
- **Helmet**: Security headers

## Error Handling

The API returns consistent error responses:

```javascript
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

## Development

### File Structure
```
backend/
├── models/          # MongoDB models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── utils/           # Utility functions
├── python/          # Python face recognition scripts
├── temp/            # Temporary files
├── uploads/         # Uploaded images
├── server.js        # Main server file
├── package.json     # Node.js dependencies
└── README.md        # This file
```

### Running Tests
```bash
# Add test scripts to package.json
npm test
```

## Production Deployment

1. **Set NODE_ENV to production**
2. **Use strong JWT_SECRET**
3. **Configure MongoDB Atlas or production MongoDB**
4. **Set up proper CORS origins**
5. **Use HTTPS in production**
6. **Set up monitoring and logging**

## Troubleshooting

### Common Issues

1. **Python face_recognition not found**
   - Install dlib first: `pip install dlib`
   - Then install face_recognition: `pip install face_recognition`

2. **MongoDB connection failed**
   - Check MongoDB is running
   - Verify connection string in .env

3. **Face detection not working**
   - Ensure image contains clear face
   - Check image format (JPEG/PNG)
   - Verify Python dependencies are installed

## License

This project is licensed under the ISC License. 
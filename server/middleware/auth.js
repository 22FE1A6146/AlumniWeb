import dotenv from 'dotenv';
import admin from 'firebase-admin';

dotenv.config();

// Initialize Firebase Admin SDK
const serviceAccount = process.env.FIREBASE_CREDENTIALS_PATH;
if (!serviceAccount) {
  throw new Error('FIREBASE_CREDENTIALS_PATH not set in .env');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: No token provided',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: Token missing',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = { uid: decodedToken.uid }; // Firebase UID
    next();
  } catch (error) {
    res.status(403).json({
      status: 'error',
      message: 'Unauthorized: Invalid or expired token',
      code: 'TOKEN_INVALID',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 
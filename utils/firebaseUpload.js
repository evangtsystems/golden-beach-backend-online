const { v4: uuidv4 } = require('uuid');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// TEMP path to store decoded JSON
const tempPath = path.join(__dirname, 'firebaseServiceAccount.json');

if (process.env.FIREBASE_CONFIG_BASE64) {
  const decoded = Buffer.from(process.env.FIREBASE_CONFIG_BASE64, 'base64').toString('utf-8');
  fs.writeFileSync(tempPath, decoded);
}

if (!admin.apps.length) {
  const serviceAccount = require(tempPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'qrmenuapp-bc491.appspot.com'
  });
}

const bucket = admin.storage().bucket();

const uploadImageToFirebase = async (file, folder = 'menuImages') => {
  return new Promise((resolve, reject) => {
    const filename = `${folder}/${uuidv4()}-${file.originalname}`;
    const blob = bucket.file(filename);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype
      }
    });

    blobStream.on('error', (err) => {
      console.error('Upload failed:', err);
      reject(err);
    });

    blobStream.on('finish', async () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve(publicUrl);
    });

    blobStream.end(file.buffer);
  });
};

module.exports = { uploadImageToFirebase };

const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
  projectId: 'recipefy-407103',
  keyFilename: '../JSON/serviceAccountKey.json', // Ganti dengan path keyfile Anda
});
const bucketName = 'recipefy-407103.appspot.com'; // Ganti dengan nama bucket Anda

module.exports = { storage, bucketName };

// services/firebaseService.js

const admin = require("firebase-admin");
const serviceAccountFirebase = require("../JSON/serviceFirebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountFirebase),
  databaseURL: "https://recipefy-2a678-default-rtdb.firebaseio.com"
});

module.exports = admin;

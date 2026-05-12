/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onDocumentDeleted} = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

admin.initializeApp();

setGlobalOptions({ maxInstances: 10 });

// When a user document is deleted from Firestore, also delete from Authentication
exports.deleteUserFromAuth = onDocumentDeleted("Users/{userId}", async (event) => {
  const userId = event.params.userId;
  const userDoc = event.data;

  if (!userDoc) {
    logger.warn("User document is empty");
    return;
  }

  try {
    const userData = userDoc.data();
    const userEmail = userData?.email;

    if (!userEmail) {
      logger.warn(`No email found for user ${userId}`);
      return;
    }

    // Find user in Authentication by email and delete
    try {
      const userRecord = await admin.auth().getUserByEmail(userEmail);
      await admin.auth().deleteUser(userRecord.uid);
      logger.info(`Deleted user from Auth: ${userRecord.uid} (${userEmail})`);
    } catch (authError) {
      if (authError.code === "auth/user-not-found") {
        logger.info(`User not found in Auth: ${userEmail}`);
      } else {
        throw authError;
      }
    }
  } catch (error) {
    logger.error("Error deleting user from Auth:", error);
    throw error;
  }
});

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as geofire from "geofire-common";
import {Client} from "@googlemaps/google-maps-services-js";

// Locals
import * as validators from "./validators";
import * as utils from "./utils";

// Initialization
admin.initializeApp();
const client = new Client({})

export const createListing = functions.https.onRequest(async (request, response) => {
  if (request.get("content-type") !== "application/json") {
    response.sendStatus(400);
    return;
  }

  const data = request.body;
  const valid = validators.createListingValidator(data);

  if (!valid) {
    response.sendStatus(400);
    return;
  }

  let result;
  try {
    result = await client.geocode({
      params: {
        address: `${data.house_number} ${data.street}, ${data.city}, ${data.state} ${data.zip_code}`,
        key: functions.config().googlemaps.key
      },
    });
  }
  catch (e) {
    functions.logger.error(e);
    response.sendStatus(400);
    return;
  }

  const latitude = result.data.results[0].geometry.location.lat;
  const longitude = result.data.results[0].geometry.location.lng;
  const geohash = geofire.geohashForLocation([latitude, longitude]);

  try {
    await admin.firestore().collection("listings").add({
      ...data,
      location: new admin.firestore.GeoPoint(latitude, longitude),
      geohash
    });
  }
  catch (e) {
    functions.logger.error(e);
    response.sendStatus(400);
    return;
  }

  response.sendStatus(200);
  return;
});

export const addListingImage = functions.https.onRequest(async (request, response) => {
  const data = request.body;
  const valid = validators.addListingImageValidator(data) && request.query.listing_id;

  if (!valid) {
    response.sendStatus(400);
    return;
  }

  // Verify that document exists for listing
  try {
    const doc = await admin.firestore()
      .collection("listings")
      .doc(request.query.listing_id as string)
      .get();
    
    if (!doc.exists) {
      response.status(400).send("Document does not exist");
      return;
    }
  }
  catch(err) {
    functions.logger.error(err);
    response.sendStatus(400);
    return;
  }
  
  const bucket = admin.storage().bucket();
  const imageBuffer = Buffer.from(data.image_bytes, 'base64');
  const imageByteArray = new Uint8Array(imageBuffer);
  const file = bucket.file(`images/listings/${request.query.listing_id}/${utils.uuidv4()}.jpg`);
  const options = { resumable: false, metadata: { contentType: "image/jpg" } };

  file.save(imageByteArray as Buffer, options)
    .then(result => {
      response.sendStatus(200);
    })
    .catch(err => {
      functions.logger.error(err);
      response.sendStatus(400);
    });

});
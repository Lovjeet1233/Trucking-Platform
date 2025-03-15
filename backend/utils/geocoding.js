// utils/geocoding.js
const axios = require('axios');
const ErrorResponse = require('./errorResponse');

/**
 * Get lat/lng coordinates from an address
 * @param {string} address - Address to geocode
 * @returns {object} - Location object with coordinates
 */
exports.geocode = async (address) => {
  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    if (response.data.status === 'OK') {
      const { lat, lng } = response.data.results[0].geometry.location;
      return {
        type: 'Point',
        coordinates: [lng, lat], // GeoJSON format is [longitude, latitude]
        address: response.data.results[0].formatted_address
      };
    } else {
      throw new ErrorResponse(`Geocoding failed: ${response.data.status}`, 400);
    }
  } catch (error) {
    if (error instanceof ErrorResponse) {
      throw error;
    }
    throw new ErrorResponse('Geocoding service unavailable', 500);
  }
};

/**
 * Calculate distance between two points
 * @param {array} point1 - [lng, lat] of first point
 * @param {array} point2 - [lng, lat] of second point
 * @param {string} unit - 'km' or 'mi'
 * @returns {number} - Distance in specified unit
 */
exports.calculateDistance = (point1, point2, unit = 'km') => {
  const [lng1, lat1] = point1;
  const [lng2, lat2] = point2;
  
  // Convert to radians
  const radLat1 = (Math.PI * lat1) / 180;
  const radLat2 = (Math.PI * lat2) / 180;
  const theta = lng1 - lng2;
  const radTheta = (Math.PI * theta) / 180;
  
  let distance =
    Math.sin(radLat1) * Math.sin(radLat2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.cos(radTheta);
  
  if (distance > 1) {
    distance = 1;
  }
  
  distance = Math.acos(distance);
  distance = (distance * 180) / Math.PI;
  distance = distance * 60 * 1.1515; // Miles
  
  if (unit === 'km') {
    distance = distance * 1.609344; // Convert to kilometers
  }
  
  return parseFloat(distance.toFixed(2));
};

const config = require("./app.json");

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

module.exports = {
  ...config,
  expo: {
    ...config.expo,
    ios: {
      ...config.expo.ios,
      config: {
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
      },
    },
    android: {
      ...config.expo.android,
      config: {
        googleMaps: {
          apiKey: GOOGLE_MAPS_API_KEY,
        },
      },
    },
    extra: {
      eas: {
        projectId: "8e06fdcc-37e9-4fe6-9d34-e05db34f7ea8",
      },
    },
  },
};

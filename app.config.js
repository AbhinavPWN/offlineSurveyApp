export default ({ config }) => {
  const isDev = process.env.APP_ENV === "development";

  return {
    expo: {
      name: isDev ? "Nirdhan Survey (Dev)" : "Nirdhan Survey",
      slug: "nirdhan-survey",
      version: "1.0.5",
      orientation: "portrait",

      icon: "./assets/images/logo.png",
      scheme: isDev ? "surveyapp-dev" : "surveyapp",
      userInterfaceStyle: "automatic",

      ios: {
        supportsTablet: true,
      },

      android: {
        package: isDev
          ? "np.com.nirdhan.survey.dev"
          : "np.com.nirdhan.survey",
        versionCode: 5,
        predictiveBackGestureEnabled: false,
        adaptiveIcon: {
          backgroundColor: "#E6F4FE",
          foregroundImage: "./assets/images/logo.png",
          backgroundImage:
            "./assets/images/android-icon-background.png",
          monochromeImage:
            "./assets/images/android-icon-monochrome.png",
        },
      },

      web: {
        output: "static",
        favicon: "./assets/images/favicon.png",
        bundler: "metro",
      },

      plugins: [
        "expo-router",
        [
          "expo-splash-screen",
          {
            image: "./assets/images/splash-icon.png",
            imageWidth: 200,
            resizeMode: "contain",
            backgroundColor: "#ffffff",
            dark: {
              backgroundColor: "#000000",
            },
          },
        ],
        "expo-sqlite",
        "expo-secure-store",
        "@react-native-community/datetimepicker",
      ],

      experiments: {
        typedRoutes: true,
      },

      extra: {
        env: isDev ? "development" : "production",
        router: {},
        eas: {
          projectId: "d7c821e3-61b6-4642-8e45-4ab220578974",
        },
      },
    },
  };
};
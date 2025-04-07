// Tệp này chứa các hàm thiết lập SDK cho Google và Facebook

// Hàm tải Google SDK
export const loadGoogleSDK = () => {
  return new Promise((resolve, reject) => {
    // Check if SDK is already loaded
    if (document.getElementById("google-sdk")) {
      if (window.google) {
        resolve();
        return;
      }
    }

    try {
      // Create script element
      const script = document.createElement("script");
      script.id = "google-sdk";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log("Google SDK loaded successfully");
        resolve();
      };
      script.onerror = (error) => {
        console.error("Failed to load Google SDK:", error);
        reject(new Error("Không thể tải Google SDK"));
      };

      document.head.appendChild(script);
    } catch (error) {
      console.error("Error setting up Google SDK:", error);
      reject(error);
    }
  });
};

// Hàm tải Facebook SDK
export const loadFacebookSDK = () => {
  return new Promise((resolve, reject) => {
    // Check if SDK is already loaded
    if (document.getElementById("facebook-sdk")) {
      if (window.FB) {
        resolve();
        return;
      }
    }

    try {
      // Create script element
      const script = document.createElement("script");
      script.id = "facebook-sdk";

      // Initialize Facebook SDK
      window.fbAsyncInit = () => {
        window.FB.init({
          appId: process.env.REACT_APP_FACEBOOK_APP_ID || "998577288523293", // Fallback to your app ID
          cookie: true,
          xfbml: true,
          version: "v18.0",
        });

        console.log("Facebook SDK initialized successfully");
        resolve();
      };

      // Load SDK
      script.src = "https://connect.facebook.net/vi_VN/sdk.js";
      script.async = true;
      script.defer = true;
      script.onerror = (error) => {
        console.error("Failed to load Facebook SDK:", error);
        reject(new Error("Không thể tải Facebook SDK"));
      };

      document.head.appendChild(script);
    } catch (error) {
      console.error("Error setting up Facebook SDK:", error);
      reject(error);
    }
  });
};

// Add a function to check if we're on HTTPS
export const isHttps = () => {
  return window.location.protocol === "https:";
};

// Get current origin for debugging
export const getCurrentOrigin = () => {
  return window.location.origin;
};

// Add this function to log detailed origin information
export const logOriginDetails = () => {
  console.log({
    origin: window.location.origin,
    protocol: window.location.protocol,
    host: window.location.host,
    hostname: window.location.hostname,
    port: window.location.port,
    href: window.location.href,
    pathname: window.location.pathname,
  });

  return window.location.origin;
};

// Hàm khởi tạo cả hai SDK
export const initSocialSDKs = async () => {
  try {
    // Log detailed origin information for debugging
    console.log("Detailed origin information:");
    logOriginDetails();

    // Check if we're on HTTPS for Facebook
    if (!isHttps()) {
      console.warn("Facebook login requires HTTPS. It may not work on HTTP.");
      console.warn(
        "For development, use HTTPS localhost or a tunnel service like ngrok."
      );
    }

    // Load both SDKs in parallel
    await Promise.all([loadGoogleSDK(), loadFacebookSDK()]);

    console.log("Social SDKs loaded successfully");
    return true;
  } catch (error) {
    console.error("Error loading social SDKs:", error);
    return false;
  }
};

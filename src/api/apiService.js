import axiosInstance from "./axiosConfig";

async function callApi(
  endpoint,
  method = "GET",
  body = null,
  params = {},
  isFormData = false
) {
  let url = endpoint;

  // Special handling for FormData with requestDTO parameter
  if (isFormData && params.requestDTO) {
    // For Spring Boot, we need to encode the requestDTO parameter
    const encodedRequestDTO = encodeURIComponent(params.requestDTO);
    url = `${endpoint}?requestDTO=${encodedRequestDTO}`;

    // Remove requestDTO from params since we've added it to the URL
    const { requestDTO, ...restParams } = params;
    params = restParams;
  } else if (Object.keys(params).length > 0) {
    // For regular requests with params, use URLSearchParams
    const queryString = new URLSearchParams(params).toString();
    url = `${endpoint}?${queryString}`;
    // Clear params since we've added them to the URL
    params = {};
  }

  const config = {
    method,
    url,
  };

  if (body) {
    if (isFormData) {
      // For FormData, set the data directly
      config.data = body;

      // IMPORTANT: For multipart/form-data, we need to explicitly remove
      // any Content-Type header so axios can set it with the correct boundary
      config.headers = {
        ...config.headers,
        "Content-Type": undefined, // Let axios set this automatically
      };
    } else {
      // For JSON data
      config.data = body;
      config.headers = {
        ...config.headers,
        "Content-Type": "application/json",
      };
    }
  }

  console.log("Is FormData:", isFormData);
  console.log("🔹 callApi URL:", url);

  // For debugging FormData contents
  if (isFormData && body instanceof FormData) {
    console.log("FormData contents:");
    for (let pair of body.entries()) {
      if (pair[1] instanceof File) {
        console.log(
          `${pair[0]}: File - ${pair[1].name} (${pair[1].type}, ${pair[1].size} bytes)`
        );
      } else {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
    }
  }

  return axiosInstance(config)
    .then((response) => response.data)
    .catch((error) => {
      console.error("❌ API call error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    });
}

export default callApi;
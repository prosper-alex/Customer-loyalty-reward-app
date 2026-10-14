// const API_URL = import.meta.env.VITE_API_URL;

// const apiClient = async (endpoint, options = {}) => {
//   const token = localStorage.getItem("token");

//   const headers = {
//     "Content-Type": "application/json",
//     ...options.headers,
//   };

//   if (token) {
//     headers.Authorization = `Bearer ${token}`;
//   }

//   const response = await fetch(`${API_URL}${endpoint}`, {
//     ...options,
//     headers,
//   });

//   const result = await response.json();

//   if (!response.ok) {
//     throw new Error(result.message || "Something went wrong");
//   }

//   return result;
// };

// export default apiClient;


const API_URL = import.meta.env.VITE_API_URL;

const apiClient = async (endpoint, options = {}) => {
  if (!API_URL) {
    throw new Error(
      "VITE_API_URL is not defined. Check your frontend environment variables."
    );
  }

  const token = localStorage.getItem("token");
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...options.headers,
  };

  // Let the browser set the multipart Content-Type and boundary for FormData.
  if (isFormData) {
    delete headers["Content-Type"];
    delete headers["content-type"];
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type");
  const result = contentType?.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof result === "object" && result !== null
        ? result.message || "Something went wrong"
        : result || "Something went wrong";

    throw new Error(message);
  }

  return result;
};

export default apiClient;


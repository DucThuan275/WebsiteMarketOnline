  import callApi from "./apiService";

  const PostService = {
    // Create a new post
    createPost: async (postData, userId, imageFile) => {
      const formData = new FormData();
      formData.append("title", postData.title);
      formData.append("content", postData.content);

      // Append image if available
      if (imageFile) {
        formData.append("imageFile", imageFile);
      }

      // Send the request with multipart form data
      return callApi(`/posts?userId=${userId}`, "POST", formData, {}, true);
    },

    // Get all posts
    getAllPosts: async () => {
      return callApi(`/posts`, "GET");
    },

    // Get paginated posts
    getPagedPosts: async (
      page = 0,
      size = 10,
      sortBy = "createdAt",
      direction = "desc"
    ) => {
      const params = {
        page,
        size,
        sortBy,
        direction,
      };
      return callApi(`/posts/paged`, "GET", null, params);
    },

    // Get all active posts
    getAllActivePosts: async () => {
      return callApi(`/posts/active`, "GET");
    },

    // Get paginated active posts
    getPagedActivePosts: async (
      page = 0,
      size = 10,
      sortBy = "createdAt",
      direction = "desc"
    ) => {
      const params = {
        page,
        size,
        sortBy,
        direction,
      };
      return callApi(`/posts/active/paged`, "GET", null, params);
    },

    /**
     * Get post by ID
     * @param {string|number} id - Post ID
     * @returns {Promise<Object>} Post details
     */
    getPostById: async (id) => {
      return callApi(`/posts/${id}`, "GET");
    },

    // Update post
    updatePost: async (postId, title, content, imageFile) => {
      const formData = new FormData();

      if (title) formData.append("title", title);
      if (content) formData.append("content", content);
      if (imageFile) formData.append("imageFile", imageFile);

      // Send PUT request for updating the post
      return callApi(`/posts/${postId}`, "PUT", formData, {}, true);
    },

    // Delete post
    deletePost: async (postId) => {
      return callApi(`/posts/${postId}`, "DELETE");
    },

    // Update post status
    updatePostStatus: async (postId, status) => {
      return callApi(`/posts/${postId}/status?status=${status}`, "PATCH");
    },

    // Get post image by ID
    getPostImage: async (postId) => {
      return callApi(`/posts/image/${postId}`, "GET");
    },

    // Get post image URL (for displaying image)
    getPostImageUrl: (postId) => {
      return `http://localhost:8088/api/v1/posts/image/${postId}`;
    },
  };

  export default PostService;

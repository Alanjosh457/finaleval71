const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
const CLOUDINARY_URL=import.meta.env.VITE_BACKEND_URL_FOR_CLOUDINARY
export const register = async (data) => {
    const response = await fetch(`${BACKEND_URL}/api/user/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    if (response.status === 200 || response.status === 400) {
        return response.json()
    }
    throw new Error('Something went wrong')
}
export const login = async (data) => {
    const response = await fetch(`${BACKEND_URL}/api/user/signin`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    if (response.status === 200 || response.status === 400) {
        return response.json()
    }
    throw new Error('Something went wrong')
}

export const shortenUrl = async (data) => {
  const token = localStorage.getItem('token'); // Retrieve the token from localStorage (or wherever you store it)
  
  const response = await fetch(`${BACKEND_URL}/api/user/shorten`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`, // Include the token here
    },
    body: JSON.stringify(data),
  });

  if (response.ok) {
    return response.json();
  }

  throw new Error('Failed to shorten the URL');
};


export const getOriginalUrl = async (shortenedKey) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/user/${shortenedKey}`, {
      method: 'GET',
    });

    console.log('Raw Response:', response);

    if (response.ok) {
      const data = await response.json();
      console.log('Parsed Response Data:', data);
      return data; // Assuming the response contains the original URL
    } else {
      console.error('Response not OK. Status:', response.status, response.statusText);
      throw new Error('Shortened URL not found');
    }
  } catch (error) {
    console.error('Error fetching original URL:', error);
    throw new Error('Failed to retrieve the original URL');
  }
};



export const fetchUrls = async () => {
  const token = localStorage.getItem('token'); // Retrieve the token from localStorage
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/user/all`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`, // Include the token here
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch URLs');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching URLs:', error);
    throw error;
  }
};

export const searchUrls = async (searchTerm) => {
  const token = localStorage.getItem('token'); // Retrieve the token from localStorage
  console.log("Token retrieved from localStorage:", token); // Log the token

  // Log the searchTerm to ensure it is passed correctly
  console.log("Search Term:", searchTerm);

  try {
    const searchUrl = `${BACKEND_URL}/api/user/search?searchTerm=${searchTerm}`;
    console.log("Making request to:", searchUrl); // Log the API URL

    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`, // Include the token here
      },
    });

    if (!response.ok) {
      console.error("Response not OK:", response); // Log the failed response
      throw new Error('Failed to fetch search results');
    }

    const data = await response.json();
    console.log("Search Results:", data); // Log the response data
    return data; // Return the JSON data containing the search results

  } catch (error) {
    console.error('Error searching URLs:', error);
    throw error; // Re-throw the error for further handling if needed
  }
};






export const updateUser = async (data, token) => {
  const response = await fetch(`${BACKEND_URL}/api/user/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`, // Include the token for authentication
    },
    body: JSON.stringify(data),
  });

  if (response.status === 200 || response.status === 400) {
    return response.json(); // Return the parsed JSON response
  }

  throw new Error('Something went wrong');
};
export const createFolder = async (folderName, token) => {
  const response = await fetch(`${BACKEND_URL}/api/folders/create-folder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name: folderName }),
  });

  if (response.status === 201) {
    return response.json(); // Return the folder data
  } else if (response.status === 400) {
    return response.json(); // Return error message if any
  }

  throw new Error('Something went wrong');
};


export const deleteAccount = async (token) => {
  const response = await fetch(`${BACKEND_URL}/api/user/delete`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });

  if (response.status === 200 || response.status === 400) {
    return response.json();
  }
  throw new Error('Something went wrong while deleting the account');
};



export const createFormbot = async (formbotData, token) => {
  if (!formbotData.name || formbotData.name.trim() === '') {
    throw new Error('Formbot name cannot be empty');
  }

  const response = await fetch(`${BACKEND_URL}/api/folders/create-formbot`, {  // Correct URL here
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(formbotData),
  });

  if (response.status === 201) {
    return response.json(); // Return the formbot data
  } else if (response.status === 400) {
    return response.json(); // Return error message if any
  }

  throw new Error(errorData.message ||'Something went wrong');
};
// Fetch the folders of the logged-in user
// Fetch the folders of the logged-in user
export const getFolders = async (token) => {
  const response = await fetch(`${BACKEND_URL}/api/folders/fetchfolders`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data; // assuming the response contains the folders directly
};

// Fetch formbots, either globally or within a specific folder
export const getFormbots = async (token, folderId) => {
  const url = folderId 
    ? `${BACKEND_URL}/api/folders/fetchformbots?folderId=${folderId}` 
    : `${BACKEND_URL}/api/folders/fetchformbots`; // If no folderId, fetch all formbots

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return data; // assuming the response contains the formbots directly
};


export const uploadImageToCloudinary = async (file, token) => {
  const formData = new FormData();
  formData.append("image", file); // Append the image to the FormData object

  const response = await fetch(`${CLOUDINARY_URL}/api/users/upload`, {
    method: "POST",
    body: formData,
    headers: {
      'Authorization': `Bearer ${token}`, // Assuming you need a token for auth
    },
  });

  const data = await response.json();

  if (response.ok) {
    return {
      success: true,
      message: data.message,
      imageUrl: data.data.secure_url, // Assuming Cloudinary response contains the URL at `secure_url`
    };
  } else {
    return {
      success: false,
      message: data.message || "An error occurred while uploading.",
    };
  }
};


// Save a form
export const saveForm = async (token, formData) => {
  const url = `${BACKEND_URL}/api/folders/saveforms`; // Save form route

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData), // formData includes title, fields, and formbotId
  });

  const data = await response.json();
  return data; // Returns the server response (success or error)
};

// Fetch forms by formbotId
export const getForms = async (token, formbotId) => {
  const url = `${BACKEND_URL}/api/folders/getforms?formbotId=${formbotId}`; // Fetch forms route with formbotId as a query parameter

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return data; // Returns the fetched forms
};

// Update a form by form ID
export const updateForm = async (token, formId, updatedData) => {
  const url = `${BACKEND_URL}/api/folders/updateform/${formId}`; // Update form route

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedData), // updatedData includes new title, fields, etc.
  });

  const data = await response.json();
  return data; // Returns the server response (success or error)
};

// Delete a form by form ID
export const deleteForm = async (token, formId) => {
  const url = `${BACKEND_URL}/api/folders/deleteform/${formId}`; // Delete form route

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return data; // Returns the server response (success or error)
};

export const fetchFormFields = async (token, formId) => {
  const url = `${BACKEND_URL}/api/folders/fetchformdata/${formId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching form fields: ${response.statusText}`);
    }

    const data = await response.json();
    return data.formFields; // Extract the form fields from the response data
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const submitFormResponses = async (token, formId, responses) => {
  const url = `${BACKEND_URL}/api/folders/submitform/${formId}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ formId, responses }),
    });

    if (!response.ok) {
      throw new Error(`Error submitting form responses: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // Returns success or error message from the server
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const submitResponse = async (formbotId, responses) => {
  console.log('Submitting response with:', { formbotId, responses });

  // Ensure responses is always an array
  const formattedResponses = Array.isArray(responses) ? responses : [responses];

  // Map through responses and ensure each has a label and value
  const formatted = formattedResponses.map(response => ({
    label: response.label,  // Keep it empty if no label is provided
    value: response.value  // Keep it empty if no value is provided
  }));

  const url = `${BACKEND_URL}/api/folders/submitresponse`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ formbotId, responses: formatted }), // send formatted responses
  });

  if (!response.ok) {
    throw new Error('Failed to submit response.');
  }

  const data = await response.json();
  return data; // Returns the server's response
};



// Fetch all responses using fetch instead of axios

export const getAllResponses = async (formbotId) => {
  try {
    // Adjust the API URL to include the formbotId
    const url = `${BACKEND_URL}/api/folders/getallresponses/${formbotId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch responses');
    }

    const data = await response.json();
    return data.responses; // Assuming your response contains an array of 'responses'
  } catch (error) {
    console.error('Error fetching all responses:', error);
    throw new Error('Error fetching responses from the server');
  }
};
export const incrementViewer = async (formbotId, token) => {
  try {
    const url = `${BACKEND_URL}/api/folders/incrementViews/${formbotId}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to increment views');
    }

    const data = await response.json();
    console.log('View count incremented:', data.views); // Correct logging
    return data;

  } catch (error) {
    console.error('Error incrementing views:', error);
    throw new Error('Error incrementing views on the server');
  }
};
export const incrementStarts = async (formbotId, token) => {
  try {
    const url = `${BACKEND_URL}/api/folders/incrementStarts/${formbotId}`; // Ensure this path is correct
    const response = await fetch(url, {
      method: 'POST', // Using POST instead of PATCH
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Pass token to authenticate
      },
    });

    if (!response.ok) {
      throw new Error('Failed to increment starts');
    }

    const data = await response.json();
    return data; // Return the updated data (e.g., the new starts count)
  } catch (error) {
    console.error('Error incrementing starts:', error);
    throw new Error('Error incrementing starts on the server');
  }
};

export const incrementViewCount = async (formbotId, token) => {
  try {
    if (!formbotId || !token) {
      console.error("Missing formbotId or token.");
      return;
    }

    // Get the API base URL from environment variables
   

    // Call the API to increment views
    const response = await fetch(`${BACKEND_URL}/api/folders/viewformbot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ formbotId, token }), // Pass formbotId and token in the request body
    });

    const result = await response.json();
    if (result.success) {
      return true; // Return true if the view count was incremented successfully
    } else {
      console.error("Failed to increment view count:", result.message);
      return false;
    }
  } catch (error) {
    console.error("Error incrementing view count:", error);
    return false;
  }
};



export const shareworkspace = async (workspaceId, sharedUserId, shareMode) => {
  try {
    console.log('Payload being sent:', { workspaceId, sharedUserId, shareMode });
    const response = await fetch(`${BACKEND_URL}/api/user/sharepoint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ workspaceId, sharedUserId, shareMode }),
    });

    // Check if response is not ok and parse error details
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to share the workspace');
    }

    return await response.json(); // return the response data
  } catch (error) {
    console.error('Error sharing workspace:', error.message);
    throw error; // re-throw the error so the caller can handle it
  }
};



export const getUserByEmail = async (email) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/user/email/${email}`);
    if (!response.ok) {
      const errorData = await response.json(); // Parse the error details from the response body
      throw new Error(
        `Error ${response.status}: ${errorData.message || 'User does not exist'}`
      );
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user by email:', error.message);
    throw error;
  }
};


export const getSharedWorkspaces = async (userId) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/user/shared/${userId}`);
    if (!response.ok) {
      throw new Error('Error fetching shared workspaces');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching shared workspaces:', error);
    throw error;
  }
};


export const sharespace = async (email, workspaceId, permission) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    alert('You must be logged in to share a workspace.');
    return;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/user/sharework`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ email, workspaceId, permission }),
    });

    console.log('Share Workspace Response Status:', response.status); // Log the HTTP status code
    const data = await response.json();
    console.log('Share Workspace Response Data:', data); // Log the parsed JSON data

    if (response.ok) {
      alert('Workspace shared successfully!');
    } else {
      alert(data.message || 'Error sharing workspace.');
    }
  } catch (error) {
    console.error('Error sharing workspace:', error);
    alert('Error sharing workspace. Please try again later.');
  }
};

export const getspace = async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    alert('You must be logged in to view shared workspaces.');
    return;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/user/sharedwork`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log('Raw Response:', response); // Log the raw response
    console.log('Shared Workspaces Data:', data); // Log the parsed data

    if (response.ok) {
      if (data.sharedWithUser) {
        data.sharedWithUser.forEach((workspace) => {
          console.log('Workspace ID:', workspace.workspaceId._id);
          console.log('Workspace Name:', workspace.workspaceId.name);
        });
      } else {
        console.log('No sharedWithUser field in the response');
      }
      return data;  // Shared workspaces data
    } else {
      alert(data.message || 'Error fetching shared workspaces.');
      return [];
    }
  } catch (error) {
    console.error('Error fetching shared workspaces:', error);
    alert('Error fetching shared workspaces. Please try again later.');
    return [];
  }
};

export const fetchWorkspace = async (workspaceId, token) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/user/workspace/${workspaceId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Include the token for authentication
      },
    });

    // Check if the response is successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch workspace.');
    }

    // Parse and return the response data
    const workspaceData = await response.json();
    return workspaceData;
  } catch (error) {
    console.error('Error fetching workspace:', error);
    throw error; // Rethrow the error for the caller to handle
  }
};

import { showAlert } from "./alerts.js"; 

export const login = async (email, password) => {
  try {
    const response = await fetch('http://localhost:3000/api/v1/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include',    // Include credentials (cookies) in the request
    });
      
    // Check if the response status indicates an error
    if (!response.ok) {
      const errorData = await response.json();    // Parse the error response body
      // console.log(response)
      showAlert('error', errorData.message); // Display error message using your custom function
    } else {
      // Request was successful, handle the response
      console.log('Success:', response);
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    console.error('Fetch error:', err);
    showAlert('error', 'An error occurred during login.');
  }
};


export const logout = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/v1/users/logout', {
      method: 'GET',
    });
    
    // reload not only the browser rather also reload the server.....fresh page coming down from the serer
    if (response.ok) {
      location.reload(true);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', 'Error Logging out! Try again.');
  }
}

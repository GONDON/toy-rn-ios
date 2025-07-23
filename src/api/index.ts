/*
 * @LastEditors: jizai jizai.zhu@tuya.com
 * @Date: 2025-07-15 18:31:34
 * @LastEditTime: 2025-07-15 21:23:10
 * @FilePath: /demoapp/src/api/index.ts
 * @Description: 
 */

export const BASE_URL = 'https://test-talenpal-api.baseus.cn:10002/app-api';

// Generic request function
const request = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${BASE_URL}${endpoint}`;

  // Define custom headers
  const customHeaders = {
    'Content-Type': 'application/json',
    // You can add other headers like Authorization tokens here
    Authorization: 'Bearer 3bb4c8659bf74240a007f964bfe7bf7b', // Placeholder for auth token
  };

  const requestOptions: RequestInit = {
    ...options,
    headers: {
      ...customHeaders,
      ...options.headers,
    },
  };

  console.log('--- NEW REQUEST ---');
  console.log('Request URL:', url);
  console.log('Request Options:', JSON.stringify(requestOptions, null, 2));

  try {
    const response = await fetch(url, requestOptions);
    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const responseText = await response.text();
    console.log('Response Body:', responseText);
    const result = JSON.parse(responseText);
    // Assuming a common response structure with `code` and `msg`
    if (result.code !== 0) {
      throw new Error(result.msg || 'API returned an error');
    }
    return result.data;
  } catch (error) {
    console.error(`Request to ${url} failed:`, error);
    throw error; // Re-throw the error to be caught by the caller
  }
};

// --- Doll APIs ---

// API to get a doll instance by its ID
export const getDollInstanceById = (id: number | string) => {
  return request(`/doll/instance/get?id=${id}`, {
    method: 'GET',
  });
}; 
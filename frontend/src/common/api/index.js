export const apiBaseUrl = `${process.env.NEXT_PUBLIC_APP_URL}`;

export async function get(apiEndpoint, params) {
  const response = await fetch(`${apiEndpoint}${getParams(params)}`, {
    method: "GET",
  });

  if (!response.ok) {
    return handleError(response);
  }

  const parsedResponse = await response.json();

  return parsedResponse;
}

export async function post(
  apiEndpoint,
  data,
  { ignoreAuthorization = false, onResponseHeader = null } = {}
) {
  const response = await fetch(apiEndpoint, {
    method: "POST",
    body: JSON.stringify(data),
    ignoreAuthorization,
  });

  if (!response.ok) {
    return handleError(response);
  }

  onResponseHeader?.(response.headers);

  // 204 No Content - return nothing.
  if (response.status === 204) {
    return null;
  }

  const parsedResponse = await response.json();

  return parsedResponse;
}

export async function patch(apiEndpoint, data) {
  const response = await fetch(apiEndpoint, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    return handleError(response);
  }

  const parsedResponse = await response.json();

  return parsedResponse;
}

export async function del(apiEndpoint, params) {
  const response = await callFetch(`${apiEndpoint}${getParams(params)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    return handleError(response);
  }

  return response.ok;
}

// function callFetch(resource, options) {
//   const headers = {
//     "Content-Type": "application/json; charset=utf-8",
//     "Preface-Client": "web",
//   };

//   return fetch(`${apiBaseUrl}/${resource}`, {
//     ...options,
//     credentials: "omit",
//     headers,
//   });
// }

function getParams(params) {
  const filteredParams = [];

  if (params) {
    Object.keys(params).forEach((key) => {
      if (
        params[key] !== null &&
        params[key] !== undefined &&
        params[key] !== ""
      ) {
        if (Array.isArray(params[key])) {
          params[key].forEach((value) => {
            filteredParams.push([`${key}[]`, value]);
          });
        } else {
          filteredParams.push([key, params[key]]);
        }
      }
    });
  }

  const search = new URLSearchParams(filteredParams).toString();

  return search ? `?${search}` : "";
}

async function handleError(response) {
  let errorMsg = `API Error (${response.status}): An error occurred with your request.`;

  try {
    const responseJson = await response.json();

    if (responseJson && responseJson.message) {
      errorMsg = `API Error (${response.status}): ${responseJson.message}`;
    } else {
      errorMsg = `API Error (${response.status}): No specific error message provided.`;
    }
  } catch (error) {
    errorMsg = `API Error (${response.status}): Failed to parse error message from server.`;
  }

  throw new Error(errorMsg);
}

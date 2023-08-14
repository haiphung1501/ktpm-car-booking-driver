import axios from 'axios';

const instance = axios.create();

instance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    const isUnauthorized = error.response?.status === 401;

    if (isUnauthorized) {
      console.log('isUnauthorized');
    }
    return Promise.reject(error);
  },
);

export const apiRequest = async config => {
  return instance.request({
    ...config,
    headers: {
      Accept: 'application/json',
      ...config.headers,
    },
    withCredentials: true,
  });
};

export const apiGet = async (url, params, config) => {
  const query = params
    ? `?${Object.keys(params)
        .map(key => (params[key] ? `${key}=${params[key]}` : ''))
        .filter(Boolean)
        .join('&')}`
    : '';

  return apiRequest({
    url: `${url}${query}`,
    method: 'GET',
    ...config,
  });
};

export const apiPost = async (url, data, config) => {
  return apiRequest({
    url,
    data: data ?? null,
    method: 'POST',
    ...config,
  });
};

export const apiPut = async (url, data, config) => {
  return apiRequest({
    url,
    data: data ?? null,
    method: 'PUT',
    ...config,
  });
};

export const apiPatch = async (url, data, config) => {
  return apiRequest({
    url,
    data: data ?? null,
    method: 'PATCH',
    ...config,
  });
};

export const apiDelete = async (url, config) => {
  return apiRequest({
    url,
    method: 'DELETE',
    ...config,
  });
};

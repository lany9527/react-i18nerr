import axios from 'axios';

export function graphql(query = '') {
  return function() {
    const token = localStorage.getItem('token');
    return axios
      .post(
        `http://localhost:3000/api/graphql`,
        { query },
        {
          withCredentials: false,
          responseType: 'json',
          headers: {
            Accept: 'application/json;charset=utf-8',
            Authorization: token
          }
        }
      )
      .then(res => res.data)
      .then(data => {
        if (data.errors && data.errors.length) {
          return Promise.reject(data.errors[0]);
        }
        return data.data;
      });
  };
}

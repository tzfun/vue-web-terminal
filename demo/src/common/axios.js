import axios from 'axios'

const instance = axios.create()

instance.interceptors.request.use(config => config, error => Promise.reject(error))

instance.interceptors.response.use(response => response, (error) => {
  console.error(error)
  return Promise.reject(error)
})

export default instance

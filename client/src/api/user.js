import axios from "axios";

const request = axios.create({
  baseURL: 'https://user-system-production.up.railway.app/api/users',
  timeout: 10000
})

request.interceptors.request.use(
  (config)=>{
    const token=localStorage.getItem('token')
    if(token){
      config.headers.Authorization=`Bearer ${token}`
    }
    return config
  },
  (error)=>Promise.reject(error)
)

export const registerApi=(data)=>request.post('/register',data)

export const loginApi=(data)=>request.post('/login',data)

export const getProfileApi=()=>request.get('/profile')

export const updateProfileApi=(data)=>request.put('/profile',data)

export const changePasswordApi=(data)=>request.put('/change-password',data)

export const uploadAvatarApi=(data)=>
  request.post('/upload-avatar',data,{
    headers:{
      'Content-Type':'multipart/form-data',
    }

})
export default request

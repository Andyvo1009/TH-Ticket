import axios from 'axios';
const base_url=import.meta.env.VITE_API_URL
const authapi=axios.create({
  baseURL: base_url || '/api',  // change if needed
});
console.log('Auth API Base URL:', base_url);
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  access_token?: string;
  user?: {
    id: number;
    role: string;
    fullName: string;
  };
}

// Callback function types
export const authApi = {
  // Login API call
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      // console.log('Attempting to log in with credentials:', credentials);
      const response = await authapi.post('/auth/login', credentials);
      const data = response.data as AuthResponse;
      // console.log('Login response data:', data.message);
      if (!data.success) {
        // console.log('Login failed:', data?.message);
        throw new Error(data?.message || 'Đăng nhập thất bại');
      }

      // Store token in localStorage (store both keys for compatibility)
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
      }
      else {
        throw new Error('Sai mật khẩu hoặc email');
      }
      localStorage.setItem('role', data.user?.role!);
      localStorage.setItem('fullName', data.user?.fullName!);
      // Store user info
      

      return data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error('Axios error during login:', err);
      const backendMessage =
        err.response?.data?.message ||
        'Lỗi từ máy chủ';
        if(backendMessage === "Wrong password" || backendMessage === "Account does not exist") {
          throw new Error('Sai mật khẩu hoặc email');
        }
      throw new Error(backendMessage);
    }

    // Non-Axios error (logic error, runtime error)
    throw err;
    }
  },

  // Register API call
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      const response = await authapi.post('/auth/register', credentials);
      const data = response.data as AuthResponse;

      if (!data || !data.success) {
        throw new Error( 'Đăng ký thất bại');
      }      // Store token in localStorage (store both keys for compatibility)
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
      }
      localStorage.setItem('role', data.user?.role!);
      localStorage.setItem('fullName', data.user?.fullName!);

      return data;
    } catch (error) {
      console.error( error);
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      const token = localStorage.getItem('access_token') ;

      await authapi.post(
        '/auth/logout',
        null,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.removeItem('access_token');
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
      // Still remove local data even if API call fails
      localStorage.removeItem('access_token');
      // localStorage.removeItem('user');
    }
  },

  // Get current token
  getToken: () => {
    return localStorage.getItem('access_token') || localStorage.getItem('token');
  },

  // Get current user role
  

  // Get current user object
  // getUser: () => {
  //   const role = localStorage.getItem('role');
  //   const token = localStorage.getItem('access_token');
  //   if (!token) return null;
    
  //   return {
  //     role: role || 'user'
  //   };
  // },

  // Check if user is authenticated
  isAuthenticated: async (): Promise<boolean> => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return false;
  }

  try {
    const response = await authapi.get("/auth/is-auth", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data?.success === true;

  } catch (error: any) {
    return false;
  }
},

  // Forgot password - request OTP
  forgotPassword: async (email: string): Promise<AuthResponse> => {
    try {
      const response = await authapi.get(`/auth/forgot-password?email=${encodeURIComponent(email)}`);
      const data = response.data as AuthResponse;
      
      if (!data.success) {
        throw new Error(data.message || 'Không thể gửi OTP');
      }
      
      return data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  // Verify OTP
  verifyOtp: async (email: string, otp: string): Promise<AuthResponse> => {
    try {
      const response = await authapi.post('/auth/verify-otp', { email, otp });
      const data = response.data as AuthResponse;
      
      if (!data.success) {
        throw new Error(data.message || 'OTP không đúng');
      }
      
      return data;
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw error;
    }
  },

  // Reset password after OTP verification
  resetPassword: async (email: string, newPassword: string): Promise<AuthResponse> => {
    try {
      const response = await authapi.post('/auth/reset-password', { email, new_password: newPassword });
      const data = response.data as AuthResponse;
      
      if (!data.success) {
        throw new Error(data.message || 'Không thể đặt lại mật khẩu');
      }
      
      return data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },
};
export default authApi;
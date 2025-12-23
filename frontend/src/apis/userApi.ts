
import api from './baseApi';
interface Info {
    fullName: string;
    phoneNumber: string;
    gender: string;
    birthDate: string;
    email: string;
}
interface UserResponse {
  success: boolean;
  message: string;
  user?: {
    fullName: string;
    email: string;
    phoneNumber: string;
    gender: string;
    birthDate: string;
  };
}
interface Password_Change{
  currentPassword: string;
  newPassword: string;
}

const userApi = {
    getUserProfile: async (): Promise<UserResponse> => {
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        

        try {
            const response = await api.get('/user', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = response.data as UserResponse;

            if (!data || !data.success) {
                throw new Error(data?.message || 'Failed to fetch user profile');
            }

            // Store user info
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            return data;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    },
    changeUserInfo: async (info: Info) => {
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        try {
            const response = await api.put('/user', info, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    },
    changePassword: async (Password_Change:Password_Change) => {
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        try {
            const response = await api.post('/user/change-password', Password_Change, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error changing password:', error);
            throw error;
        }
    },
    getUserRole: () => {
    return localStorage.getItem('role');
  },
    getUserName: () => {

    return localStorage.getItem('fullName');
  }
};

export default userApi;

import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';  
import LoginForm, {RegisterForm} from '../components/AuthForm';
import Profile from '../components/Profile';
import { authApi } from '../apis/authApi';
import userApi from '../apis/userApi';
import Footer from '../components/Footer';
interface User {
    fullName: string,
    gender: string,
    email: string,
    birthDate: string,
    phoneNumber: string
}
export default function UserProfile() {
  
  const [PopupLogin, setPopupLogin] = useState(true);
  const [PopupRegister, setPopupRegister] = useState(false);
  const [user, setUser] = useState<User>({
    fullName: '',
    gender: '',
    email: '',
    birthDate: '',
    phoneNumber: ''
  });
  const [authenticated, setAuthenticated] = useState(false);
  useEffect(() => {
      const checkAuth = async () => {
        const isAuth = await authApi.isAuthenticated();
        setPopupLogin(!isAuth);
        setAuthenticated(isAuth);
      };

      checkAuth();
  }, []);
  useEffect(() => {
    const fetchUser = async () => {
     
      try {
        const response = await userApi.getUserProfile();
         if (!response.user) {
      console.error("User data not found in response");
      return;
    }
        setUser({
          fullName: response.user.fullName,
          gender: response.user.gender,
          email: response.user.email,
          birthDate: response.user.birthDate,
          phoneNumber: response.user.phoneNumber
        });
        
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser(); }, 
    []);



 
  return (
    <>
      
      {authenticated ? (
          <Profile fullName={user.fullName} gender={user.gender} email={user.email} birthDate={user.birthDate} phoneNumber={user.phoneNumber} />
      ) : (
          <div className="text-center">  
           {PopupLogin && <LoginForm onClose={() => setPopupLogin(false)} Popup={() => setPopupRegister(true)} />}
            {PopupRegister && <RegisterForm onClose={() => setPopupRegister(false)} Popup={() => setPopupLogin(true)} />}
        </div>
    )}
    <Footer />
    </>
  )
}

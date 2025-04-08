import { logoutUser } from '../../firebase/authService';
import { Link } from 'react-router-dom';

export default function LogoutButton() {
  return (
    <div>
      <button onClick={logoutUser}>Đăng xuất</button>
      <Link to="/signin"></Link>
    </div>
  );
}

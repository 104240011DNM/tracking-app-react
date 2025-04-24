import { logoutUser } from '../../firebase/authService';
import { useNavigate } from "react-router-dom"

export default function LogoutButton() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logoutUser()
    navigate("/") // Redirect to signin page
  }

  return (
    <div>
      <button onClick={handleLogout}>Đăng xuất</button>
    </div>
  );
}

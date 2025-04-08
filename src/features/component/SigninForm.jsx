import { useState } from 'react';
import { loginUser } from '../../firebase/authService';
import { Link } from 'react-router-dom';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const user = await loginUser(email, password);
      alert(`Đăng nhập thành công: ${user.email}`);
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Đăng nhập</h2>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input type="password" placeholder="Mật khẩu" value={password} onChange={e => setPassword(e.target.value)} required />
      <button type="submit">Đăng nhập</button>
      <p>Bạn chưa có tài khoản? <Link to="/signup">Đăng ký</Link></p>
    </form>
  );
}

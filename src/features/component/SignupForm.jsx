import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { createUserProfile } from "../../firebase/userService";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // 🔐 Lưu hồ sơ người dùng + safeUserId
      await createUserProfile(userId, { email });

      alert("Đăng ký thành công!");
    } catch (err) {
      console.error("Lỗi đăng ký:", err.code, err.message);
      setError(`Lỗi: ${err.code} - ${err.message}`);
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="border p-2 rounded w-full"
      />
      <input
        type="password"
        placeholder="Mật khẩu"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="border p-2 rounded w-full"
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Đăng ký
      </button>
      <p>Bạn có tài khoản? <Link to="/">Đăng nhập</Link></p>
    </form>
  );
}

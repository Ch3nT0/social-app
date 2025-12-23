import { Navigate, Outlet } from "react-router-dom";
import { getCookie } from "../../helpers/cookie";

const PrivateRoute = () => {
  // Kiểm tra sự tồn tại của token hoặc userId trong cookie
  const token = getCookie("token");

  // Nếu có token thì render nội dung bên trong (Outlet), ngược lại về Login
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
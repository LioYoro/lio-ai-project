import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "@/components/ui/button";

export const Navbar = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const { logout } = useAuth();
  const userRole = localStorage.getItem("user-role");
  const isAdmin = userRole === "admin";

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        localStorage.removeItem("user-role");
        window.location.href = "/login";
      }
    });
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          DocFlow
        </Link>

        <div className="flex gap-4">
          {isLoggedIn ? (
            <>
              <Link to="/documents" className="text-gray-700 hover:text-blue-600">
                Documents
              </Link>
              <Link to="/search" className="text-gray-700 hover:text-blue-600">
                Search
              </Link>
              {isAdmin && (
                <Link to="/admin" className="text-purple-700 hover:text-purple-900 font-medium">
                  Admin
                </Link>
              )}
              <Button variant="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-blue-600">
                Login
              </Link>
              <Link to="/register" className="text-gray-700 hover:text-blue-600">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
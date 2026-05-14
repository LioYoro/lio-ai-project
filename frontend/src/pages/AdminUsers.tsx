import { useQuery } from "@tanstack/react-query";
import { Navbar } from "../components/layout/Navbar";
import { Card } from "../components/ui/Card";
import { getAdminUsers, AdminUser } from "../lib/adminApi";

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  user: "bg-gray-100 text-gray-700",
};

export const AdminUsers = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: getAdminUsers,
  });

  const users = Array.isArray(data) ? data : [];

  if (isLoading) {
    return (
      <div>
        <Navbar isLoggedIn={true} />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar isLoggedIn={true} />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <p className="text-red-600">Error loading users</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar isLoggedIn={true} />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">Manage Users</h1>
        <p className="text-gray-600 mb-8">View all users and their roles</p>

        {/* Users Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Email</th>
                  <th className="text-left py-3 px-4 font-semibold">Role</th>
                  <th className="text-left py-3 px-4 font-semibold">Created At</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-600">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user: AdminUser) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{user.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            ROLE_COLORS[user.role] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(user.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminAPI } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { 
  Shield, 
  Search, 
  Users, 
  ChevronLeft, 
  ChevronRight, 
  Edit, 
  Trash2, 
  UserCog,
  X,
  Save,
  AlertTriangle
} from 'lucide-react';
import { formatDate } from '../lib/utils';

interface UserData {
  id: number;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  lastLogin?: string;
  quizCount?: number;
  avgScore?: number;
  totalQuizzes?: number;
}

export default function AdminPanel() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<UserData[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<'user' | 'admin'>('user');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<UserData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getUsers({ search, page, limit: 10 });
      setUsers(response.data.users);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const openEditModal = (u: UserData) => {
    setEditingUser(u);
    setEditEmail(u.email);
    setEditPassword('');
    setEditRole(u.role);
    setEditError('');
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingUser(null);
    setEditEmail('');
    setEditPassword('');
    setEditError('');
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    
    setEditLoading(true);
    setEditError('');

    try {
      // Update role if changed
      if (editRole !== editingUser.role) {
        await adminAPI.updateUserRole(editingUser.id, editRole);
      }

      // Update email/password if changed
      const updates: { email?: string; password?: string } = {};
      if (editEmail !== editingUser.email) {
        updates.email = editEmail;
      }
      if (editPassword) {
        updates.password = editPassword;
      }

      if (Object.keys(updates).length > 0) {
        await adminAPI.updateUser(editingUser.id, updates);
      }

      closeEditModal();
      fetchUsers();
    } catch (error: any) {
      setEditError(error.response?.data?.error || 'Failed to update user');
    } finally {
      setEditLoading(false);
    }
  };

  const openDeleteModal = (u: UserData) => {
    setDeletingUser(u);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeletingUser(null);
  };

  const handleDelete = async () => {
    if (!deletingUser) return;

    setDeleteLoading(true);
    try {
      await adminAPI.deleteUser(deletingUser.id);
      closeDeleteModal();
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete user');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleQuickRoleToggle = async (u: UserData) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    try {
      await adminAPI.updateUserRole(u.id, newRole);
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update role');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Shield className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground">You need admin privileges to access this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4 mb-6">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Admin Panel</h1>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search by email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : users.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2">Email</th>
                        <th className="text-center py-3 px-2">Role</th>
                        <th className="text-center py-3 px-2">Quizzes</th>
                        <th className="text-right py-3 px-2">Joined</th>
                        <th className="text-center py-3 px-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b hover:bg-secondary/50">
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              {u.role === 'admin' && (
                                <Shield className="h-4 w-4 text-yellow-500" />
                              )}
                              <span className="font-medium">{u.email}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <button
                              onClick={() => handleQuickRoleToggle(u)}
                              disabled={u.id === user?.id}
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                                u.role === 'admin' 
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
                                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                              }`}
                              title={u.id === user?.id ? 'Cannot change your own role' : `Click to make ${u.role === 'admin' ? 'user' : 'admin'}`}
                            >
                              {u.role}
                            </button>
                          </td>
                          <td className="py-3 px-2 text-center">{u.totalQuizzes || u.quizCount || 0}</td>
                          <td className="py-3 px-2 text-right text-sm text-muted-foreground">
                            {formatDate(u.createdAt)}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openEditModal(u)}
                                className="p-1.5 rounded-md hover:bg-primary/10 text-primary transition-colors"
                                title="Edit user"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openDeleteModal(u)}
                                disabled={u.id === user?.id}
                                className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title={u.id === user?.id ? 'Cannot delete yourself' : 'Delete user'}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No users found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editModalOpen && editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <UserCog className="h-5 w-5" />
                  Edit User
                </h2>
                <button
                  onClick={closeEditModal}
                  className="p-1 rounded hover:bg-secondary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {editError && (
                  <div className="p-3 rounded-md bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
                    {editError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    New Password <span className="text-muted-foreground font-normal">(leave empty to keep current)</span>
                  </label>
                  <Input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as 'user' | 'admin')}
                    disabled={editingUser.id === user?.id}
                    className="w-full px-3 py-2 rounded-md border bg-background text-foreground disabled:opacity-50"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  {editingUser.id === user?.id && (
                    <p className="text-xs text-muted-foreground mt-1">You cannot change your own role</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 p-4 border-t bg-secondary/30">
                <Button variant="outline" onClick={closeEditModal}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} disabled={editLoading}>
                  {editLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && deletingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-red-500">
                  <AlertTriangle className="h-5 w-5" />
                  Delete User
                </h2>
                <button
                  onClick={closeDeleteModal}
                  className="p-1 rounded hover:bg-secondary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4">
                <p className="text-center">
                  Are you sure you want to delete <strong>{deletingUser.email}</strong>?
                </p>
                <p className="text-center text-sm text-muted-foreground mt-2">
                  This will permanently delete the user and all their quiz data. This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-end gap-2 p-4 border-t bg-secondary/30">
                <Button variant="outline" onClick={closeDeleteModal}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleDelete} 
                  disabled={deleteLoading}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  {deleteLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete User
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedView, { FadeInDown, FadeInUp, SlideInRight } from '../../components/ui/AnimatedView';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { adminAPI } from '../../lib/api';
import { Card, Button, Badge, Modal, Input } from '../../components/ui';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../../constants/theme';

type User = {
  id: number;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
};

export default function AdminScreen() {
  const { themeColors } = useTheme();
  const { user: currentUser } = useAuthStore();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers({});
      // API returns { users: [...], pagination: {...} }
      setUsers(response.data?.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleRoleChange = async (newRole: 'user' | 'admin') => {
    if (!selectedUser) return;

    setProcessing(true);
    try {
      await adminAPI.updateUserRole(selectedUser.id, newRole);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, role: newRole } : u
        )
      );
      setShowRoleModal(false);
      Alert.alert('Success', `${selectedUser.email} is now ${newRole === 'admin' ? 'Admin' : 'User'}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to change role');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setProcessing(true);
    try {
      await adminAPI.deleteUser(selectedUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      setShowDeleteModal(false);
      Alert.alert('Success', 'User deleted');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete user');
    } finally {
      setProcessing(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === 'admin').length,
    users: users.filter((u) => u.role === 'user').length,
  };

  if (currentUser?.role !== 'admin') {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: themeColors.background }]}>
        <Ionicons name="lock-closed" size={64} color={themeColors.textSecondary} />
        <Text style={[styles.accessDenied, { color: themeColors.text }]}>
          Access Denied
        </Text>
        <Text style={[styles.accessDeniedSub, { color: themeColors.textSecondary }]}>
          You need admin privileges to view this page.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themeColors.primary}
          />
        }
      >
        {/* Header */}
        <AnimatedView entering={FadeInDown.duration(500)}>
          <LinearGradient
            colors={[themeColors.warning + '30', themeColors.background]}
            style={styles.headerGradient}
          >
            <View style={styles.headerRow}>
              <View>
                <Text style={[styles.title, { color: themeColors.text }]}>
                  👑 Admin Panel
                </Text>
                <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
                  Manage users
                </Text>
              </View>
            </View>
          </LinearGradient>
        </AnimatedView>

        {/* Stats Cards */}
        <AnimatedView
          entering={FadeInUp.duration(500).delay(100)}
          style={styles.statsContainer}
        >
          <Card style={styles.statCard}>
            <Ionicons name="people" size={24} color="#3b82f6" />
            <Text style={[styles.statValue, { color: themeColors.text }]}>
              {stats.total}
            </Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
              Total
            </Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="shield" size={24} color="#f59e0b" />
            <Text style={[styles.statValue, { color: themeColors.text }]}>
              {stats.admins}
            </Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
              Admin
            </Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="person" size={24} color="#10b981" />
            <Text style={[styles.statValue, { color: themeColors.text }]}>
              {stats.users}
            </Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
              Users
            </Text>
          </Card>
        </AnimatedView>

        {/* Search */}
        <AnimatedView entering={FadeInUp.duration(500).delay(200)} style={styles.searchContainer}>
          <View style={[styles.searchWrapper, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
            <Ionicons name="search" size={20} color={themeColors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: themeColors.text }]}
              placeholder="Search users..."
              placeholderTextColor={themeColors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={themeColors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </AnimatedView>

        {/* Users List */}
        <AnimatedView entering={FadeInUp.duration(500).delay(300)}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Users ({filteredUsers.length})
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <View style={[styles.loader, { borderColor: themeColors.primary }]} />
            </View>
          ) : filteredUsers.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="person-outline" size={48} color={themeColors.textSecondary} />
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
                No users found
              </Text>
            </Card>
          ) : (
            <View style={styles.usersList}>
              {filteredUsers.map((user, index) => (
                <AnimatedView
                  key={user.id}
                  entering={SlideInRight.duration(300).delay(index * 50)}
                >
                  <Card style={styles.userCard}>
                    <View style={styles.userInfo}>
                      <LinearGradient
                        colors={
                          user.role === 'admin'
                            ? ['#f59e0b', '#d97706']
                            : [themeColors.primary, themeColors.accent]
                        }
                        style={styles.avatar}
                      >
                        <Text style={styles.avatarText}>
                          {user.email[0].toUpperCase()}
                        </Text>
                      </LinearGradient>
                      <View style={styles.userDetails}>
                        <View style={styles.userNameRow}>
                          <Text style={[styles.userName, { color: themeColors.text }]}>
                            {user.email.split('@')[0]}
                          </Text>
                          {user.id === currentUser?.id && (
                            <Badge text="You" variant="info" size="sm" />
                          )}
                        </View>
                        <Text style={[styles.userEmail, { color: themeColors.textSecondary }]}>
                          {user.email}
                        </Text>
                        <Badge
                          text={user.role === 'admin' ? '👑 Admin' : '👤 User'}
                          variant={user.role === 'admin' ? 'warning' : 'default'}
                          size="sm"
                        />
                      </View>
                    </View>

                    {user.id !== currentUser?.id && (
                      <View style={styles.userActions}>
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedUser(user);
                            setShowRoleModal(true);
                          }}
                          style={[styles.actionButton, { backgroundColor: themeColors.primary + '20' }]}
                        >
                          <Ionicons name="swap-horizontal" size={18} color={themeColors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedUser(user);
                            setShowDeleteModal(true);
                          }}
                          style={[styles.actionButton, { backgroundColor: themeColors.error + '20' }]}
                        >
                          <Ionicons name="trash" size={18} color={themeColors.error} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </Card>
                </AnimatedView>
              ))}
            </View>
          )}
        </AnimatedView>
      </ScrollView>

      {/* Role Change Modal */}
      <Modal visible={showRoleModal} onClose={() => setShowRoleModal(false)}>
        <View style={styles.modalContent}>
          <Ionicons name="swap-horizontal" size={48} color={themeColors.primary} />
          <Text style={[styles.modalTitle, { color: themeColors.text }]}>
            Change Role
          </Text>
          <Text style={[styles.modalSubtitle, { color: themeColors.textSecondary }]}>
            {selectedUser?.email}
          </Text>

          <View style={styles.roleOptions}>
            <TouchableOpacity
              onPress={() => handleRoleChange('user')}
              disabled={processing}
              style={[
                styles.roleOption,
                {
                  backgroundColor:
                    selectedUser?.role === 'user'
                      ? themeColors.primary
                      : themeColors.surface,
                  borderColor:
                    selectedUser?.role === 'user'
                      ? themeColors.primary
                      : themeColors.border,
                  opacity: processing ? 0.5 : 1,
                },
              ]}
            >
              <Ionicons
                name="person"
                size={24}
                color={selectedUser?.role === 'user' ? '#fff' : themeColors.text}
              />
              <Text
                style={[
                  styles.roleOptionText,
                  { color: selectedUser?.role === 'user' ? '#fff' : themeColors.text },
                ]}
              >
                User
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleRoleChange('admin')}
              disabled={processing}
              style={[
                styles.roleOption,
                {
                  backgroundColor:
                    selectedUser?.role === 'admin'
                      ? '#f59e0b'
                      : themeColors.surface,
                  borderColor:
                    selectedUser?.role === 'admin'
                      ? '#f59e0b'
                      : themeColors.border,
                  opacity: processing ? 0.5 : 1,
                },
              ]}
            >
              <Ionicons
                name="shield"
                size={24}
                color={selectedUser?.role === 'admin' ? '#fff' : themeColors.text}
              />
              <Text
                style={[
                  styles.roleOptionText,
                  { color: selectedUser?.role === 'admin' ? '#fff' : themeColors.text },
                ]}
              >
                Admin
              </Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Cancel"
            variant="ghost"
            onPress={() => setShowRoleModal(false)}
            fullWidth
          />
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <View style={styles.modalContent}>
          <View style={[styles.deleteIcon, { backgroundColor: themeColors.error + '20' }]}>
            <Ionicons name="trash" size={32} color={themeColors.error} />
          </View>
          <Text style={[styles.modalTitle, { color: themeColors.text }]}>
            Delete User
          </Text>
          <Text style={[styles.modalSubtitle, { color: themeColors.textSecondary }]}>
            Are you sure you want to delete {selectedUser?.email}?
            This action cannot be undone.
          </Text>

          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              variant="ghost"
              onPress={() => setShowDeleteModal(false)}
              style={{ flex: 1 }}
            />
            <Button
              title="Delete"
              variant="danger"
              onPress={handleDeleteUser}
              loading={processing}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  accessDenied: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginTop: spacing.lg,
  },
  accessDeniedSub: {
    fontSize: fontSize.md,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  headerGradient: {
    paddingTop: spacing.xxl + spacing.xl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  searchContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    padding: 0,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  loadingContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  loader: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderTopColor: 'transparent',
  },
  emptyCard: {
    marginHorizontal: spacing.xl,
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyText: {
    fontSize: fontSize.md,
    marginTop: spacing.md,
  },
  usersList: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  userDetails: {
    flex: 1,
    gap: spacing.xs,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  userName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  userEmail: {
    fontSize: fontSize.xs,
  },
  userActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    fontSize: fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  roleOptions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
    width: '100%',
  },
  roleOption: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    gap: spacing.sm,
  },
  roleOptionText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  deleteIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
});

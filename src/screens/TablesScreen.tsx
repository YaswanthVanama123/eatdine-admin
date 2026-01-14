/**
 * Tables Management Screen
 * Manage restaurant tables, their status, and assignments
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { theme } from '../theme';
import { tablesApi } from '../api/tables.api';
import { Table } from '../types';

export default function TablesScreen() {
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState({
    number: '',
    capacity: '',
    location: '',
  });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      const data = await tablesApi.getAll();
      setTables(data);
    } catch (error) {
      console.error('Failed to fetch tables:', error);
      Alert.alert('Error', 'Failed to load tables');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchTables(true);
  };

  const handleAddTable = () => {
    setSelectedTable(null);
    setFormData({ number: '', capacity: '', location: '' });
    setIsFormOpen(true);
  };

  const handleEditTable = (table: Table) => {
    setSelectedTable(table);
    setFormData({
      number: table.number.toString(),
      capacity: table.capacity.toString(),
      location: table.location || '',
    });
    setIsFormOpen(true);
  };

  const handleSaveTable = async () => {
    if (!formData.number || !formData.capacity) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const tableData = {
        number: parseInt(formData.number),
        capacity: parseInt(formData.capacity),
        location: formData.location,
      };

      if (selectedTable) {
        await tablesApi.update(selectedTable._id, tableData);
      } else {
        await tablesApi.create(tableData);
      }

      setIsFormOpen(false);
      fetchTables();
    } catch (error) {
      console.error('Error saving table:', error);
      Alert.alert('Error', 'Failed to save table');
    }
  };

  const handleDeleteTable = (table: Table) => {
    Alert.alert(
      'Delete Table',
      `Are you sure you want to delete Table ${table.number}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await tablesApi.delete(table._id);
              fetchTables();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete table');
            }
          },
        },
      ]
    );
  };

  const handleToggleStatus = async (table: Table) => {
    try {
      await tablesApi.updateStatus(table._id, table.isAvailable ? 'occupied' : 'available');
      fetchTables();
    } catch (error) {
      Alert.alert('Error', 'Failed to update table status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#10B981';
      case 'occupied': return '#EF4444';
      case 'reserved': return '#F59E0B';
      default: return theme.colors.textTertiary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return 'circle-check';
      case 'occupied': return 'users';
      case 'reserved': return 'clock';
      default: return 'circle';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading tables...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Tables</Text>
            <Text style={styles.headerSubtitle}>Manage restaurant tables</Text>
          </View>
          <View style={styles.headerIcon}>
            <Icon name="chair" size="2xl" color={theme.colors.primary} solid />
          </View>
        </View>

        {/* Stats Banner */}
        <View style={styles.statsBanner}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{tables.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              {tables.filter(t => t.isAvailable).length}
            </Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>
              {tables.filter(t => !t.isAvailable).length}
            </Text>
            <Text style={styles.statLabel}>Occupied</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gridContainer}>
          {tables.map((table) => (
            <TouchableOpacity
              key={table._id}
              style={styles.tableCard}
              onPress={() => handleEditTable(table)}
              activeOpacity={0.7}
            >
              {/* Status Indicator */}
              <View
                style={[
                  styles.statusBar,
                  { backgroundColor: getStatusColor(table.isAvailable ? 'available' : 'occupied') }
                ]}
              />

              <View style={styles.tableCardContent}>
                {/* Icon Circle */}
                <View
                  style={[
                    styles.tableIconCircle,
                    {
                      backgroundColor:
                        getStatusColor(table.isAvailable ? 'available' : 'occupied') + '15'
                    }
                  ]}
                >
                  <Icon
                    name={getStatusIcon(table.isAvailable ? 'available' : 'occupied')}
                    size="xl"
                    color={getStatusColor(table.isAvailable ? 'available' : 'occupied')}
                    solid
                  />
                </View>

                {/* Table Info */}
                <Text style={styles.tableNumber}>Table {table.number}</Text>

                <View style={styles.tableInfo}>
                  <Icon name="users" size="sm" color={theme.colors.textSecondary} />
                  <Text style={styles.tableInfoText}>{table.capacity} seats</Text>
                </View>

                {table.location && (
                  <View style={styles.tableInfo}>
                    <Icon name="location-dot" size="sm" color={theme.colors.textSecondary} />
                    <Text style={styles.tableInfoText}>{table.location}</Text>
                  </View>
                )}

                {/* Status Badge */}
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: getStatusColor(table.isAvailable ? 'available' : 'occupied')
                    }
                  ]}
                >
                  <Text style={styles.statusBadgeText}>
                    {table.isAvailable ? 'Available' : 'Occupied'}
                  </Text>
                </View>

                {/* Actions */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleToggleStatus(table)}
                  >
                    <Icon
                      name={table.isAvailable ? 'xmark' : 'check'}
                      size="sm"
                      color={theme.colors.primary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditTable(table)}
                  >
                    <Icon name="pen-to-square" size="sm" color={theme.colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteTable(table)}
                  >
                    <Icon name="trash-can" size="sm" color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {tables.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="chair" size="4xl" color={theme.colors.textTertiary} />
            <Text style={styles.emptyText}>No tables found</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add your first table</Text>
          </View>
        )}
      </ScrollView>

      {/* Add Table FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleAddTable} activeOpacity={0.8}>
        <Icon name="plus" size="lg" color={theme.colors.textInverse} solid />
      </TouchableOpacity>

      {/* Form Modal */}
      <Modal
        visible={isFormOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsFormOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedTable ? 'Edit Table' : 'Add Table'}
              </Text>
              <TouchableOpacity onPress={() => setIsFormOpen(false)}>
                <Icon name="xmark" size="lg" color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Table Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 1"
                  value={formData.number}
                  onChangeText={(text) => setFormData({ ...formData, number: text })}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Capacity *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 4"
                  value={formData.capacity}
                  onChangeText={(text) => setFormData({ ...formData, capacity: text })}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Location</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Main Hall, Window Side"
                  value={formData.location}
                  onChangeText={(text) => setFormData({ ...formData, location: text })}
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => setIsFormOpen(false)}
              >
                <Text style={styles.buttonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={handleSaveTable}
              >
                <Text style={styles.buttonPrimaryText}>
                  {selectedTable ? 'Update' : 'Add Table'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerContainer: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    ...theme.shadows.md,
    borderBottomLeftRadius: theme.borderRadius['2xl'],
    borderBottomRightRadius: theme.borderRadius['2xl'],
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsBanner: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  tableCard: {
    width: '47%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  statusBar: {
    height: 3,
    width: '100%',
  },
  tableCardContent: {
    padding: theme.spacing.base,
  },
  tableIconCircle: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  tableNumber: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  tableInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  tableInfoText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textInverse,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardActions: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border + '30',
  },
  actionButton: {
    flex: 1,
    backgroundColor: theme.colors.primaryBg,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing['5xl'],
    paddingHorizontal: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius['2xl'],
    borderTopRightRadius: theme.borderRadius['2xl'],
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border + '30',
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.text,
  },
  modalBody: {
    padding: theme.spacing.lg,
  },
  formGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.base,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border + '30',
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.base,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  buttonSecondary: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonPrimaryText: {
    color: theme.colors.textInverse,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
  },
  buttonSecondaryText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});

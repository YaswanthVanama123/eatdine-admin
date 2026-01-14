/**
 * Add-Ons Management Screen
 * Manage menu add-ons and customizations
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Switch,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { theme } from '../theme';
import { addOnsApi } from '../api/addOns.api';
import { formatCurrency } from '../utils/format';
import { AddOn } from '../types';

export default function AddOnsScreen() {
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAddOn, setSelectedAddOn] = useState<AddOn | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    isAvailable: true,
  });

  useEffect(() => {
    fetchAddOns();
  }, []);

  const fetchAddOns = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      const data = await addOnsApi.getAll();
      setAddOns(data);
    } catch (error) {
      console.error('Failed to fetch add-ons:', error);
      Alert.alert('Error', 'Failed to load add-ons');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchAddOns(true);
  };

  const handleAddAddOn = () => {
    setSelectedAddOn(null);
    setFormData({ name: '', description: '', price: '', isAvailable: true });
    setIsFormOpen(true);
  };

  const handleEditAddOn = (addOn: AddOn) => {
    setSelectedAddOn(addOn);
    setFormData({
      name: addOn.name,
      description: addOn.description || '',
      price: addOn.price.toString(),
      isAvailable: addOn.isAvailable,
    });
    setIsFormOpen(true);
  };

  const handleSaveAddOn = async () => {
    if (!formData.name || !formData.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const addOnData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        isAvailable: formData.isAvailable,
      };

      if (selectedAddOn) {
        await addOnsApi.update(selectedAddOn._id, addOnData);
      } else {
        await addOnsApi.create(addOnData);
      }

      setIsFormOpen(false);
      fetchAddOns();
    } catch (error) {
      console.error('Error saving add-on:', error);
      Alert.alert('Error', 'Failed to save add-on');
    }
  };

  const handleDeleteAddOn = (addOn: AddOn) => {
    Alert.alert(
      'Delete Add-On',
      `Are you sure you want to delete "${addOn.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await addOnsApi.delete(addOn._id);
              fetchAddOns();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete add-on');
            }
          },
        },
      ]
    );
  };

  const handleToggleAvailability = async (addOn: AddOn) => {
    try {
      await addOnsApi.update(addOn._id, { isAvailable: !addOn.isAvailable });
      fetchAddOns();
    } catch (error) {
      Alert.alert('Error', 'Failed to update add-on status');
    }
  };

  const renderAddOnItem = ({ item }: { item: AddOn }) => (
    <View style={styles.addOnCard}>
      <View style={styles.addOnCardHeader}>
        <View style={styles.addOnIconContainer}>
          <View style={[styles.addOnIcon, { backgroundColor: item.isAvailable ? '#D1FAE5' : '#FEE2E2' }]}>
            <Icon name="pizza-slice" size="lg" color={item.isAvailable ? '#10B981' : '#EF4444'} solid />
          </View>
        </View>

        <View style={styles.addOnInfo}>
          <Text style={styles.addOnName}>{item.name}</Text>
          {item.description && (
            <Text style={styles.addOnDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          <Text style={styles.addOnPrice}>{formatCurrency(item.price)}</Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: item.isAvailable ? '#D1FAE5' : '#FEE2E2' }
          ]}
        >
          <Text
            style={[
              styles.statusBadgeText,
              { color: item.isAvailable ? '#059669' : '#DC2626' }
            ]}
          >
            {item.isAvailable ? 'Available' : 'Unavailable'}
          </Text>
        </View>
      </View>

      <View style={styles.addOnActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.toggleButton]}
          onPress={() => handleToggleAvailability(item)}
        >
          <Icon
            name={item.isAvailable ? 'toggle-on' : 'toggle-off'}
            size="md"
            color={item.isAvailable ? '#10B981' : '#6B7280'}
          />
          <Text style={styles.actionButtonText}>Toggle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditAddOn(item)}
        >
          <Icon name="pen-to-square" size="md" color="#3B82F6" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteAddOn(item)}
        >
          <Icon name="trash-can" size="md" color="#EF4444" />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading add-ons...</Text>
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
            <Text style={styles.headerTitle}>Add-Ons</Text>
            <Text style={styles.headerSubtitle}>Manage menu customizations</Text>
          </View>
          <View style={styles.headerIcon}>
            <Icon name="pizza-slice" size="2xl" color={theme.colors.primary} solid />
          </View>
        </View>

        {/* Stats Banner */}
        <View style={styles.statsBanner}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{addOns.length}</Text>
            <Text style={styles.statLabel}>Total Add-Ons</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              {addOns.filter(a => a.isAvailable).length}
            </Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>
              {addOns.filter(a => !a.isAvailable).length}
            </Text>
            <Text style={styles.statLabel}>Unavailable</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={addOns}
        renderItem={renderAddOnItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="pizza-slice" size="4xl" color={theme.colors.textTertiary} />
            <Text style={styles.emptyText}>No add-ons found</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add your first add-on</Text>
          </View>
        }
      />

      {/* Add AddOn FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleAddAddOn} activeOpacity={0.8}>
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
                {selectedAddOn ? 'Edit Add-On' : 'Add Add-On'}
              </Text>
              <TouchableOpacity onPress={() => setIsFormOpen(false)}>
                <Icon name="xmark" size="lg" color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Extra Cheese"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Optional description..."
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Price *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  value={formData.price}
                  onChangeText={(text) => setFormData({ ...formData, price: text })}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <View style={styles.switchContainer}>
                  <View>
                    <Text style={styles.label}>Available</Text>
                    <Text style={styles.helperText}>Customers can select this add-on</Text>
                  </View>
                  <Switch
                    value={formData.isAvailable}
                    onValueChange={(value) => setFormData({ ...formData, isAvailable: value })}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
                    thumbColor={formData.isAvailable ? theme.colors.primary : theme.colors.surface}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => setIsFormOpen(false)}
              >
                <Text style={styles.buttonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={handleSaveAddOn}
              >
                <Text style={styles.buttonPrimaryText}>
                  {selectedAddOn ? 'Update' : 'Add Add-On'}
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
    textAlign: 'center',
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
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  addOnCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.base,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  addOnCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  addOnIconContainer: {
    marginRight: theme.spacing.md,
  },
  addOnIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addOnInfo: {
    flex: 1,
  },
  addOnName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  addOnDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  addOnPrice: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.primary,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: theme.typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addOnActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border + '30',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: 6,
  },
  toggleButton: {
    backgroundColor: theme.colors.background,
  },
  editButton: {
    backgroundColor: '#EFF6FF',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
  },
  actionButtonText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helperText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
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

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Checkbox } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AddOn } from '../../types';
import { formatCurrency } from '../../utils/format';

interface AddOnsSelectorProps {
  value: string[];
  onChange: (addOnIds: string[]) => void;
  addOns: AddOn[];
}

const AddOnsSelector: React.FC<AddOnsSelectorProps> = ({ value = [], onChange, addOns }) => {
  const toggleAddOn = (addOnId: string) => {
    if (value.includes(addOnId)) {
      onChange(value.filter((id) => id !== addOnId));
    } else {
      onChange([...value, addOnId]);
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  if (addOns.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Add-Ons</Text>
        <Text style={styles.subtitle}>Select add-ons available for this item</Text>

        <View style={styles.emptyContainer}>
          <Ionicons name="fast-food-outline" size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>No add-ons available</Text>
          <Text style={styles.emptySubtext}>
            Create add-ons first in the Add-Ons management page
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Add-Ons</Text>
          <Text style={styles.subtitle}>
            {value.length} selected
          </Text>
        </View>
        {value.length > 0 && (
          <TouchableOpacity onPress={clearAll}>
            <Text style={styles.clearButton}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.listContainer}>
        {addOns.map((addOn) => {
          const isSelected = value.includes(addOn._id);
          const isAvailable = addOn.isAvailable;

          return (
            <TouchableOpacity
              key={addOn._id}
              style={[
                styles.addOnCard,
                !isAvailable && styles.addOnCardDisabled,
                isSelected && styles.addOnCardSelected,
              ]}
              onPress={() => toggleAddOn(addOn._id)}
              disabled={!isAvailable}
            >
              <View style={styles.checkboxContainer}>
                <Checkbox
                  status={isSelected ? 'checked' : 'unchecked'}
                  onPress={() => toggleAddOn(addOn._id)}
                  disabled={!isAvailable}
                />
              </View>

              <View style={styles.addOnInfo}>
                <View style={styles.addOnHeader}>
                  <Text
                    style={[
                      styles.addOnName,
                      !isAvailable && styles.addOnNameDisabled,
                    ]}
                  >
                    {addOn.name}
                  </Text>
                  <Text style={styles.addOnPrice}>{formatCurrency(addOn.price)}</Text>
                </View>

                {addOn.description && (
                  <Text
                    style={[
                      styles.addOnDescription,
                      !isAvailable && styles.addOnDescriptionDisabled,
                    ]}
                    numberOfLines={2}
                  >
                    {addOn.description}
                  </Text>
                )}

                {!isAvailable && (
                  <View style={styles.unavailableBadge}>
                    <Text style={styles.unavailableText}>Unavailable</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  clearButton: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e5e7eb',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  listContainer: {
    gap: 8,
  },
  addOnCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  addOnCardSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#eef2ff',
  },
  addOnCardDisabled: {
    backgroundColor: '#f9fafb',
    opacity: 0.6,
  },
  checkboxContainer: {
    marginRight: 8,
    marginTop: -4,
  },
  addOnInfo: {
    flex: 1,
  },
  addOnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  addOnName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 8,
  },
  addOnNameDisabled: {
    color: '#9ca3af',
  },
  addOnPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  addOnDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  addOnDescriptionDisabled: {
    color: '#9ca3af',
  },
  unavailableBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  unavailableText: {
    fontSize: 11,
    color: '#ef4444',
    fontWeight: '500',
  },
});

export default AddOnsSelector;

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { TextInput, Button, Surface, Chip, Switch } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Customization, CustomizationOption } from '../../types';

interface CustomizationBuilderProps {
  value: Customization[];
  onChange: (customizations: Customization[]) => void;
}

const CustomizationBuilder: React.FC<CustomizationBuilderProps> = ({ value = [], onChange }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const addCustomization = () => {
    onChange([
      ...value,
      {
        name: '',
        type: 'single',
        required: false,
        options: [],
      },
    ]);
    setExpandedIndex(value.length);
  };

  const updateCustomization = (index: number, updates: Partial<Customization>) => {
    const updated = [...value];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const removeCustomization = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
    if (expandedIndex === index) {
      setExpandedIndex(null);
    }
  };

  const addOption = (customizationIndex: number) => {
    const customization = value[customizationIndex];
    updateCustomization(customizationIndex, {
      options: [...customization.options, { label: '', priceModifier: 0 }],
    });
  };

  const updateOption = (
    customizationIndex: number,
    optionIndex: number,
    updates: Partial<CustomizationOption>
  ) => {
    const customization = value[customizationIndex];
    const updatedOptions = [...customization.options];
    updatedOptions[optionIndex] = { ...updatedOptions[optionIndex], ...updates };
    updateCustomization(customizationIndex, { options: updatedOptions });
  };

  const removeOption = (customizationIndex: number, optionIndex: number) => {
    const customization = value[customizationIndex];
    updateCustomization(customizationIndex, {
      options: customization.options.filter((_, i) => i !== optionIndex),
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Customization Options</Text>
        <Button mode="outlined" onPress={addCustomization} compact icon="plus">
          Add Group
        </Button>
      </View>

      {value.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="options-outline" size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>No customization options added yet</Text>
          <Text style={styles.emptySubtext}>
            Tap "Add Group" to create customization groups like Size, Toppings, etc.
          </Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {value.map((customization, index) => (
            <Surface key={index} style={styles.customizationCard} elevation={1}>
              <TouchableOpacity
                style={styles.customizationHeader}
                onPress={() => setExpandedIndex(expandedIndex === index ? null : index)}
              >
                <View style={styles.customizationHeaderLeft}>
                  <Text style={styles.customizationName}>
                    {customization.name || `Customization Group ${index + 1}`}
                  </Text>
                  <Text style={styles.optionCount}>
                    {customization.options.length} option{customization.options.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={styles.customizationHeaderRight}>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => removeCustomization(index)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                  <Ionicons
                    name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#6b7280"
                  />
                </View>
              </TouchableOpacity>

              {expandedIndex === index && (
                <View style={styles.customizationBody}>
                  <TextInput
                    label="Group Name"
                    placeholder="e.g., Size, Toppings"
                    value={customization.name}
                    onChangeText={(text) => updateCustomization(index, { name: text })}
                    mode="outlined"
                    style={styles.input}
                  />

                  <View style={styles.typeSelector}>
                    <Text style={styles.label}>Selection Type</Text>
                    <View style={styles.chipGroup}>
                      <Chip
                        mode={customization.type === 'single' ? 'flat' : 'outlined'}
                        selected={customization.type === 'single'}
                        onPress={() => updateCustomization(index, { type: 'single' })}
                        style={styles.chip}
                      >
                        Single Choice
                      </Chip>
                      <Chip
                        mode={customization.type === 'multiple' ? 'flat' : 'outlined'}
                        selected={customization.type === 'multiple'}
                        onPress={() => updateCustomization(index, { type: 'multiple' })}
                        style={styles.chip}
                      >
                        Multiple Choice
                      </Chip>
                    </View>
                  </View>

                  <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Required</Text>
                    <Switch
                      value={customization.required}
                      onValueChange={(value) => updateCustomization(index, { required: value })}
                    />
                  </View>

                  <View style={styles.optionsSection}>
                    <View style={styles.optionsHeader}>
                      <Text style={styles.label}>Options</Text>
                      <Button mode="outlined" onPress={() => addOption(index)} compact icon="plus">
                        Add Option
                      </Button>
                    </View>

                    {customization.options.length === 0 ? (
                      <View style={styles.emptyOptions}>
                        <Text style={styles.emptyOptionsText}>No options added yet</Text>
                      </View>
                    ) : (
                      <View style={styles.optionsList}>
                        {customization.options.map((option, optionIndex) => (
                          <View key={optionIndex} style={styles.optionRow}>
                            <View style={styles.optionInputs}>
                              <TextInput
                                placeholder="Option name"
                                value={option.label}
                                onChangeText={(text) =>
                                  updateOption(index, optionIndex, { label: text })
                                }
                                mode="outlined"
                                style={[styles.input, styles.optionInput]}
                                dense
                              />
                              <TextInput
                                placeholder="Price"
                                value={option.priceModifier.toString()}
                                onChangeText={(text) =>
                                  updateOption(index, optionIndex, {
                                    priceModifier: parseFloat(text) || 0,
                                  })
                                }
                                mode="outlined"
                                keyboardType="decimal-pad"
                                style={[styles.input, styles.priceInput]}
                                left={<TextInput.Affix text="$" />}
                                dense
                              />
                            </View>
                            <TouchableOpacity
                              style={styles.removeButton}
                              onPress={() => removeOption(index, optionIndex)}
                            >
                              <Ionicons name="close-circle" size={24} color="#ef4444" />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              )}
            </Surface>
          ))}
        </View>
      )}
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
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
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
    gap: 12,
  },
  customizationCard: {
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 12,
    overflow: 'hidden',
  },
  customizationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  customizationHeaderLeft: {
    flex: 1,
  },
  customizationHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customizationName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  optionCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  iconButton: {
    padding: 4,
  },
  customizationBody: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  input: {
    marginBottom: 12,
  },
  typeSelector: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  chipGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  optionsSection: {
    marginTop: 12,
  },
  optionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyOptions: {
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyOptionsText: {
    fontSize: 13,
    color: '#6b7280',
  },
  optionsList: {
    gap: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  optionInputs: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  optionInput: {
    flex: 2,
    marginBottom: 0,
  },
  priceInput: {
    flex: 1,
    marginBottom: 0,
  },
  removeButton: {
    padding: 4,
    marginTop: 8,
  },
});

export default CustomizationBuilder;

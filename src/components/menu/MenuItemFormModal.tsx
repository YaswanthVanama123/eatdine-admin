import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {
  TextInput,
  Button,
  Surface,
  Switch,
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { MenuItem, MenuItemFormData, Category, AddOn } from '../../types';
import CustomizationBuilder from './CustomizationBuilder';
import AddOnsSelector from './AddOnsSelector';
import { useMenuPageData } from '../../hooks/useMenuPageData';

interface MenuItemFormModalProps {
  visible: boolean;
  onClose: () => void;
  item?: MenuItem;
  categories: Category[];
  addOns: AddOn[];
}

const MenuItemFormModal: React.FC<MenuItemFormModalProps> = ({
  visible,
  onClose,
  item,
  categories,
  addOns,
}) => {
  const { createItem, updateItem } = useMenuPageData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof MenuItemFormData, string>>>({});

  const [formData, setFormData] = useState<MenuItemFormData>({
    name: '',
    description: '',
    categoryId: '',
    price: 0,
    originalPrice: undefined,
    isAvailable: true,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isNonVeg: false,
    customizationOptions: [],
    addOnIds: [],
    preparationTime: 15,
  });

  useEffect(() => {
    if (item) {
      const categoryId =
        typeof item.categoryId === 'object' ? item.categoryId._id : item.categoryId;

      setFormData({
        name: item.name,
        description: item.description,
        categoryId,
        price: item.price,
        originalPrice: item.originalPrice,
        isAvailable: item.isAvailable,
        isVegetarian: item.isVegetarian,
        isVegan: item.isVegan,
        isGlutenFree: item.isGlutenFree,
        isNonVeg: item.isNonVeg || false,
        customizationOptions: item.customizationOptions,
        addOnIds: item.addOnIds || [],
        preparationTime: item.preparationTime,
      });

      if (item.images?.original || item.image) {
        const imagePath = item.images?.original || item.image;
        if (imagePath) {
          const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
          const fullUrl = imagePath.startsWith('http') ? imagePath : `${baseUrl}${imagePath}`;
          setImageUri(fullUrl);
        }
      }
    } else {
      resetForm();
    }
  }, [item, visible]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      categoryId: '',
      price: 0,
      originalPrice: undefined,
      isAvailable: true,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isNonVeg: false,
      customizationOptions: [],
      addOnIds: [],
      preparationTime: 15,
    });
    setImageUri(null);
    setErrors({});
  };

  const requestImagePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          {
            title: 'Gallery Permission',
            message: 'App needs access to your photos to upload menu item images',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Permission Required',
            'Sorry, we need gallery permissions to upload images.'
          );
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs access to your camera to take photos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Permission Required',
            'Sorry, we need camera permissions to take photos.'
          );
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestImagePermission();
    if (!hasPermission) return;

    const result = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 1000,
      maxWidth: 1000,
      quality: 0.8,
    });

    if (result.assets && result.assets[0] && result.assets[0].uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await launchCamera({
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 1000,
      maxWidth: 1000,
      quality: 0.8,
      saveToPhotos: true,
    });

    if (result.assets && result.assets[0] && result.assets[0].uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert('Upload Image', 'Choose an option', [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Gallery', onPress: pickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof MenuItemFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Name must not exceed 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length > 500) {
      newErrors.description = 'Description must not exceed 500 characters';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    if (formData.price < 0.01) {
      newErrors.price = 'Price must be at least $0.01';
    }

    if (
      formData.originalPrice !== undefined &&
      formData.originalPrice !== null &&
      formData.originalPrice < formData.price
    ) {
      newErrors.originalPrice = 'Original price must be greater than or equal to current price';
    }

    if (formData.preparationTime < 0) {
      newErrors.preparationTime = 'Preparation time cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    try {
      if (item) {
        await updateItem(item._id, formData, imageUri || undefined);
      } else {
        await createItem(formData, imageUri || undefined);
      }
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{item ? 'Edit Menu Item' : 'Add Menu Item'}</Text>
          <View style={styles.closeButton} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <Surface style={styles.section}>
            <TextInput
              label="Item Name *"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              mode="outlined"
              error={!!errors.name}
              style={styles.input}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

            <TextInput
              label="Description *"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              mode="outlined"
              multiline
              numberOfLines={3}
              error={!!errors.description}
              style={styles.input}
            />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Category *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipGroup}>
                    {categories
                      .filter((cat) => cat.isActive)
                      .map((cat) => (
                        <Chip
                          key={cat._id}
                          mode={formData.categoryId === cat._id ? 'flat' : 'outlined'}
                          selected={formData.categoryId === cat._id}
                          onPress={() => setFormData({ ...formData, categoryId: cat._id })}
                          style={styles.chip}
                        >
                          {cat.name}
                        </Chip>
                      ))}
                  </View>
                </ScrollView>
                {errors.categoryId && <Text style={styles.errorText}>{errors.categoryId}</Text>}
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <TextInput
                  label="Price *"
                  value={formData.price.toString()}
                  onChangeText={(text) =>
                    setFormData({ ...formData, price: parseFloat(text) || 0 })
                  }
                  mode="outlined"
                  keyboardType="decimal-pad"
                  error={!!errors.price}
                  style={styles.input}
                  left={<TextInput.Affix text="$" />}
                />
                {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
              </View>

              <View style={styles.halfInput}>
                <TextInput
                  label="Original Price"
                  value={formData.originalPrice?.toString() || ''}
                  onChangeText={(text) => {
                    const value = text === '' ? undefined : parseFloat(text);
                    setFormData({ ...formData, originalPrice: value });
                  }}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  error={!!errors.originalPrice}
                  style={styles.input}
                  left={<TextInput.Affix text="$" />}
                />
                {errors.originalPrice && (
                  <Text style={styles.errorText}>{errors.originalPrice}</Text>
                )}
              </View>
            </View>

            <TextInput
              label="Preparation Time (minutes) *"
              value={formData.preparationTime.toString()}
              onChangeText={(text) =>
                setFormData({ ...formData, preparationTime: parseInt(text) || 0 })
              }
              mode="outlined"
              keyboardType="number-pad"
              error={!!errors.preparationTime}
              style={styles.input}
            />
            {errors.preparationTime && (
              <Text style={styles.errorText}>{errors.preparationTime}</Text>
            )}
          </Surface>

          <Surface style={styles.section}>
            <Text style={styles.sectionTitle}>Item Image</Text>
            {imageUri ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: imageUri }} style={styles.image} />
                <TouchableOpacity style={styles.removeImageButton} onPress={() => setImageUri(null)}>
                  <Ionicons name="close-circle" size={32} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.imagePlaceholder} onPress={showImagePickerOptions}>
                <Ionicons name="camera-outline" size={48} color="#9ca3af" />
                <Text style={styles.imagePlaceholderText}>Tap to add image</Text>
              </TouchableOpacity>
            )}
            {!imageUri && (
              <Button
                mode="outlined"
                onPress={showImagePickerOptions}
                icon="camera"
                style={styles.uploadButton}
              >
                Upload Image
              </Button>
            )}
          </Surface>

          <Surface style={styles.section}>
            <Text style={styles.sectionTitle}>Dietary Information</Text>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Vegetarian</Text>
              <Switch
                value={formData.isVegetarian}
                onValueChange={(value) => setFormData({ ...formData, isVegetarian: value })}
              />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Vegan</Text>
              <Switch
                value={formData.isVegan}
                onValueChange={(value) => setFormData({ ...formData, isVegan: value })}
              />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Gluten Free</Text>
              <Switch
                value={formData.isGlutenFree}
                onValueChange={(value) => setFormData({ ...formData, isGlutenFree: value })}
              />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Non-Veg</Text>
              <Switch
                value={formData.isNonVeg}
                onValueChange={(value) => setFormData({ ...formData, isNonVeg: value })}
              />
            </View>
          </Surface>

          <Surface style={styles.section}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Available for ordering</Text>
              <Switch
                value={formData.isAvailable}
                onValueChange={(value) => setFormData({ ...formData, isAvailable: value })}
              />
            </View>
          </Surface>

          <Surface style={styles.section}>
            <CustomizationBuilder
              value={formData.customizationOptions}
              onChange={(customizations) =>
                setFormData({ ...formData, customizationOptions: customizations })
              }
            />
          </Surface>

          <Surface style={styles.section}>
            <AddOnsSelector
              value={formData.addOnIds || []}
              onChange={(addOnIds) => setFormData({ ...formData, addOnIds })}
              addOns={addOns}
            />
          </Surface>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            mode="outlined"
            onPress={onClose}
            disabled={isSubmitting}
            style={styles.footerButton}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={[styles.footerButton, styles.submitButton]}
          >
            {item ? 'Update Item' : 'Add Item'}
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  input: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  halfInput: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    marginBottom: 12,
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  uploadButton: {
    marginTop: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  switchLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerButton: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#6366f1',
  },
});

export default MenuItemFormModal;

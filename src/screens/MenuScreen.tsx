import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { Surface, Button, Chip, Badge, ActivityIndicator, FAB, Searchbar } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useMenuPageData } from '../hooks/useMenuPageData';
import { MenuItem } from '../types';
import MenuItemFormModal from '../components/menu/MenuItemFormModal';
import { formatCurrency } from '../utils/format';

const MenuScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDietary, setSelectedDietary] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | undefined>();

  const {
    categories,
    items,
    addOns,
    isLoading,
    refetch,
    updateItem,
    deleteItem,
    toggleAvailability,
  } = useMenuPageData();

  // Filter items based on search, category, and dietary preferences
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === '' || item.categoryId === selectedCategory;

      const matchesDietary =
        selectedDietary === '' ||
        (selectedDietary === 'vegetarian' && item.isVegetarian) ||
        (selectedDietary === 'vegan' && item.isVegan) ||
        (selectedDietary === 'glutenfree' && item.isGlutenFree) ||
        (selectedDietary === 'nonveg' && item.isNonVeg);

      return matchesSearch && matchesCategory && matchesDietary;
    });
  }, [items, searchQuery, selectedCategory, selectedDietary]);

  const handleAddItem = () => {
    setSelectedItem(undefined);
    setIsFormOpen(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleDeleteItem = (item: MenuItem) => {
    Alert.alert(
      'Delete Menu Item',
      `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItem(item._id);
            } catch (error) {
              console.error('Error deleting item:', error);
            }
          },
        },
      ]
    );
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await toggleAvailability(item._id);
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  const getCategoryName = (categoryId: string | any) => {
    if (typeof categoryId === 'object' && categoryId?.name) {
      return categoryId.name;
    }
    const category = categories.find((c) => c._id === categoryId);
    return category?.name || 'Unknown';
  };

  const getImageUrl = (item: MenuItem): string | null => {
    const imagePath = item.images?.original || item.image;
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
    return `${baseUrl}${imagePath}`;
  };

  const renderMenuItem = ({ item }: { item: MenuItem }) => {
    const imageUrl = getImageUrl(item);

    return (
      <Surface style={styles.menuCard} elevation={1}>
        <TouchableOpacity onPress={() => handleEditItem(item)} style={styles.cardContent}>
          <View style={styles.cardHeader}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.itemImage} />
            ) : (
              <View style={styles.noImage}>
                <Ionicons name="image-outline" size={32} color="#999" />
              </View>
            )}

            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.itemDescription} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.badgeContainer}>
                <Chip
                  mode="outlined"
                  compact
                  style={styles.categoryChip}
                  textStyle={styles.chipText}
                >
                  {getCategoryName(item.categoryId)}
                </Chip>
                {item.isVegetarian && (
                  <Chip
                    mode="flat"
                    compact
                    style={[styles.dietaryChip, { backgroundColor: '#22c55e20' }]}
                    textStyle={[styles.chipText, { color: '#22c55e' }]}
                  >
                    Veg
                  </Chip>
                )}
                {item.isVegan && (
                  <Chip
                    mode="flat"
                    compact
                    style={[styles.dietaryChip, { backgroundColor: '#22c55e20' }]}
                    textStyle={[styles.chipText, { color: '#22c55e' }]}
                  >
                    Vegan
                  </Chip>
                )}
                {item.isGlutenFree && (
                  <Chip
                    mode="flat"
                    compact
                    style={[styles.dietaryChip, { backgroundColor: '#3b82f620' }]}
                    textStyle={[styles.chipText, { color: '#3b82f6' }]}
                  >
                    GF
                  </Chip>
                )}
                {item.isNonVeg && (
                  <Chip
                    mode="flat"
                    compact
                    style={[styles.dietaryChip, { backgroundColor: '#ef444420' }]}
                    textStyle={[styles.chipText, { color: '#ef4444' }]}
                  >
                    Non-Veg
                  </Chip>
                )}
              </View>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{formatCurrency(item.price)}</Text>
              {item.originalPrice && (
                <Text style={styles.originalPrice}>{formatCurrency(item.originalPrice)}</Text>
              )}
            </View>

            <View style={styles.statusContainer}>
              <Chip
                mode="flat"
                compact
                style={[
                  styles.statusChip,
                  item.isAvailable
                    ? { backgroundColor: '#22c55e20' }
                    : { backgroundColor: '#ef444420' },
                ]}
                textStyle={[
                  styles.chipText,
                  { color: item.isAvailable ? '#22c55e' : '#ef4444' },
                ]}
              >
                {item.isAvailable ? 'Available' : 'Unavailable'}
              </Chip>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.toggleButton]}
              onPress={() => handleToggleAvailability(item)}
            >
              <Ionicons
                name={item.isAvailable ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color={item.isAvailable ? '#22c55e' : '#ef4444'}
              />
              <Text style={styles.actionButtonText}>Toggle</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => handleEditItem(item)}
            >
              <Ionicons name="create-outline" size={20} color="#3b82f6" />
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteItem(item)}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
              <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Surface>
    );
  };

  const dietaryOptions = [
    { value: '', label: 'All' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'glutenfree', label: 'Gluten Free' },
    { value: 'nonveg', label: 'Non-Veg' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu Management</Text>
        <Text style={styles.headerSubtitle}>Manage your restaurant's menu items</Text>
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search menu items..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedCategory === '' && styles.filterChipActive,
              ]}
              onPress={() => setSelectedCategory('')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedCategory === '' && styles.filterChipTextActive,
                ]}
              >
                All Categories
              </Text>
            </TouchableOpacity>

            {categories.map((cat) => (
              <TouchableOpacity
                key={cat._id}
                style={[
                  styles.filterChip,
                  selectedCategory === cat._id && styles.filterChipActive,
                ]}
                onPress={() => setSelectedCategory(cat._id)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedCategory === cat._id && styles.filterChipTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dietaryFilters}>
          <View style={styles.filterRow}>
            {dietaryOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterChip,
                  selectedDietary === option.value && styles.filterChipActive,
                ]}
                onPress={() => setSelectedDietary(option.value)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedDietary === option.value && styles.filterChipTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderMenuItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="restaurant-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No menu items found</Text>
              <Text style={styles.emptySubtext}>Tap the + button to add your first menu item</Text>
            </View>
          }
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddItem}
        color="#fff"
      />

      <MenuItemFormModal
        visible={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        item={selectedItem}
        categories={categories}
        addOns={addOns}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchBar: {
    backgroundColor: '#f9fafb',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  dietaryFilters: {
    marginTop: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterChipActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  filterChipText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  menuCard: {
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginBottom: 12,
  },
  cardContent: {
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  noImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  categoryChip: {
    height: 24,
  },
  dietaryChip: {
    height: 24,
  },
  chipText: {
    fontSize: 11,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  originalPrice: {
    fontSize: 14,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  statusContainer: {
    flexDirection: 'row',
  },
  statusChip: {
    height: 24,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  toggleButton: {
    backgroundColor: '#f9fafb',
  },
  editButton: {
    backgroundColor: '#eff6ff',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4b5563',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#6366f1',
  },
});

export default MenuScreen;

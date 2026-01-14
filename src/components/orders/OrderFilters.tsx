import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Searchbar, Menu, Button, Chip } from 'react-native-paper';
import { OrderFilters as OrderFiltersType, OrderStatus, Table } from '../../types';
import { ORDER_STATUS_CONFIG } from '../../utils/constants';
import DateTimePicker from '@react-native-community/datetimepicker';

interface OrderFiltersProps {
  onFiltersChange: (filters: OrderFiltersType) => void;
  initialFilters?: OrderFiltersType;
  tables?: Table[];
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
  onFiltersChange,
  initialFilters = {},
  tables = [],
}) => {
  const [filters, setFilters] = useState<OrderFiltersType>(initialFilters);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const handleFilterChange = (key: keyof OrderFiltersType, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSearchChange = (search: string) => {
    handleFilterChange('search', search || undefined);
  };

  const handleClearFilters = () => {
    const clearedFilters: OrderFiltersType = {
      search: undefined,
      status: undefined,
      startDate: undefined,
      endDate: undefined,
      tableId: undefined,
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = filters.status || filters.startDate || filters.endDate || filters.tableId;

  const selectedTable = tables.find(t => t._id === filters.tableId);
  const statusLabel = filters.status ? ORDER_STATUS_CONFIG[filters.status].label : 'All Status';

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search by order number, table..."
        onChangeText={handleSearchChange}
        value={filters.search || ''}
        style={styles.searchBar}
      />

      <View style={styles.filterRow}>
        <Menu
          visible={showStatusMenu}
          onDismiss={() => setShowStatusMenu(false)}
          anchor={
            <TouchableOpacity onPress={() => setShowStatusMenu(true)}>
              <Chip icon="filter" style={styles.chip}>
                {statusLabel}
              </Chip>
            </TouchableOpacity>
          }
        >
          <Menu.Item
            onPress={() => {
              handleFilterChange('status', undefined);
              setShowStatusMenu(false);
            }}
            title="All Status"
          />
          {Object.entries(ORDER_STATUS_CONFIG).map(([value, config]) => (
            <Menu.Item
              key={value}
              onPress={() => {
                handleFilterChange('status', value as OrderStatus);
                setShowStatusMenu(false);
              }}
              title={config.label}
            />
          ))}
        </Menu>

        {tables.length > 0 && (
          <Menu
            visible={showTableMenu}
            onDismiss={() => setShowTableMenu(false)}
            anchor={
              <TouchableOpacity onPress={() => setShowTableMenu(true)}>
                <Chip icon="table-furniture" style={styles.chip}>
                  {selectedTable ? `Table ${selectedTable.tableNumber}` : 'All Tables'}
                </Chip>
              </TouchableOpacity>
            }
          >
            <Menu.Item
              onPress={() => {
                handleFilterChange('tableId', undefined);
                setShowTableMenu(false);
              }}
              title="All Tables"
            />
            {tables.map((table) => (
              <Menu.Item
                key={table._id}
                onPress={() => {
                  handleFilterChange('tableId', table._id);
                  setShowTableMenu(false);
                }}
                title={`Table ${table.tableNumber}`}
              />
            ))}
          </Menu>
        )}

        <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
          <Chip icon="calendar" style={styles.chip}>
            {filters.startDate ? new Date(filters.startDate).toLocaleDateString() : 'Start Date'}
          </Chip>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
          <Chip icon="calendar" style={styles.chip}>
            {filters.endDate ? new Date(filters.endDate).toLocaleDateString() : 'End Date'}
          </Chip>
        </TouchableOpacity>

        {hasActiveFilters && (
          <Button mode="text" onPress={handleClearFilters} compact>
            Clear
          </Button>
        )}
      </View>

      {showStartDatePicker && (
        <DateTimePicker
          value={filters.startDate ? new Date(filters.startDate) : new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowStartDatePicker(false);
            if (selectedDate) {
              handleFilterChange('startDate', selectedDate.toISOString().split('T')[0]);
            }
          }}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={filters.endDate ? new Date(filters.endDate) : new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowEndDatePicker(false);
            if (selectedDate) {
              handleFilterChange('endDate', selectedDate.toISOString().split('T')[0]);
            }
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchBar: {
    marginBottom: 12,
    elevation: 0,
    backgroundColor: '#f5f5f5',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
});

export default OrderFilters;

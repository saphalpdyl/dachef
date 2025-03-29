import { DetectionItem } from '@/hooks/useGemini';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions } from 'react-native';
import SectionLabel from './SectionLabel';

/**
 * MultiSelector Component
 * 
 * @param {Object} props
 * @param {Array} props.items - Array of items to select from
 * @param {Function} props.onSelectConfirm - Callback function that returns selected items
 * @param {String} props.itemLabelKey - Key to use for displaying item text (default: 'label')
 * @param {Boolean} props.allowMultiple - Allow multiple selection (default: true)
 * @param {Boolean} props.showSelectAll - Show select all button (default: true)
 * @param {Boolean} props.showRandomSelect - Show random select button (default: true)
 * @param {Number} props.randomCount - Number of random items to select (default: 1)
 * @param {Object} props.style - Additional styles for container
 * @param {Boolean} props.disabled - Disable all selection functionality (default: false)
 */
const MultiSelector = ({
  items = [],
  onSelectConfirm,
  itemLabelKey = 'label',
  allowMultiple = true,
  showSelectAll = true,
  showRandomSelect = true,
  randomCount = 1,
  style = {},
  disabled = false
}: {
  items: DetectionItem[],
  onSelectConfirm: (items: DetectionItem[]) => void,
  itemLabelKey?: string,
  allowMultiple?: boolean,
  showSelectAll?: boolean,
  showRandomSelect?: boolean,
  randomCount?: number,
  style?: any,
  disabled?: boolean,
}) => {
  const [selectedItems, setSelectedItems] = useState<DetectionItem[]>([]);
  
  // Reset selections if items change
  useEffect(() => {
    setSelectedItems([]);
  }, [items]);

  // Toggle item selection
  const toggleItemSelection = (item: DetectionItem) => {
    if (disabled) return;
    
    if (!allowMultiple) {
      setSelectedItems([item]);
      return;
    }

    if (isItemSelected(item)) {
      setSelectedItems(selectedItems.filter(selectedItem => 
        selectedItem[itemLabelKey] !== item[itemLabelKey]
      ));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  // Check if an item is selected
  const isItemSelected = (item: DetectionItem) => {
    return selectedItems.some(selectedItem => 
      selectedItem[itemLabelKey] === item[itemLabelKey]
    );
  };

  // Select all items
  const selectAll = () => {
    if (disabled) return;
    setSelectedItems([...items]);
  };

  // Deselect all items
  const deselectAll = () => {
    if (disabled) return;
    setSelectedItems([]);
  };

  // Select random items
  const selectRandom = () => {
    if (disabled || items.length === 0) return;
    
    const count = Math.min(randomCount, items.length);
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    const randomItems = shuffled.slice(0, count);
    
    setSelectedItems(allowMultiple ? randomItems : [randomItems[0]]);
  };

  // Handle confirmation
  const handleConfirm = () => {
    if (disabled) return;
    if (onSelectConfirm) {
      onSelectConfirm(selectedItems);
    }
  };

  // Render individual item
  const renderGridItem = (item: DetectionItem) => (
    <TouchableOpacity
      key={item.label}
      style={[
        styles.gridItem,
        isItemSelected(item) && styles.selectedItem,
        disabled && styles.disabledItem
      ]}
      onPress={() => toggleItemSelection(item)}
      disabled={disabled}
    >
      <Text style={[
        styles.itemText,
        isItemSelected(item) && styles.selectedItemText,
        disabled && styles.disabledItemText
      ]} numberOfLines={2} ellipsizeMode="tail">
        {item[itemLabelKey]}
      </Text>
    </TouchableOpacity>
  );

  // Render row with two items
  const renderRow = ({ item, index }: { item: DetectionItem, index: number }) => {
    // For odd-numbered items at the end, we need to handle them specially
    const isLastItemOdd = index === Math.floor(items.length / 2) && items.length % 2 !== 0;
    
    if (isLastItemOdd) {
      return (
        <View style={styles.row}>
          {renderGridItem(items[index * 2])}
          <View style={styles.emptyGridItem} />
        </View>
      );
    }
    
    return (
      <View style={styles.row}>
        {renderGridItem(items[index * 2])}
        {items[index * 2 + 1] && renderGridItem(items[index * 2 + 1])}
      </View>
    );
  };

  // Create pairs for the grid layout
  const pairs = Array.from({ length: Math.ceil(items.length / 2) }, (_, i) => ({
    id: i.toString(),
    index: i,
    label: items[i * 2]?.label || '',
  }));

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {selectedItems.length} selected
        </Text>
        
        <View style={styles.actionsContainer}>
          {showSelectAll && allowMultiple && (
            <TouchableOpacity 
              style={[styles.actionButton, disabled && styles.disabledButton]} 
              onPress={selectedItems.length === items.length ? deselectAll : selectAll}
              disabled={disabled}
            >
              <Text style={[styles.actionButtonText, disabled && styles.disabledButtonText]}>
                {selectedItems.length === items.length ? 'Deselect All' : 'Select All'}
              </Text>
            </TouchableOpacity>
          )}
          
          {showRandomSelect && (
            <TouchableOpacity 
              style={[styles.actionButton, disabled && styles.disabledButton]} 
              onPress={selectRandom}
              disabled={disabled}
            >
              <Text style={[styles.actionButtonText, disabled && styles.disabledButtonText]}>
                Random {allowMultiple && randomCount > 1 ? `(${randomCount})` : ''}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={pairs}
        renderItem={renderRow}
        keyExtractor={(item) => item.id}
        extraData={selectedItems}
        style={styles.list}
        nestedScrollEnabled={true}
        scrollEnabled={true}
      />

      <TouchableOpacity 
        style={[
          styles.confirmButton,
          (selectedItems.length === 0 || disabled) && styles.disabledButton
        ]} 
        onPress={handleConfirm}
        disabled={selectedItems.length === 0 || disabled}
      >
        <Text style={styles.confirmButtonText}>
          Search for recipes
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    paddingVertical: 16,
    margin: 8,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  actionButton: {
    backgroundColor: '#e9ecef',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginRight: 8,
  },
  actionButtonText: {
    color: '#495057',
    fontSize: 14,
  },
  list: {
    height: 500,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  gridItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dee2e6',
    width: '48%',  // Allow for some margin between items
    height: 60,    // Fixed height for consistency
    justifyContent: 'center',
  },
  emptyGridItem: {
    width: '48%',  // Same width as gridItem for alignment
  },
  selectedItem: {
    backgroundColor: '#4dabf7',
    borderColor: '#339af0',
  },
  disabledItem: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
  },
  itemText: {
    fontSize: 16,
    color: '#212529',
    textAlign: 'center',
  },
  selectedItemText: {
    color: '#fff',
  },
  disabledItemText: {
    color: '#adb5bd',
  },
  disabledButtonText: {
    color: '#adb5bd',
  },
  confirmButton: {
    backgroundColor: '#339af0',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: '#adb5bd',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MultiSelector;
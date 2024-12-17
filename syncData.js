import AsyncStorage from "@react-native-async-storage/async-storage";

const syncData = async () => {
  try {
    // Fetch lastSync timestamps from AsyncStorage
    const lastSync = JSON.parse(await AsyncStorage.getItem("lastSync")) || {};

    // Fetch updated data from the server
    const response = await fetch("http://192.168.8.101:8080/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lastSync }),
    });

    if (!response.ok) {
      throw new Error("Failed to sync data with the server");
    }

    const serverData = await response.json();

    // Defensive check to ensure serverData is an object
    if (typeof serverData !== 'object' || serverData === null) {
      throw new Error("Invalid server response format");
    }

    // Destructure with default empty objects
    const {
      profile = {},
      warehouseItems = [],
      projects = [],
      history = [],
      warehouseCategories = [],
      projectCategories = [],
      spots = [],
      updatedTimestamps = {},
    } = serverData;

    // Function to safely store data
    const safeStoreItem = async (key, data) => {
      try {
        // Check if data is a valid object or array before storing
        if (data && (Array.isArray(data) || Object.keys(data).length > 0)) {
          await AsyncStorage.setItem(key, JSON.stringify(data));
        }
      } catch (error) {
        console.error(`Error storing ${key}:`, error);
      }
    };

    // Function to merge items with unique identifier
    const mergeItems = async (storageKey, newItems, idField = 'id') => {
      if (!newItems || newItems.length === 0) return;
    
      try {
        const existingItemsJson = await AsyncStorage.getItem(storageKey);
        const existingItems = existingItemsJson ? JSON.parse(existingItemsJson) : [];
    
        const existingItemsMap = new Map(existingItems.map(item => [item[idField], item]));
    
        newItems.forEach(newItem => {
          const existingItem = existingItemsMap.get(newItem[idField]);
          
          if (existingItem) {
            Object.keys(newItem).forEach(key => {
              if (key === 'reserved') {
                // Ensure 'reserved' is always an array of valid reservations
                if (Array.isArray(newItem[key]) && newItem[key].length > 0) {
                  existingItem[key] = newItem[key].filter(reservation => 
                    reservation && 
                    reservation.itemId && 
                    reservation.count !== undefined
                  );
                } else {
                  // If no valid reservations, set to empty array
                  existingItem[key] = [];
                }
              } else if (key === 'photos') {
                // Similar handling for photos
                existingItem[key] = Array.isArray(newItem[key]) && newItem[key].length > 0
                  ? newItem[key]
                  : [];
              } else {
                existingItem[key] = newItem[key];
              }
            });
          } else {
            // For new items, ensure 'reserved' and 'photos' are arrays
            existingItemsMap.set(newItem[idField], {
              ...newItem,
              reserved: Array.isArray(newItem.reserved) ? 
                newItem.reserved.filter(r => r && r.itemId && r.count !== undefined) 
                : [],
              photos: Array.isArray(newItem.photos) ? newItem.photos : []
            });
          }
        });
    
        const mergedItems = Array.from(existingItemsMap.values());
        await AsyncStorage.setItem(storageKey, JSON.stringify(mergedItems));
      } catch (error) {
        console.error(`Error merging ${storageKey}:`, error);
      }
    };
    // Store or merge different types of data
    await mergeItems("profile", profile);
    await mergeItems("items", warehouseItems);
    await mergeItems("projects", projects);
    await mergeItems("userHistory", history);
    await mergeItems("categories", warehouseCategories);
    await mergeItems("categoriesProjects", projectCategories);
    await mergeItems("spots", spots);

    // Update last sync timestamps
    await safeStoreItem("lastSync", updatedTimestamps);

    console.log("Sync completed successfully with merged data.");
  } catch (error) {
    console.error("Error during sync:", error);
    // Optionally, you might want to throw the error again or handle it differently
    throw error;
  }
};

export default syncData;


const AsyncStorage = {
  getItem: async (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('localStorage not available:', error);
      return null;
    }
  },
  
  setItem: async (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
  },
  
  removeItem: async (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
  },
  
  clear: async () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
  },
  
  getAllKeys: async () => {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.warn('localStorage not available:', error);
      return [];
    }
  },
  
  multiGet: async (keys) => {
    try {
      return keys.map(key => [key, localStorage.getItem(key)]);
    } catch (error) {
      console.warn('localStorage not available:', error);
      return keys.map(key => [key, null]);
    }
  },
  
  multiSet: async (keyValuePairs) => {
    try {
      keyValuePairs.forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
  },
  
  multiRemove: async (keys) => {
    try {
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
  }
};

export default AsyncStorage;

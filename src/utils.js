/**
 * Get object from localStorage or empty Array
 * @param {*} key
 * @returns {(Object | Array)}
 */

export const getFromStorage = function(key) {
  return JSON.parse(localStorage.getItem(key) || "[]");
};

/**
* Set object by key to localStorage
* @param {Object} obj
* @param {String} key
*/

export const addToStorage = function (obj, key) {
  const storageData = getFromStorage(key);
  storageData.push(obj);
  localStorage.setItem(key, JSON.stringify(storageData));
};


/**
* Set object by key to localStorage
* @param {Object} obj
* @param {String} key
*/

export const updateStorage = function (obj, key) {
  localStorage.setItem(key, JSON.stringify(obj));
};

export const generateTestUser = function(User) {
 // localStorage.clear();
  const testUser = new User("test", "qwerty123", "user");
  const adminUser = new User("admin", "admin", "admin");
  User.save(testUser);
  User.save(adminUser);
};


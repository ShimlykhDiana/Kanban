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
/**
 * Clears localStorage, then creates a test user (login = "test", pwd = "qwerty123")
 */
export const generateTestUser = function(User) {
  localStorage.clear();
  const testUser = new User("test", "qwerty123");
  User.save(testUser);
};

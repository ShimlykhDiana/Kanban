export const getFromStorage = function(key) {
  return JSON.parse(localStorage.getItem(key) || "[]");
};

export const addToStorage = function (obj, key) {
  const storageData = getFromStorage(key);
  storageData.push(obj);
  localStorage.setItem(key, JSON.stringify(storageData));
};

export const updateStorage = function (obj, key) {
  localStorage.setItem(key, JSON.stringify(obj));
};

export const generateTestUser = function(User) {
    // localStorage.clear();
  const users = JSON.parse(localStorage.getItem("users")) || [];
  if (users.length === 0) {
    const testUser = new User("test", "qwerty123", "user");
    User.save(testUser);
  }
};
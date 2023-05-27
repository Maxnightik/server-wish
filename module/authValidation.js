/**
 * Проверяет, является ли логин допустимым
 * @param {string} login - логин для проверки
 * @returns {boolean} - true, если логин допустим, и false в противном случае
 */
export const isValidLogin = login => {
  const loginRegex = /^[a-zA-Z]+$/;
  return loginRegex.test(login);
};

/**
 * Проверяет, является ли пароль допустимым
 * @param {string} password - пароль для проверки
 * @returns {boolean} - true, если пароль допустим, и false в противном случае
 */
export const isValidPassword = password => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
  return passwordRegex.test(password);
};

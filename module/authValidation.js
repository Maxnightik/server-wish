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
  const passwordRegex =
    // eslint-disable-next-line
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!\"№;%:?*()_+])[a-zA-Z\d!\"№;%:?*()_+]{8,}$/;
  return passwordRegex.test(password);
};

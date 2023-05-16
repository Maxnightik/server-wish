export function isValidLogin(login) {
  const loginRegex = /^[a-zA-Z]+$/;
  return loginRegex.test(login);
}

export function isValidPassword(password) {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!\"№;%:?*()_+])[a-zA-Z\d!\"№;%:?*()_+]{8,}$/;
  return passwordRegex.test(password);
}

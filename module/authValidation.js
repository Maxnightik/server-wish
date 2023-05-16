export const isValidLogin = login => {
  const loginRegex = /^[a-zA-Z]+$/;
  return loginRegex.test(login);
};

export const isValidPassword = password => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!\"№;%:?*()_+])[a-zA-Z\d!\"№;%:?*()_+]{8,}$/;
  return passwordRegex.test(password);
};

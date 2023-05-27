import { v4 as uuidv4 } from 'uuid';
import { isValidLogin, isValidPassword } from './authValidation.js';
import { generateToken, readUsersFile, saveUsersFile } from './fileUtils.js';
import { DATA_FOLDER_AVATAR } from './checkFilesAndFoldersAvailability.js';
import { sendResponse } from './serviceResponse.js';

/**
 * Обрабатывает запрос на регистрацию, разбирая тело запроса на логин и пароль,
 * проверяя их валидность, проверяя, не существует ли уже такой логин
 * в базе данных пользователей, и, в случае успешной валидации,
 * создает нового пользователя с уникальным идентификатором,
 * аватаром по умолчанию и пустым объектом желаний.
 *
 * @param {Object} req - Объект запроса HTTP.
 * @param {Object} res - Объект ответа HTTP.
 * @return {Object} - Возвращает объект с данными нового пользователя.
 */
export const handleRegisterRequest = async (req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', async () => {
    const { login, password } = JSON.parse(body);

    if (!isValidLogin(login)) {
      sendResponse(res, 400, {
        message: 'Логин должен состоять только из латинских букв',
      });
      return;
    }
    if (!isValidPassword(password)) {
      sendResponse(res, 400, {
        message:
          // eslint-disable-next-line
          'Пароль должен содержать как минимум одну строчную букву, одну заглавную букву, одну цифру и иметь длину не менее 6 символов',
      });
      return;
    }

    const users = await readUsersFile();
    if (users.find(user => user.login.toLowerCase() === login.toLowerCase())) {
      sendResponse(res, 409, {
        message: 'Пользователь с таким логином уже существует',
      });
    } else {
      const newUser = {
        id: uuidv4(),
        login,
        wish: {},
        avatar: `${DATA_FOLDER_AVATAR}empty.png`,
        birthdate: '',
      };
      users.push({ ...newUser, password });
      await saveUsersFile(users);
      const token = generateToken(newUser.id);
      sendResponse(res, 201, { login: newUser.login, token });
    }
  });
};

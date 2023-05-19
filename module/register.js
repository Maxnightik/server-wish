import { v4 as uuidv4 } from 'uuid';
import { isValidLogin, isValidPassword } from './authValidation.js';
import { readUsersFile, saveUsersFile } from './fileUtils.js';
import { DATA_FOLDER_AVATAR } from './checkFilesAndFoldersAvailability.js';
import { sendResponse } from './serviceResponse.js';

/**
 * Обрабатывает запрос на регистрацию, разбирая тело запроса на учетные данные
 * для входа и пароль, проверяя их на валидность, чтение файла пользователей,
 * проверяя, занят ли логин, и либо отправляя ответ об ошибке,
 * либо создавая нового пользователя, сохраняя его в файле и отправляя
 * ответ об успехе.
 *
 * @param {Object} req - объект запроса
 * @param {Object} res - объект ответа
 * @return {Promise<void>} Promise, который разрешается, когда ответ отправлен
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
          'Пароль должен содержать как минимум одну строчную букву, одну заглавную букву, одну цифру, один специальный символ и иметь длину не менее 8 символов',
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
        password,
        wish: {},
        avatar: `${DATA_FOLDER_AVATAR}empty.jpg`,
        birthdate: '',
      };
      users.push(newUser);
      await saveUsersFile(users);
      sendResponse(res, 201, { message: 'User created successfully' });
    }
  });
};

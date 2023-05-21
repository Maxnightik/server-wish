import {
  readUsersFile,
  generateToken,
  getLoginFromToken,
} from './fileUtils.js';
import { sendResponse } from './serviceResponse.js';

/**
 * Обрабатывает запрос на вход в систему, разбирая тело запроса
 * на учетные данные для входаи пароль, чтение файла пользователей,
 * поиск пользователя с соответствующими учетными данными и либо отправку ответа
 * об ошибке, либо генерацию и отправку ответа с токеном.
 *
 * @param {Object} req - объект запроса
 * @param {Object} res - объект ответа
 * @return {Promise<void>} Promise, который разрешается, когда ответ отправлен
 */

export const handleLoginRequest = async (req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', async () => {
    const { login, password } = JSON.parse(body);
    const users = await readUsersFile();
    const user = users.find(
      user =>
        user.login.toLowerCase() === login.toLowerCase() &&
        user.password === password,
    );
    if (!user) {
      sendResponse(res, 401, { message: 'Invalid credentials' });
    } else {
      const token = generateToken(user.id);
      sendResponse(res, 200, { login: user.login, token });
    }
  });
};

export const handleLoginFromToken = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const login = await getLoginFromToken(token);
  if (!login) {
    sendResponse(res, 401, { message: 'Invalid credentials' });
  } else {
    sendResponse(res, 200, { login });
  }
};

import { readUsersFile } from './fileUtils.js';
import { sendResponse } from './serviceResponse.js';

/**
 * Обрабатывает запрос списка желаний, находя пользователя
 * в файле пользователей по его логину.
 *
 * Если пользователь найден, отправляет его объект пользователя клиенту
 * с удаленным полем пароля. Если пользователь не найден,
 * отправляет ответ с ошибкой 404.
 *
 * @param {Object} req - Объект запроса.
 * @param {Object} res - Объект ответа.
 */

export const handleUserRequest = async (req, res) => {
  const login = req.url.split('/')[2];
  const users = await readUsersFile();
  const user = users.find(
    user => user.login.toLowerCase() === login.toLowerCase(),
  );
  if (!user) {
    sendResponse(res, 404, { message: 'User not found' });
  } else {
    // eslint-disable-next-line
    const { password, ...userWithoutPassword } = user;
    sendResponse(res, 200, userWithoutPassword);
  }
};

import { readUsersFile, verifyToken } from './fileUtils.js';
import { sendResponse } from './serviceResponse.js';

/**
 * Находит пользователя по идентификатору в списке пользователей
 * @param {Array} users - список пользователей
 * @param {string} userId - идентификатор пользователя
 * @returns {Object|null} - найденный пользователь или null, если не найден
 */
const findUserById = (users, userId) => users.find(user => user.id === userId);

/**
 * Находит желание по идентификатору в списке желаний
 * @param {Object} wishList - список желаний
 * @param {string} wishId - идентификатор желания
 * @returns {Object|null} - найденное желание или null, если не найдено
 */
const findWishById = (wishList, wishId) => {
  const wishes = Object.values(wishList).flat();
  return wishes.find(wish => wish.id === wishId);
};

/**
 * Обрабатывает запрос на получение информации о желании
 * @param {Object} req - объект запроса
 * @param {Object} res - объект ответа
 */
export const handleGetWishRequest = async (req, res) => {
  try {
    const id = req.url.split('/')[2];
    const token = req.headers.authorization?.split(' ')[1];
    const userId = verifyToken(token).id;
    const users = await readUsersFile();
    const user = findUserById(users, userId);

    if (!user) {
      return sendResponse(res, 404, { message: 'User not found' });
    }

    const item = findWishById(user.wish, id);

    if (!item) {
      return sendResponse(res, 404, { message: 'Item not found' });
    }

    sendResponse(res, 200, item);
  } catch (err) {
    sendResponse(res, 401, { message: err.message });
  }
};

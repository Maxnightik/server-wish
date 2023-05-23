import { readUsersFile, saveUsersFile, verifyToken } from './fileUtils.js';
import { sendResponse } from './serviceResponse.js';

const deleteWish = async (userId, id) => {
  const users = await readUsersFile();
  const user = users.find(user => user.id === userId);
  if (!user) {
    throw new Error('User not found');
  }
  let wishDeleted = false;
  for (const category in user.wish) {
    const categoryWishList = user.wish[category];
    const wishIndex = categoryWishList.findIndex(wish => wish.id === id);
    if (wishIndex !== -1) {
      categoryWishList.splice(wishIndex, 1);
      wishDeleted = true;
    }
  }
  if (wishDeleted) {
    await saveUsersFile(users);
  } else {
    throw new Error('Wish not found');
  }
};

export const handleDeleteWishRequest = async (req, res) => {
  const id = req.url.split('/')[2];
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const { id: userId } = verifyToken(token);
    try {
      await deleteWish(userId, id);
      sendResponse(res, 204, null);
    } catch (err) {
      sendResponse(res, 404, { message: err.message });
    }
  } catch (err) {
    sendResponse(res, 401, { message: err.message });
  }
};

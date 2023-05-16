import { readUsersFile, saveUsersFile, verifyToken } from './fileUtils.js';

export async function handleUpdateWishRequest(req, res) {
  const id = req.url.split('/')[2];
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const { id: userId } = verifyToken(token);
    const users = await readUsersFile();
    const user = users.find(user => user.id === userId);
    if (!user) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User not found' }));
    } else {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', async () => {
        const { category, ...updatedWish } = JSON.parse(body);
        const wishToUpdate = user.wish[category].find(item => item.id === id);
        if (!wishToUpdate) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Wish not found' }));
        } else {
          Object.assign(wishToUpdate, updatedWish);
          await saveUsersFile(users);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Wish updated successfully' }));
        }
      });
    }
  } catch (err) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: err.message }));
  }
}

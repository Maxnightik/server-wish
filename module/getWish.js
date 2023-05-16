import { readUsersFile, verifyToken } from './fileUtils.js';

export async function handleGetWishRequest(req, res) {
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
      const wish = user.wish;
      const item = Object.keys(wish)
        .map(category => wish[category])
        .reduce((acc, cur) => acc.concat(cur), [])
        .find(item => item.id === id);
      if (!item) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Item not found' }));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(item));
      }
    }
  } catch (err) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: err.message }));
  }
}

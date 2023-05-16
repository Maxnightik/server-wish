import { readUsersFile } from './fileUtils.js';

export async function handleWishlistRequest(req, res) {
  const login = req.url.split('/')[2];
  const users = await readUsersFile();
  const user = users.find(
    user => user.login.toLowerCase() === login.toLowerCase(),
  );
  if (!user) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'User not found' }));
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(user.wish));
  }
}

import { readUsersFile } from './fileUtils.js';

export const handleWishlistRequest = async (req, res) => {
  const login = req.url.split('/')[2];
  const users = await readUsersFile();
  const user = users.find(
    user => user.login.toLowerCase() === login.toLowerCase(),
  );
  if (!user) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'User not found' }));
  } else {
    // eslint-disable-next-line
    const { password, ...userWithoutPassword } = user;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(userWithoutPassword));
  }
};

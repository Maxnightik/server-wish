import { readUsersFile, generateToken } from './fileUtils.js';

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
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Invalid credentials' }));
    } else {
      const token = generateToken(user.id);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ token }));
    }
  });
};

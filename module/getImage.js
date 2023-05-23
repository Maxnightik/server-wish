import fs from 'fs';

/**
 * Обрабатывает запрос на получение картинки по пути.
 *
 * @param {Object} req - Объект запроса HTTP.
 * @param {Object} res - Объект ответа HTTP.
 * @return {void} - Функция ничего не возвращает.
 */
export const handleImageRequest = (req, res) => {
  const imageStream = fs.createReadStream(`./${req.url}`);

  imageStream.on('error', err => {
    console.error(err);
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Image not found' }));
  });

  res.setHeader('Content-Type', 'image/jpeg');
  imageStream.pipe(res);
};

export const handleAvatarRequest = (req, res) => {

  const imageStream = fs.createReadStream(`./${req.url}`);

  imageStream.on('error', err => {
    console.error(err);
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Avatar not found' }));
  });

  res.setHeader('Content-Type', 'image/jpeg');
  imageStream.pipe(res);
};

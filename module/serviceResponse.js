/**
 * Отправляет ответ клиенту
 * @param {Object} res - объект ответа
 * @param {number} statusCode - статусный код
 * @param {Object} data - данные для отправки в формате JSON
 */
export const sendResponse = (res, statusCode, data) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

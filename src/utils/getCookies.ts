import { Socket } from 'socket.io';

interface ReturnType {
  [key: string]: string | undefined;
}

const getCookies = (socket: Socket): ReturnType => {
  const cookiesArray = (socket?.handshake?.headers?.cookie || '').split(';');
  const cookiesObj: ReturnType = {};
  cookiesArray.forEach((cookie) => {
    const [key, value] = cookie.split('=');
    const trimmedKey = (key || '').trim();
    const trimmedValue = (value || '').trim();
    if (trimmedKey) {
      cookiesObj[trimmedKey] = trimmedValue;
    }
  });
  return cookiesObj;
};

export default getCookies;

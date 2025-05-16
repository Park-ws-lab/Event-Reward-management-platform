import { AuthMiddleware } from './auth.middleware';

describe('EventsProxyMiddleware', () => {
  it('should be defined', () => {
    expect(new AuthMiddleware()).toBeDefined();
  });
});

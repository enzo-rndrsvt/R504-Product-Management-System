import { renderHook, act, waitFor } from '@testing-library/react';
import axios from 'axios';
import { useApi } from '../../hooks/useApi';

jest.mock('axios');

describe('useApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useApi());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.request).toBe('function');
    expect(typeof result.current.get).toBe('function');
    expect(typeof result.current.post).toBe('function');
    expect(typeof result.current.put).toBe('function');
    expect(typeof result.current.delete).toBe('function');
  });

  describe('request', () => {
    it('should make a successful request without token', async () => {
      const mockData = { id: 1, name: 'Test' };
      axios.mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useApi());

      let response;
      await act(async () => {
        response = await result.current.request({
          method: 'GET',
          url: '/test'
        });
      });

      expect(response).toEqual(mockData);
      expect(axios).toHaveBeenCalledWith({
        method: 'GET',
        url: '/test',
        headers: {
          Authorization: undefined
        }
      });
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should make a successful request with token', async () => {
      const mockData = { id: 1, name: 'Test' };
      const token = 'test-token';
      localStorage.setItem('token', token);
      axios.mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useApi());

      let response;
      await act(async () => {
        response = await result.current.request({
          method: 'GET',
          url: '/test'
        });
      });

      expect(response).toEqual(mockData);
      expect(axios).toHaveBeenCalledWith({
        method: 'GET',
        url: '/test',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    });

    it('should set loading to true during request', async () => {
      const mockData = { id: 1, name: 'Test' };
      axios.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ data: mockData }), 100);
          })
      );

      const { result } = renderHook(() => useApi());

      let requestPromise;
      act(() => {
        requestPromise = result.current.request({
          method: 'GET',
          url: '/test'
        });
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      await act(async () => {
        await requestPromise;
      });

      expect(result.current.loading).toBe(false);
    });

    it('should handle error with error message from response', async () => {
      const errorMessage = 'Something went wrong';
      axios.mockRejectedValueOnce({
        response: {
          data: {
            error: errorMessage
          }
        }
      });

      const { result } = renderHook(() => useApi());

      await act(async () => {
        try {
          await result.current.request({
            method: 'GET',
            url: '/test'
          });
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.loading).toBe(false);
    });

    it('should handle error without error message from response', async () => {
      axios.mockRejectedValueOnce({
        response: {
          data: {}
        }
      });

      const { result } = renderHook(() => useApi());

      await act(async () => {
        try {
          await result.current.request({
            method: 'GET',
            url: '/test'
          });
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('An error occurred');
      expect(result.current.loading).toBe(false);
    });

    it('should handle network error', async () => {
      axios.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useApi());

      await act(async () => {
        try {
          await result.current.request({
            method: 'GET',
            url: '/test'
          });
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('An error occurred');
      expect(result.current.loading).toBe(false);
    });

    it('should preserve custom headers in request', async () => {
      const mockData = { id: 1, name: 'Test' };
      axios.mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useApi());

      await act(async () => {
        await result.current.request({
          method: 'POST',
          url: '/test',
          headers: {
            'Content-Type': 'application/json',
            'Custom-Header': 'custom-value'
          }
        });
      });

      expect(axios).toHaveBeenCalledWith({
        method: 'POST',
        url: '/test',
        headers: {
          'Content-Type': 'application/json',
          'Custom-Header': 'custom-value',
          Authorization: undefined
        }
      });
    });
  });

  describe('get', () => {
    it('should make a GET request', async () => {
      const mockData = { id: 1, name: 'Test' };
      axios.mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useApi());

      let response;
      await act(async () => {
        response = await result.current.get('/test');
      });

      expect(response).toEqual(mockData);
      expect(axios).toHaveBeenCalledWith({
        method: 'GET',
        url: '/test',
        headers: {
          Authorization: undefined
        }
      });
    });
  });

  describe('post', () => {
    it('should make a POST request with data', async () => {
      const mockData = { id: 1, name: 'Test' };
      const postData = { name: 'Test' };
      axios.mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useApi());

      let response;
      await act(async () => {
        response = await result.current.post('/test', postData);
      });

      expect(response).toEqual(mockData);
      expect(axios).toHaveBeenCalledWith({
        method: 'POST',
        url: '/test',
        data: postData,
        headers: {
          Authorization: undefined
        }
      });
    });
  });

  describe('put', () => {
    it('should make a PUT request with data', async () => {
      const mockData = { id: 1, name: 'Updated' };
      const putData = { name: 'Updated' };
      axios.mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useApi());

      let response;
      await act(async () => {
        response = await result.current.put('/test/1', putData);
      });

      expect(response).toEqual(mockData);
      expect(axios).toHaveBeenCalledWith({
        method: 'PUT',
        url: '/test/1',
        data: putData,
        headers: {
          Authorization: undefined
        }
      });
    });
  });

  describe('delete', () => {
    it('should make a DELETE request', async () => {
      const mockData = { success: true };
      axios.mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useApi());

      let response;
      await act(async () => {
        response = await result.current.delete('/test/1');
      });

      expect(response).toEqual(mockData);
      expect(axios).toHaveBeenCalledWith({
        method: 'DELETE',
        url: '/test/1',
        headers: {
          Authorization: undefined
        }
      });
    });
  });

  it('should reset error on new request', async () => {
    axios.mockRejectedValueOnce({
      response: { data: { error: 'First error' } }
    });

    const { result } = renderHook(() => useApi());

    // First request with error
    await act(async () => {
      try {
        await result.current.get('/test');
      } catch {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe('First error');

    // Second successful request
    axios.mockResolvedValueOnce({ data: { success: true } });
    await act(async () => {
      await result.current.get('/test2');
    });

    expect(result.current.error).toBe(null);
  });
});

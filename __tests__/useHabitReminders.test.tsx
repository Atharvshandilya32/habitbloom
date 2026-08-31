import { renderHook, act } from '@testing-library/react';
import { useHabitReminders } from '../lib/useHabitReminders';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock Firebase
vi.mock('../lib/firebase', () => ({
  messaging: {},
  firebaseConfig: {},
  database: {},
  auth: { currentUser: { uid: 'user123' } },
}));
vi.mock('firebase/messaging', () => ({
  getToken: vi.fn(),
}));
vi.mock('firebase/database', () => ({
  ref: vi.fn(),
  set: vi.fn(),
}));

describe('useHabitReminders', () => {
  let originalNotification: any;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    Object.defineProperty(navigator, 'serviceWorker', {
      value: { register: vi.fn().mockResolvedValue({}) },
      configurable: true,
    });

    originalNotification = global.Notification;
    const mockNotification = vi.fn();
    (mockNotification as any).permission = 'default';
    (mockNotification as any).requestPermission = vi.fn().mockResolvedValue('granted');
    global.Notification = mockNotification as any;
  });

  afterEach(() => {
    global.Notification = originalNotification;
    vi.useRealTimers();
  });

  it('should initialize with default config', () => {
    const { result } = renderHook(() => useHabitReminders([], {}));
    expect(result.current.config).toEqual({
      globalEnabled: false,
      globalTime: '20:00',
      soundEnabled: true,
    });
  });

  it('should update config and save to localStorage', () => {
    const { result } = renderHook(() => useHabitReminders([], {}));
    act(() => {
      result.current.updateConfig({ globalEnabled: true });
    });
    expect(result.current.config.globalEnabled).toBe(true);
    expect(JSON.parse(localStorage.getItem('habitbloom_reminder_config') || '{}')).toEqual({
      globalEnabled: true,
      globalTime: '20:00',
      soundEnabled: true,
    });
  });

  it('should request permission', async () => {
    const { result } = renderHook(() => useHabitReminders([], {}));

    let res = false;
    await act(async () => {
      res = await result.current.requestPermission();
    });

    expect(res).toBe(true);
    expect(result.current.permission).toBe('granted');
    expect(result.current.config.globalEnabled).toBe(true);
  });

  it('should not request permission if not supported', async () => {
     delete (global as any).Notification;
     const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
     const { result } = renderHook(() => useHabitReminders([], {}));

     let res = true;
     await act(async () => {
       res = await result.current.requestPermission();
     });

     expect(res).toBe(false);
     expect(alertMock).toHaveBeenCalledWith('Browser notifications are not supported by your browser.');
     alertMock.mockRestore();
  });

  it('should send notification if granted', () => {
     (global.Notification as any).permission = 'granted';
     const { result } = renderHook(() => useHabitReminders([], {}));

     act(() => {
         result.current.sendNotification('Test Title', { body: 'Test Body' });
     });

     expect(global.Notification).toHaveBeenCalledWith('Test Title', expect.objectContaining({ body: 'Test Body' }));
  });

  it('should trigger reminders at the correct time', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2023, 10, 1, 20, 0, 0)); // 20:00

    (global.Notification as any).permission = 'granted';
    localStorage.setItem('habitbloom_reminder_config', JSON.stringify({
      globalEnabled: true,
      globalTime: '20:00',
      soundEnabled: false,
    }));

    const mockHabit = { id: 'h1', name: 'Drink Water', emoji: '💧', goal: 1, reminderEnabled: true, reminderTime: '20:00', createdAt: '2023-01-01' };

    const { result } = renderHook(() => useHabitReminders([mockHabit], {}));

    act(() => {
      // trigger interval
      vi.advanceTimersByTime(30000);
    });

    expect(global.Notification).toHaveBeenCalled();

    vi.useRealTimers();
  });
});

import { expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Mock HTMLCanvasElement.getContext because the cinematic canvas tries to render
HTMLCanvasElement.prototype.getContext = vi.fn() as any;

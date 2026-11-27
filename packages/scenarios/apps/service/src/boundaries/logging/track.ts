import { record } from '@/vendor/analytics-sdk';
export function track(event: string): void {
  record(event, '[masked]');
}

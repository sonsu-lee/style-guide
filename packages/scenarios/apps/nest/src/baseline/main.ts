import { startOrderService } from './app';
async function bootstrap(): Promise<void> {
  await startOrderService();
}
void bootstrap();

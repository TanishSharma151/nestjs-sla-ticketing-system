import { Test, TestingModule } from '@nestjs/testing';
import { SlaMonitorService } from './sla-monitor.service';

describe('SlaMonitorService', () => {
  let service: SlaMonitorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SlaMonitorService],
    }).compile();

    service = module.get<SlaMonitorService>(SlaMonitorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

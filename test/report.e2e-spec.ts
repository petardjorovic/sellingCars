import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Report routes (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should reject unauthenticated user', async () => {
    const res = await request(app.getHttpServer()).post('/report').send({
      make: 'Opel',
      model: 'Zafira',
      year: 2010,
      mileage: 270000,
      lng: 45,
      lat: 45,
      price: 4000,
    });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Forbidden resource');
  });
});

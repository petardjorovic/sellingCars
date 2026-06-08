import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import request from 'supertest';

describe('UserRoutes (e2e)', () => {
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

  it('gets user by id', async () => {
    const testUser = {
      email: 'test@email.com',
      password: '12345',
    };

    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send(testUser);

    const cookie = res.get('Set-Cookie');
    const { id } = res.body;

    const userRes = await request(app.getHttpServer())
      .get(`/auth/${id}`)
      .set('Cookie', cookie)
      .expect(200);

    expect(userRes.body.id).toEqual(id);
    expect(userRes.body.email).toEqual(testUser.email);
  });

  it('fails when id is not a number', async () => {
    const testUser = {
      email: 'test@email.com',
      password: '12345',
    };

    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send(testUser);

    const cookie = res.get('Set-Cookie');

    await request(app.getHttpServer())
      .get(`/auth/abc`)
      .set('Cookie', cookie)
      .expect(400);
  });

  it('updates user', async () => {
    const testUser = {
      email: 'test@email.com',
      password: '12345',
    };

    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send(testUser);

    const { id } = res.body;
    const cookie = res.get('Set-Cookie');

    const userRes = await request(app.getHttpServer())
      .patch(`/auth/${id}`)
      .set('Cookie', cookie)
      .send({ email: 'updated@email.com' })
      .expect(200);

    expect(userRes.body.id).toEqual(id);
    expect(userRes.body.email).toEqual('updated@email.com');
  });

  it('deletes user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'test@email.com', password: '12345' });

    const { id } = res.body;
    const cookie = res.get('Set-Cookie');

    await request(app.getHttpServer())
      .delete(`/auth/${id}`)
      .set('Cookie', cookie)
      .expect(200);

    const { body } = await request(app.getHttpServer())
      .get(`/auth/${id}`)
      .set('Cookie', cookie)
      .expect(200);

    expect(body).toEqual({});
  });

  it('fails when not authenticated', async () => {
    await request(app.getHttpServer()).get('/auth/1').expect(403);
  });
});

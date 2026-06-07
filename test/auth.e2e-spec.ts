import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Authentication System (e2e)', () => {
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

  it('handles a signup request', () => {
    const testEmail = 'test111@email.com';
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: testEmail, password: '123456' })
      .expect(201)
      .then((res) => {
        const { id, email } = res.body;
        expect(id).toBeDefined();
        expect(email).toEqual(testEmail);
      });
  });

  it('fails signup when email already exists', async () => {
    const testUser = {
      email: 'test111111@email.com',
      password: '123456',
    };

    await request(app.getHttpServer())
      .post('/auth/signup')
      .send(testUser)
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/signup')
      .send(testUser)
      .expect(400);
  });

  it('signup as a new user then get currently logged in user', async () => {
    const testUser = {
      email: 'test12345@email.com',
      password: '123456',
    };
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send(testUser)
      .expect(201);

    const cookie = res.get('Set-Cookie');

    const { body } = await request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Cookie', cookie)
      .expect(200);

    expect(body.email).toEqual(testUser.email);
  });

  it('returns 403 when not logged in', async () => {
    return request(app.getHttpServer()).get('/auth/whoami').expect(403);
  });

  it('signs in with valid credentials', async () => {
    const testUser = {
      email: 'test123456@email.com',
      password: '123456',
    };

    await request(app.getHttpServer())
      .post('/auth/signup')
      .send(testUser)
      .expect(201);

    const { body } = await request(app.getHttpServer())
      .post('/auth/signin')
      .send(testUser)
      .expect(200);

    expect(body.id).toBeDefined();
    expect(body.email).toEqual(testUser.email);
  });

  it('fails signin with invalid password', async () => {
    const testUser = {
      email: 'test999@email.com',
      password: '123456',
    };

    await request(app.getHttpServer())
      .post('/auth/signup')
      .send(testUser)
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email: testUser.email,
        password: 'wrong',
      })
      .expect(400);
  });

  it('fails signin with invalid email', async () => {
    const testUser = {
      email: 'test8888@email.com',
      password: '123456',
    };

    await request(app.getHttpServer())
      .post('/auth/signup')
      .send(testUser)
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email: 'wrong@email.com',
        password: testUser.password,
      })
      .expect(404);
  });

  it('clears session after signout', async () => {
    const testUser = {
      email: 'test2222@email.com',
      password: '123456',
    };
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send(testUser)
      .expect(201);

    const cookie = res.get('Set-Cookie');

    await request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Cookie', cookie)
      .expect(200);

    const res2 = await request(app.getHttpServer())
      .get('/auth/signout')
      .set('Cookie', cookie)
      .expect(200);

    const newCookie = res2.get('Set-Cookie');

    await request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Cookie', newCookie)
      .expect(403);
  });

  it('fails when email is invalid', async () => {
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'not-an-email', password: '123456' })
      .expect(400);
  });

  it('fails when password is too short', async () => {
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'test33333@email.com', password: '123' })
      .expect(400);
  });
});

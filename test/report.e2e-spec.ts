import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Report routes (e2e)', () => {
  let app: INestApplication<App>;

  const signup = async () => {
    const email = `${Math.random()}@email.com`;

    const res = await request(app.getHttpServer()).post('/auth/signup').send({
      email,
      password: '123456',
    });

    return res.get('Set-Cookie');
  };

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

  //* Create report
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

  it('should create report', async () => {
    const cookie = await signup();
    const report = {
      make: 'Opel',
      model: 'Zafira',
      year: 2010,
      mileage: 270000,
      lng: 45,
      lat: 45,
      price: 4000,
    };

    const res = await request(app.getHttpServer())
      .post('/report')
      .set('Cookie', cookie)
      .send(report)
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body).toMatchObject({
      make: report.make,
      model: report.model,
    });

    expect(res.body).not.toHaveProperty('user.password');
  });

  it('fails when dto is not valid', async () => {
    const cookie = await signup();
    const report = {
      make: 'Opel',
      model: 'Zafira',
      year: 2010,
      mileage: 270000,
      lng: 45,
      lat: 45,
    };

    await request(app.getHttpServer())
      .post('/report')
      .set('Cookie', cookie)
      .send(report)
      .expect(400);
  });

  //* Approve report
  it('rejects unauthenticated users', async () => {
    await request(app.getHttpServer())
      .patch('/report/1')
      .send({ approved: true })
      .expect(403);
  });

  it('should change approval status of a report', async () => {
    const cookie = await signup();
    const report = {
      make: 'Opel',
      model: 'Zafira',
      year: 2010,
      mileage: 270000,
      lng: 45,
      lat: 45,
      price: 4000,
    };

    const { body } = await request(app.getHttpServer())
      .post('/report')
      .set('Cookie', cookie)
      .send(report)
      .expect(201);

    const res = await request(app.getHttpServer())
      .patch(`/report/${body.id}`)
      .set('Cookie', cookie)
      .send({ approved: true })
      .expect(200);

    expect(res.body.approved).toBe(true);
  });

  it('fails if report does not exist', async () => {
    const cookie = await signup();

    await request(app.getHttpServer())
      .patch('/report/12345')
      .set('Cookie', cookie)
      .send({ approved: true })
      .expect(404);
  });

  it('fails if dto is not valid', async () => {
    const cookie = await signup();

    await request(app.getHttpServer())
      .patch('/report/abc')
      .set('Cookie', cookie)
      .send({ approved: 'yes' })
      .expect(400);
  });

  it('fails if report id is not valid', async () => {
    const cookie = await signup();

    await request(app.getHttpServer())
      .patch('/report/abc')
      .set('Cookie', cookie)
      .send({ approved: true })
      .expect(400);
  });

  //* Get estimate
  it('should get an estimate price for existing vehicle', async () => {
    const cookie = await signup();

    const report = {
      make: 'Opel',
      model: 'Zafira',
      year: 2010,
      mileage: 270000,
      lng: 45,
      lat: 45,
      price: 4000,
    };

    const res1 = await request(app.getHttpServer())
      .post('/report')
      .set('Cookie', cookie)
      .send(report);

    const res2 = await request(app.getHttpServer())
      .post('/report')
      .set('Cookie', cookie)
      .send({ ...report, year: 2009, price: 3000 });

    const res3 = await request(app.getHttpServer())
      .post('/report')
      .set('Cookie', cookie)
      .send({ ...report, year: 2010, price: 3500 });

    await request(app.getHttpServer())
      .patch(`/report/${res1.body.id}`)
      .set('Cookie', cookie)
      .send({ approved: true });

    await request(app.getHttpServer())
      .patch(`/report/${res2.body.id}`)
      .set('Cookie', cookie)
      .send({ approved: true });

    await request(app.getHttpServer())
      .patch(`/report/${res3.body.id}`)
      .set('Cookie', cookie)
      .send({ approved: true });

    const res = await request(app.getHttpServer())
      .get(
        `/report?make=Opel&model=Zafira&year=2009&mileage=275000&lng=45&lat=45`,
      )
      .set('Cookie', cookie)
      .expect(200);

    expect(res.body).toHaveProperty('price');
    expect(res.body.price).toEqual(3500);
  });

  it('fails if query string is not valid', async () => {
    const cookie = await signup();

    await request(app.getHttpServer())
      .get(
        `/report?make=Opel&model=Zafira&year=2009&mileage=275000&lng=abc&lat=45`,
      )
      .set('Cookie', cookie)
      .expect(400);
  });

  it('should ignore unapproved reports', async () => {
    const cookie = await signup();

    const report = {
      make: 'Opel',
      model: 'Zafira',
      year: 2010,
      mileage: 270000,
      lng: 45,
      lat: 45,
      price: 4000,
    };

    const res1 = await request(app.getHttpServer())
      .post('/report')
      .set('Cookie', cookie)
      .send(report);

    const res2 = await request(app.getHttpServer())
      .post('/report')
      .set('Cookie', cookie)
      .send({ ...report, year: 2009, price: 3000 });

    const res3 = await request(app.getHttpServer())
      .post('/report')
      .set('Cookie', cookie)
      .send({ ...report, year: 2010, price: 3500 });

    await request(app.getHttpServer())
      .patch(`/report/${res2.body.id}`)
      .set('Cookie', cookie)
      .send({ approved: true });

    await request(app.getHttpServer())
      .patch(`/report/${res3.body.id}`)
      .set('Cookie', cookie)
      .send({ approved: true });

    const res = await request(app.getHttpServer())
      .get(
        `/report?make=Opel&model=Zafira&year=2009&mileage=275000&lng=45&lat=45`,
      )
      .set('Cookie', cookie)
      .expect(200);

    expect(res.body).toHaveProperty('price');
    expect(res.body.price).toEqual(3250);
  });
});

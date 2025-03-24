/**
 * test/app.test.mjs
 * -----------------
 * Comprehensive integration tests for the Express routes using Mocha, Chai, and Supertest.
 *
 * Make sure your package.json has "type": "module" so that this file uses ESM syntax.
 */

import request from 'supertest';
import { expect } from 'chai';
import app from '../server.js';

describe('Integration Tests', () => {

    // --------------------------------------------------
    // Test Index / View Routes
    // --------------------------------------------------
    describe('Index Routes', () => {
        it('GET / should return the home page HTML containing "Danceright!"', async () => {
            const res = await request(app)
                .get('/')
                .expect(200)
                .expect('Content-Type', /html/);
            expect(res.text).to.include('Danceright!');
        });

        it('GET /login should return HTML containing "Login"', async () => {
            const res = await request(app)
                .get('/login')
                .expect(200)
                .expect('Content-Type', /html/);
            expect(res.text).to.include('Login');
        });

        it('GET /register should return HTML containing "Register"', async () => {
            const res = await request(app)
                .get('/register')
                .expect(200)
                .expect('Content-Type', /html/);
            expect(res.text).to.include('Register');
        });
    });

    // --------------------------------------------------
    // Test API Courses Endpoints
    // --------------------------------------------------
    describe('API Courses Endpoints', () => {
        let createdCourseId;

        it('GET /api/courses should return an array of courses (JSON)', async () => {
            const res = await request(app)
                .get('/api/courses')
                .set('Accept', 'application/json')
                .expect(200);
            expect(res.body).to.be.an('array');
        });

        it('POST /api/courses/add should add a new course and redirect to /dashboard', async () => {
            const res = await request(app)
                .post('/api/courses/add')
                .type('form')
                .send({
                    courseName: 'Test Course',
                    courseDescription: 'A test course description',
                    courseStartDate: '2025-04-01',
                    courseDuration: '4 weeks',
                    courseSchedule: 'Monday, Wednesday',
                    coursePrice: '100.50',
                    courseLocation: 'Test Location',
                    courseStartTime: '10:00',
                    courseEndTime: '12:00'
                })
                .expect(302);
            expect(res.header.location).to.equal('/dashboard');
        });

        it('GET /api/courses should contain the newly added course', async () => {
            const res = await request(app)
                .get('/api/courses')
                .set('Accept', 'application/json')
                .expect(200);
            const courses = res.body;
            const testCourse = courses.find(c => c.name === 'Test Course');
            expect(testCourse).to.exist;
            createdCourseId = testCourse._id; // Assuming nedb returns _id property.
        });

        it('POST /api/courses/edit should update the course and redirect to /dashboard', async () => {
            const res = await request(app)
                .post('/api/courses/edit')
                .type('form')
                .send({
                    courseId: createdCourseId,
                    courseName: 'Updated Test Course',
                    courseDescription: 'Updated description',
                    courseStartDate: '2025-04-02',
                    courseDuration: '5 weeks',
                    courseSchedule: 'Tuesday, Thursday',
                    coursePrice: '150.75',
                    courseLocation: 'Updated Location',
                    courseStartTime: '11:00',
                    courseEndTime: '13:00'
                })
                .expect(302);
            expect(res.header.location).to.equal('/dashboard');
        });

        it('POST /api/courses/delete should delete the course and redirect to /dashboard', async () => {
            const res = await request(app)
                .post('/api/courses/delete')
                .type('form')
                .send({ courseId: createdCourseId })
                .expect(302);
            expect(res.header.location).to.equal('/dashboard');
        });
    });

    // --------------------------------------------------
    // Test API Classes Endpoints
    // --------------------------------------------------
    describe('API Classes Endpoints', () => {
        let createdClassId;

        it('GET /api/classes should return an array of classes (JSON)', async () => {
            const res = await request(app)
                .get('/api/classes')
                .set('Accept', 'application/json')
                .expect(200);
            expect(res.body).to.be.an('array');
        });

        it('POST /api/classes/add should add a new class and redirect to /dashboard', async () => {
            const res = await request(app)
                .post('/api/classes/add')
                .type('form')
                .send({
                    className: 'Test Class',
                    classDescription: 'A test class description',
                    classLocation: 'Test Class Location',
                    classPrice: '50.25'
                })
                .expect(302);
            expect(res.header.location).to.equal('/dashboard');
        });

        it('GET /api/classes should contain the newly added class', async () => {
            const res = await request(app)
                .get('/api/classes')
                .set('Accept', 'application/json')
                .expect(200);
            const classes = res.body;
            const testClass = classes.find(c => c.name === 'Test Class');
            expect(testClass).to.exist;
            createdClassId = testClass._id;
        });

        it('POST /api/classes/edit should update the class and redirect to /dashboard', async () => {
            const res = await request(app)
                .post('/api/classes/edit')
                .type('form')
                .send({
                    classId: createdClassId,
                    className: 'Updated Test Class',
                    classDescription: 'Updated class description',
                    classLocation: 'Updated Location',
                    classPrice: '60.50'
                })
                .expect(302);
            expect(res.header.location).to.equal('/dashboard');
        });

        it('POST /api/classes/timeslots/update should update timeslots and redirect to /dashboard', async () => {
            const res = await request(app)
                .post('/api/classes/timeslots/update')
                .type('form')
                .send({
                    classId: createdClassId,
                    timeslotsCSV: 'Monday 9am, Tuesday 10am'
                })
                .expect(302);
            expect(res.header.location).to.equal('/dashboard');
        });

        it('POST /api/classes/participants/add should add a participant and redirect to /dashboard', async () => {
            const res = await request(app)
                .post('/api/classes/participants/add')
                .type('form')
                .send({
                    classId: createdClassId,
                    participantName: 'John Doe',
                    participantEmail: 'john@example.com'
                })
                .expect(302);
            expect(res.header.location).to.equal('/dashboard');
        });

        it('GET /api/classes/participants should return participants for the class', async () => {
            const res = await request(app)
                .get('/api/classes/participants')
                .query({ classId: createdClassId })
                .expect(200);
            const participants = res.body;
            expect(participants).to.be.an('array');
            const participant = participants.find(p => p.email === 'john@example.com');
            expect(participant).to.exist;
        });

        it('POST /api/classes/delete should delete the class and redirect to /dashboard', async () => {
            const res = await request(app)
                .post('/api/classes/delete')
                .type('form')
                .send({ classId: createdClassId })
                .expect(302);
            expect(res.header.location).to.equal('/dashboard');
        });
    });

    // --------------------------------------------------
    // Test API Users Endpoints
    // --------------------------------------------------
    describe('API Users Endpoints', () => {
        let createdUserId;

        it('GET /api/users should return an array of users (JSON)', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Accept', 'application/json')
                .expect(200);
            expect(res.body).to.be.an('array');
        });

        it('POST /api/users/add should add a new user and redirect to /dashboard', async () => {
            const res = await request(app)
                .post('/api/users/add')
                .type('form')
                .send({
                    userName: 'Test User',
                    userEmail: 'testuser@example.com',
                    userRole: 'user',
                    userPassword: 'password123'
                })
                .expect(302);
            expect(res.header.location).to.equal('/dashboard');
        });

        it('GET /api/users should contain the newly added user', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Accept', 'application/json')
                .expect(200);
            const users = res.body;
            const testUser = users.find(u => u.email === 'testuser@example.com');
            expect(testUser).to.exist;
            createdUserId = testUser._id;
        });

        it('POST /api/users/edit should update the user and redirect to /dashboard', async () => {
            const res = await request(app)
                .post('/api/users/edit')
                .type('form')
                .send({
                    userId: createdUserId,
                    userName: 'Updated Test User',
                    userEmail: 'testuser@example.com',
                    userRole: 'organiser'
                })
                .expect(302);
            expect(res.header.location).to.equal('/dashboard');
        });

        it('POST /api/users/delete should delete the user and redirect to /dashboard', async () => {
            const res = await request(app)
                .post('/api/users/delete')
                .type('form')
                .send({ userId: createdUserId })
                .expect(302);
            expect(res.header.location).to.equal('/dashboard');
        });
    });

    // --------------------------------------------------
    // Test Authentication (Login)
    // --------------------------------------------------
    describe('Authentication', () => {
        // Use a persistent agent to test session persistence
        const agent = request.agent(app);

        // Create a user to test login.
        before(async () => {
            await request(app)
                .post('/api/users/add')
                .type('form')
                .send({
                    userName: 'Login Test User',
                    userEmail: 'loginuser@example.com',
                    userRole: 'user',
                    userPassword: 'password123'
                })
                .expect(302);
        });

        it('POST /login should login with valid credentials and redirect to /dashboard', async () => {
            const res = await agent
                .post('/login')
                .type('form')
                .send({
                    email: 'loginuser@example.com',
                    password: 'password123'
                })
                .expect(302);
            expect(res.header.location).to.equal('/dashboard');
        });

        it('POST /login should not login with invalid credentials and redirect to /login', async () => {
            const res = await agent
                .post('/login')
                .type('form')
                .send({
                    email: 'loginuser@example.com',
                    password: 'wrongpassword'
                })
                .expect(302);
            expect(res.header.location).to.equal('/login');
        });
    });

});

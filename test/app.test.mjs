import request from 'supertest';
import { expect } from 'chai';
import app from '../server.js';

// index routes tests
describe('integration tests', () => {
    describe('index routes', () => {
        it('get / should return home page html with "danceright!"', async () => {
            const res = await request(app)
                .get('/')
                .expect(200)
                .expect('content-type', /html/);
            expect(res.text).to.include('danceright!');
        });

        it('get /auth/login should return html with "login"', async () => {
            const res = await request(app)
                .get('/auth/login')
                .expect(200)
                .expect('content-type', /html/);
            expect(res.text).to.include('login');
        });

        it('get /auth/register should return html with "register"', async () => {
            const res = await request(app)
                .get('/auth/register')
                .expect(200)
                .expect('content-type', /html/);
            expect(res.text).to.include('register');
        });
    });

    // public booking routes tests
    describe('public booking routes', () => {
        let testCourseId;
        let testClassId;

        before(async () => {
            // create a course for booking tests
            await request(app)
                .post('/courses/add')
                .type('form')
                .send({
                    courseName: 'booking test course',
                    courseDescription: 'course for booking test',
                    courseStartDate: '2025-05-01',
                    courseDuration: '3 weeks',
                    courseSchedule: 'friday',
                    coursePrice: '200.00',
                    courseLocation: 'test venue',
                    courseStartTime: '09:00',
                    courseEndTime: '11:00'
                })
                .expect(302);

            const coursesRes = await request(app)
                .get('/courses')
                .set('accept', 'application/json')
                .expect(200);
            const courses = coursesRes.body;
            const testCourse = courses.find(c => c.name === 'booking test course');
            testCourseId = testCourse._id;

            // create a class for booking tests
            await request(app)
                .post('/classes/add')
                .type('form')
                .send({
                    className: 'booking test class',
                    classDescription: 'class for booking test',
                    classLocation: 'test location',
                    classPrice: '75.00'
                })
                .expect(302);

            const classesRes = await request(app)
                .get('/classes')
                .set('accept', 'application/json')
                .expect(200);
            const classes = classesRes.body;
            const testClass = classes.find(c => c.name === 'booking test class');
            testClassId = testClass._id;
        });

        it('get /bookcourse without course query should redirect to /courses', async () => {
            const res = await request(app)
                .get('/bookCourse')
                .expect(302);
            expect(res.header.location).to.equal('/courses');
        });

        it('get /bookclass without class query should redirect to /classes', async () => {
            const res = await request(app)
                .get('/bookClass')
                .expect(302);
            expect(res.header.location).to.equal('/classes');
        });

        it('get /bookcourse with valid course query should return booking page html', async () => {
            const res = await request(app)
                .get('/bookCourse')
                .query({ course: testCourseId })
                .expect(200)
                .expect('content-type', /html/);
            expect(res.text).to.include('book full course');
        });

        it('get /bookclass with valid class query should return booking page html', async () => {
            const res = await request(app)
                .get('/bookClass')
                .query({ class: testClassId })
                .expect(200)
                .expect('content-type', /html/);
            expect(res.text).to.include('book class');
        });

        it('post /bookcourse by an unregistered user should add booking but not create session', async () => {
            const uniqueEmail = `unreg${Date.now()}@example.com`;
            const res = await request(app)
                .post('/bookCourse')
                .type('form')
                .send({
                    contactName: 'unregistered user',
                    contactEmail: uniqueEmail,
                    contactMobile: '0000000000',
                    courseId: testCourseId,
                    selectedDates: '2025-05-02,2025-05-09'
                })
                .expect(302);
            expect(res.header.location).to.equal('/courses');

            const protectedRes = await request(app)
                .get('/manageBookings')
                .set('cookie', res.headers['set-cookie'] || [])
                .expect(302);
            expect(protectedRes.header.location).to.equal('/auth/login');
        });

        it('post /bookclass by an unregistered user should add booking but not create session', async () => {
            const uniqueEmail = `unreg${Date.now()}@example.com`;
            const res = await request(app)
                .post('/bookClass')
                .type('form')
                .send({
                    contactName: 'unregistered class user',
                    contactEmail: uniqueEmail,
                    contactMobile: '0000000000',
                    classId: testClassId,
                    selectedTime: '28/04/2025 - 17:00 - 18:00'
                })
                .expect(302);
            expect(res.header.location).to.equal('/classes');

            const protectedRes = await request(app)
                .get('/manageBookings')
                .set('cookie', res.headers['set-cookie'] || [])
                .expect(302);
            expect(protectedRes.header.location).to.equal('/auth/login');
        });

        // tests for registered users
        it('post /bookcourse by a registered user should add booking and create session', async () => {
            const agent = request.agent(app);
            const uniqueEmail = `reg${Date.now()}@example.com`;

            await request(app)
                .post('/auth/register')
                .type('form')
                .send({
                    username: 'reg user',
                    email: uniqueEmail,
                    password: 'password123'
                })
                .expect(302);
            await agent
                .post('/auth/login')
                .type('form')
                .send({
                    email: uniqueEmail,
                    password: 'password123'
                })
                .expect(302);

            const res = await agent
                .post('/bookCourse')
                .type('form')
                .send({
                    contactName: 'reg user',
                    contactEmail: uniqueEmail,
                    contactMobile: '1111111111',
                    courseId: testCourseId,
                    selectedDates: '2025-05-02,2025-05-09'
                })
                .expect(302);
            expect(res.header.location).to.equal('/courses');

            const protectedRes = await agent
                .get('/manageBookings')
                .expect(200);
            expect(protectedRes.text).to.include('my bookings');
        });

        it('post /bookclass by a registered user should add booking and create session', async () => {
            const agent = request.agent(app);
            const uniqueEmail = `reg${Date.now()}@example.com`;

            await request(app)
                .post('/auth/register')
                .type('form')
                .send({
                    username: 'reg class user',
                    email: uniqueEmail,
                    password: 'password123'
                })
                .expect(302);
            await agent
                .post('/auth/login')
                .type('form')
                .send({
                    email: uniqueEmail,
                    password: 'password123'
                })
                .expect(302);

            const res = await agent
                .post('/bookClass')
                .type('form')
                .send({
                    contactName: 'reg class user',
                    contactEmail: uniqueEmail,
                    contactMobile: '2222222222',
                    classId: testClassId,
                    selectedTime: '28/04/2025 - 17:00 - 18:00'
                })
                .expect(302);
            expect(res.header.location).to.equal('/classes');

            const protectedRes = await agent
                .get('/manageBookings')
                .expect(200);
            expect(protectedRes.text).to.include('my bookings');
        });
    });

    // courses endpoints tests
    describe('courses endpoints', () => {
        let createdCourseId;

        it('get /courses should return an array of courses (json)', async () => {
            const res = await request(app)
                .get('/courses')
                .set('accept', 'application/json')
                .expect(200);
            expect(res.body).to.be.an('array');
        });

        it('post /courses/add should add a new course and redirect to /dashboard', async () => {
            const res = await request(app)
                .post('/courses/add')
                .type('form')
                .send({
                    courseName: 'test course',
                    courseDescription: 'a test course description',
                    courseStartDate: '2025-04-01',
                    courseDuration: '4 weeks',
                    courseSchedule: 'monday, wednesday',
                    coursePrice: '100.50',
                    courseLocation: 'test location',
                    courseStartTime: '10:00',
                    courseEndTime: '12:00'
                })
                .expect(302);
            expect(res.header.location).to.equal('/dashboard');
        });

        it('get /courses should contain the newly added course', async () => {
            const res = await request(app)
                .get('/courses')
                .set('accept', 'application/json')
                .expect(200);
            const courses = res.body;
            const testCourse = courses.find(c => c.name === 'test course');
            expect(testCourse).to.exist;
            createdCourseId = testCourse._id;
        });

        it('post /courses/edit should update the course and redirect to /dashboard', async () => {
            const res = await request(app)
                .post('/courses/edit')
                .type('form')
                .send({
                    courseId: createdCourseId,
                    courseName: 'updated test course',
                    courseDescription: 'updated description',
                    courseStartDate: '2025-04-02',
                    courseDuration: '5 weeks',
                    courseSchedule: 'tuesday, thursday',
                    coursePrice: '150.75',
                    courseLocation: 'updated location',
                    courseStartTime: '11:00',
                    courseEndTime: '13:00'
                })
                .expect(302);
            expect(res.header.location).to.equal('/dashboard');
        });

        it('post /courses/delete should delete the course and redirect to /dashboard', async () => {
            const res = await request(app)
                .post('/courses/delete')
                .type('form')
                .send({ courseId: createdCourseId })
                .expect(302);
            expect(res.header.location).to.equal('/dashboard');
        });
    });

    // classes endpoints tests
    describe('classes endpoints', () => {
        let createdClassId;

        it('get /classes should return an array of classes (json)', async () => {
            const res = await request(app)
                .get('/classes')
                .set('accept', 'application/json')
                .expect(200);
            expect(res.body).to.be.an('array');
        });

        it('post /classes/add should add a new class and redirect to /dashboard', async () => {
            const res = await request(app)
                .post('/classes/add')
                .type('form')
                .send({
                    className: 'test class',
                    classDescription: 'a test class description',
                    classLocation: 'test class location',
                    classPrice: '50.25'
                })
                .expect(302);
            expect(res.header.location).to.equal('/dashboard');
        });

        it('get /classes should contain the newly added class', async () => {
            const res = await request(app)
                .get('/classes')
                .set('accept', 'application/json')
                .expect(200);
            const classes = res.body;
            const testClass = classes.find(c => c.name === 'test class');
            expect(testClass).to.exist;
            createdClassId = testClass._id;
        });

        it('post /classes/edit should update the class and redirect to /dashboard', async () => {
            const res = await request(app)
                .post('/classes/edit')
                .type('form')
                .send({
                    classId: createdClassId,
                    className: 'updated test class',
                    classDescription: 'updated class description',
                    classLocation: 'updated location',
                    classPrice: '60.50'
                })
                .expect(302);
            expect(res.header.location).to.equal('/dashboard');
        });

        it('post /classes/timeslots/update should update timeslots and redirect to /dashboard', async () => {
            const res = await request(app)
                .post('/classes/timeslots/update')
                .type('form')
                .send({
                    classId: createdClassId,
                    timeslotsCSV: 'monday 9am, tuesday 10am'
                })
                .expect(302);
            expect(res.header.location).to.equal('/dashboard');
        });

        it('post /classes/participants/add should add a participant and redirect to /dashboard', async () => {
            const res = await request(app)
                .post('/classes/participants/add')
                .type('form')
                .send({
                    classId: createdClassId,
                    participantName: 'john doe',
                    participantEmail: 'john@example.com'
                })
                .expect(302);
            expect(res.header.location).to.equal('/dashboard');
        });

        it('get /classes/participants should return participants for the class', async () => {
            const res = await request(app)
                .get('/classes/participants')
                .query({ classId: createdClassId })
                .expect(200);
            const participants = res.body;
            expect(participants).to.be.an('array');
            const participant = participants.find(p => p.email === 'john@example.com');
            expect(participant).to.exist;
        });

        it('post /classes/delete should delete the class and redirect to /dashboard', async () => {
            const res = await request(app)
                .post('/classes/delete')
                .type('form')
                .send({ classId: createdClassId })
                .expect(302);
            expect(res.header.location).to.equal('/dashboard');
        });
    });

    // users endpoints tests
    describe('users endpoints', () => {
        let createdUserId;

        it('get /users should return an array of users (json)', async () => {
            const res = await request(app)
                .get('/users')
                .set('accept', 'application/json')
                .expect(200);
            expect(res.body).to.be.an('array');
        });

        it('post /users/add should add a new user and redirect to /dashboard', async () => {
            const res = await request(app)
                .post('/users/add')
                .type('form')
                .send({
                    userName: 'test user',
                    userEmail: 'testuser@example.com',
                    userRole: 'user',
                    userPassword: 'password123'
                })
                .expect(302);
            expect(res.header.location).to.equal('/dashboard');
        });

        it('get /users should contain the newly added user', async () => {
            const res = await request(app)
                .get('/users')
                .set('accept', 'application/json')
                .expect(200);
            const users = res.body;
            const testUser = users.find(u => u.email === 'testuser@example.com');
            expect(testUser).to.exist;
            createdUserId = testUser._id;
        });

        it('post /users/edit should update the user and redirect to /dashboard', async () => {
            const res = await request(app)
                .post('/users/edit')
                .type('form')
                .send({
                    userId: createdUserId,
                    userName: 'updated test user',
                    userEmail: 'testuser@example.com',
                    userRole: 'organiser'
                })
                .expect(302);
            expect(res.header.location).to.equal('/dashboard');
        });

        it('post /users/delete should delete the user and redirect to /dashboard', async () => {
            const res = await request(app)
                .post('/users/delete')
                .type('form')
                .send({ userId: createdUserId })
                .expect(302);
            expect(res.header.location).to.equal('/dashboard');
        });
    });

    // authentication tests
    describe('authentication', () => {
        const agent = request.agent(app);

        before(async () => {
            await request(app)
                .post('/users/add')
                .type('form')
                .send({
                    userName: 'login test user',
                    userEmail: 'loginuser@example.com',
                    userRole: 'user',
                    userPassword: 'password123'
                })
                .expect(302);
        });

        it('post /auth/login should login with valid creds and redirect to /', async () => {
            const res = await agent
                .post('/auth/login')
                .type('form')
                .send({
                    email: 'loginuser@example.com',
                    password: 'password123'
                })
                .expect(302);
            expect(res.header.location).to.equal('/');
        });

        it('post /auth/login should not login with invalid creds and redirect to /auth/login', async () => {
            const res = await agent
                .post('/auth/login')
                .type('form')
                .send({
                    email: 'loginuser@example.com',
                    password: 'wrongpassword'
                })
                .expect(302);
            expect(res.header.location).to.equal('/auth/login');
        });

        it('post /auth/register should register a new user and redirect to /auth/login', async () => {
            const uniqueEmail = `testreg${Date.now()}@example.com`;
            const res = await request(app)
                .post('/auth/register')
                .type('form')
                .send({
                    username: 'test reg user',
                    email: uniqueEmail,
                    password: 'password123'
                })
                .expect(302);
            expect(res.header.location).to.equal('/auth/login');
        });

        it('post /auth/register should update an existing unregistered user and not auto-login them', async () => {
            const duplicateEmail = `duplicate${Date.now()}@example.com`;
            await request(app)
                .post('/bookCourse')
                .type('form')
                .send({
                    contactName: 'duplicate user',
                    contactEmail: duplicateEmail,
                    contactMobile: '0000000000',
                    courseId: 'dummyCourseId',
                    selectedDates: '2025-05-02'
                })
                .expect(302);
            const res = await request(app)
                .post('/auth/register')
                .type('form')
                .send({
                    username: 'duplicate user updated',
                    email: duplicateEmail,
                    password: 'newpassword'
                })
                .expect(302);
            expect(res.header.location).to.equal('/auth/login');

            const loginRes = await request(app)
                .post('/auth/login')
                .type('form')
                .send({
                    email: duplicateEmail,
                    password: 'newpassword'
                })
                .expect(302);
            expect(loginRes.header.location).to.equal('/');
        });

        it('get /auth/logout should logout the user and redirect to /', async () => {
            const logoutAgent = request.agent(app);
            const uniqueEmail = `testlogout${Date.now()}@example.com`;
            await request(app)
                .post('/auth/register')
                .type('form')
                .send({
                    username: 'test logout user',
                    email: uniqueEmail,
                    password: 'password123'
                })
                .expect(302);
            await logoutAgent
                .post('/auth/login')
                .type('form')
                .send({
                    email: uniqueEmail,
                    password: 'password123'
                })
                .expect(302);
            const res = await logoutAgent
                .get('/auth/logout')
                .expect(302);
            expect(res.header.location).to.equal('/');
        });
    });
});
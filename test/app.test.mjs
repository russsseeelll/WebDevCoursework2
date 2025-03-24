/**
 * test/app.test.mjs
 * ------------------
 * Integration tests for the Express routes using Mocha, Chai, and Supertest.
 *
 * This file uses ES Module syntax. Ensure your package.json has "type": "module"
 * or rename this file to .mjs.
 */

import request from 'supertest';
import { expect } from 'chai';
import app from '../server.js';

describe('Integration Tests', () => {

    describe('GET /api/classes', () => {
        it('should return an array of classes in JSON format', async () => {
            const res = await request(app)
                .get('/api/classes')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200);
            expect(res.body).to.be.an('array');
        });
    });

    describe('GET /api/courses', () => {
        it('should return an array of courses in JSON format', async () => {
            const res = await request(app)
                .get('/api/courses')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200);
            expect(res.body).to.be.an('array');
        });
    });

    describe('GET /', () => {
        it('should return the home page HTML containing "Danceright!" in the title', async () => {
            const res = await request(app)
                .get('/')
                .expect(200)
                .expect('Content-Type', /html/);
            expect(res.text).to.include('Danceright!');
        });
    });

    describe('GET /dashboard (protected route)', () => {
        it('should redirect to /login if the user is not authenticated', async () => {
            const res = await request(app)
                .get('/dashboard')
                .expect(302);
            expect(res.headers.location).to.equal('/login');
        });
    });

});

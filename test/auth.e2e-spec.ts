// auth.e2e-spec.ts
import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { AuthModule } from '../src/auth/modules/auth.module'

/**
 * Test suite for the Auth server
 */
describe('AuthController (e2e)', () => {
    let app: INestApplication

    /**
     * Before all tests, initialize the server and set up necessary data
     */
    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AuthModule],
        }).compile()

        app = moduleFixture.createNestApplication()
        await app.init()
    })

    /**
     * Test suite for the generation of a JWT token with correct credentials
     */
    it('should generate a valid JWT token for valid credentials', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/token')
            .send({
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
            })

        expect(response.status).toBe(HttpStatus.CREATED)
        expect(response.body).toHaveProperty('accessToken')
    })

    /**
     * Test suite for the generation of a JWT token with wrong credentials
     */
    it('should return Unauthorized for invalid credentials', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/token')
            .send({
                clientId: 'invalid-client-id',
                clientSecret: 'invalid-client-secret',
            })

        expect(response.status).toBe(HttpStatus.UNAUTHORIZED)
    })

    /**
     * After all tests, destroy the server
     */
    afterAll(async () => {
        await app.close()
    })
})

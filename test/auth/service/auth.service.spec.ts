import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from '../../../src/auth/services/auth.service'

/**
 * Test suite for the Auth service
 */
describe('AuthService', () => {
    let service: AuthService
    let jwtService: JwtService

    /**
     * Before each test, initialize the server and set up necessary data
     */
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn(() => 'mockToken'),
                    },
                },
            ],
        }).compile()

        service = module.get<AuthService>(AuthService)
        jwtService = module.get<JwtService>(JwtService)
    })

    /**
     * Test service definition
     */
    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    /**
     * Test suite for the validation of auth fields
     */
    describe('validateClient', () => {
        /**
         * Test suite for the validation of client credentials
         */
        it('should validate client credentials', () => {
            process.env.CLIENT_ID = 'testClientId'
            process.env.CLIENT_SECRET = 'testClientSecret'

            expect(
                service.validateClient('testClientId', 'testClientSecret'),
            ).toBeTruthy()
            expect(
                service.validateClient('wrongClientId', 'testClientSecret'),
            ).toBeFalsy()
        })
    })

    /**
     * Test suite for the generation of a token
     */
    describe('generateToken', () => {
        /**
         * Test suite for the sign of a new token
         */
        it('should generate a token', () => {
            expect(service.generateToken()).toBe('mockToken')
            expect(jwtService.sign).toHaveBeenCalled()
        })
    })
})

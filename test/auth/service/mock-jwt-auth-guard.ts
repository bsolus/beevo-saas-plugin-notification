// mock-jwt-auth-guard.ts
import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

/**
 * Mock class to bypass JwtAuthGuard
 */
@Injectable()
export class MockJwtAuthGuard extends AuthGuard('jwt') {
    canActivate() {
        return true // Allow all requests to proceed without authentication
    }
}

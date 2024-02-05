import { Injectable, CanActivate } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { UserService } from '../../user/user.service';

@Injectable()
export class WsGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  canActivate(
    context: any,
  ): boolean | any | Promise<boolean | any> | Observable<boolean | any> {
    const bearerToken = context.args[0].handshake.query.token;
    const secret = this.config.get('JWT_SECRET');

    try {
      const decoded = this.jwt.verify(bearerToken, {
        secret,
      }) as any;

      return new Promise((resolve, reject) => {
        return this.userService.getUserByEmail(decoded.email).then((user) => {
          if (user) {
            resolve(user);
          } else {
            reject(false);
          }
        });
      });
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

import {
  Injectable,
  NotAcceptableException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/database/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService
  ) {}

  async validateUser(login: string, passw: string): Promise<any> {
    const user = await this.prisma.nestTask.findFirst({
      where: {
        login: login
      }
    });
    
    if (!user) {
      throw new UnauthorizedException('Usuário inválido');
    }

    const isPasswordAMatch = await bcrypt.compare(passw, user.password);
    if (isPasswordAMatch) {
      return await this.generateAccessToken(user);
    }

    throw new UnauthorizedException('Senha inválida');
  }

  async generateAccessToken(accPayload) {
    return {
      access_token: this.jwtService.sign(
        { login: accPayload.login },
        {
          secret: `${process.env.AUTH_ACCESS_TOKEN_SECRET_KEY}`,
          expiresIn: '60s', //TODO: Maybe should be at .env?
        },
      ),
    };
  }

  async validateAccessToken(token) {
    try {
      const payload = await this.jwtService.verifyAsync(token,
      {
        secret: `${process.env.AUTH_ACCESS_TOKEN_SECRET_KEY}`
      })
    }
    catch {
      throw new UnauthorizedException();
    }

    return true;
  }
}
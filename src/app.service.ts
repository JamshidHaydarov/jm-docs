import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthDto } from 'dto/auth.dto';
import { Users } from 'entities/users.entity';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Files } from 'entities/files.entity';
import { FilesAccess } from 'entities/filesaccess.entity';

@Injectable()
export class AppService {
  userHasAccessToFile(sub: number, fileId: number) {
    return this.db.manager.findOne(FilesAccess, {
      where: {
        user: { id: sub },
        file: { id: fileId },
      },
    });
  }

  updateFile(user_id: number, fileId: any, context: string) {
    return this.db.manager.save(Files, {
      id: fileId,
      context: context,
      owner: { id: user_id },
    });
  }
  
  constructor(
    private readonly db: DataSource,
    private readonly jwtService: JwtService,
  ){}

  async auth(body: AuthDto) {
    const { username, password } = body;

    // Username Database da bor/yoqligini tekshirish
    const existingUsername = await this.db.manager.findOne(Users ,{ where: { username } });
    if (existingUsername) {
      return {ok: false, message: 'Username already in use'}
    }

    // Password ni hash lash
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yangi user ochish
    const user = this.db.manager.create(Users ,{
      username,
      password: hashedPassword,
    });

    // Yangi user malumotlari asosida Database ga yangi user create qilish
    const savedUser = await this.db.manager.save(Users, user);

    // JWT Generatsiyasi
    const payload = {
      sub: savedUser.id,
      username: savedUser.username,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      message: 'Registration successful',
      access_token: accessToken,
      user: {
        id: savedUser.id,
        username: savedUser.username,
      },
    };
  }

  async login(dto: AuthDto) {
    const { username, password } = dto;

    // Userni Database dan qidirish
    const user = await this.db.manager.findOne(Users, { where: { username } });
    // Agar user database da bolmasa error otiladi
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    // Passwordni solishtirish
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password');
    }

    // Генерация JWT
    const payload = {
      sub: user.id,
      username: user.username,
    };

    const accessToken = await this.jwtService.sign(payload)
    return {
      ok: true,
      message: 'Login successful',
      access_token: accessToken,
    }
  }



  async verifyToken(req: any) {
      try {
        const authHeader = req.headers.authorization;

        if (!authHeader) return null;

        const token = authHeader.split(' ')[1];

        const decoded = this.jwtService.verify(token);
        if (!decoded) {
          throw new UnauthorizedException('Not authorized');
        }
        
        return decoded

    

      } catch (e) {
        return undefined;
      }


    }

  
  async createFile(createFileDto: any, ownerId: number) {
    // Yangi file ochilishi
    const file = this.db.manager.create(Files,{
      filename: createFileDto.filename,
      owner: { id: ownerId },
      context: null,
    });
    // fayl db da save qilinib controller file ga qaytarilishi
    try {
      const savefile = await this.db.manager.save(Files, file);
      const user = await this.db.manager.findOne(Users, {where: {id: ownerId}})
      if (!user || !savefile) {
        throw new Error('User not found');
      }
      await this.db.manager.save(FilesAccess, {user: user, file: savefile })
      
      return { 
        ok:true, 
        message: 'File successfully created',
      }
    } catch {
      throw new Error
    }
  }


async getUserFilesByUserId(id: any) {
  const access = await this.db.manager.find(FilesAccess, {
    where: { user:  { id } },
    relations: ['file'],
  });
  return access.map(a => a.file);
}


  async getFileById(id:number, user_id: number) {
    const files = await this.db.manager.find(Files, {where: {
      id: id,
      owner: {
        id: user_id,
      },
    },
    relations: ['owner'],
  })
    const users = await this.db.manager.query(
      `
      SELECT u.*
      FROM users u
      WHERE NOT EXISTS (
        SELECT 1
        FROM files_access fa
        WHERE fa."userId" = u.id
          AND fa."fileId" = $1
      )
      `,
      [id],
    );
    return {file: files, users: users}
  }


  async giveFileAccess(sub: any, userId: any, fileId: any) {    
    const file = await this.db.manager.findOne(Files, {
    where: {
        id: fileId,
        owner: {
          id: sub,
        },
      },
      relations: ['owner'],
    });  

    if (!file) {
        throw new NotFoundException('File not found');
      }
    await this.db.manager.save(FilesAccess, {
      user: {id: userId},
      file: {id: fileId},
    })
    return {ok: true, message: 'Access successfully given'}
  }




}




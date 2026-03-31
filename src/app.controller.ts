import { Body, Controller, Get, Param, Post, Render, Req, Res, UnauthorizedException} from '@nestjs/common';
import { AppService } from './app.service';
import { AuthDto } from 'dto/auth.dto';
import { CreateFileDto } from 'dto/create.file.dto';
import { GiveAccessDto } from 'dto/give.access.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('auth')
  async authentificate(@Body() body: AuthDto) {
    return await this.appService.auth(body)
  }

  @Post('login')
  async log(@Body() body: AuthDto) {
    return await this.appService.login(body)
  }

  @Get('profile')
  async getProfile(@Req() req: any) {    
    const ver = await this.appService.verifyToken(req)
    if (!ver) {
      return {ok: false, message:'User is not found'}
    }
    const files = await this.appService.getUserFilesByUserId(ver.sub)     
    return {id: ver.sub, username: ver.username, files: files}
  }


  @Post('create')
  async upload_file(@Body() body: CreateFileDto, @Req() req: any){
    const user = await this.appService.verifyToken(req)
    if (!user) {
      return {ok: false, message:'User is not found'}
    }
    return this.appService.createFile({filename: body.filename}, user.sub)
  }

  @Get('profile/files/:id')
  async getFile(@Param() payload: any, @Req() req: any) {
    const ver = await this.appService.verifyToken(req)
    if (!ver) {
      throw new UnauthorizedException
    }
    return this.appService.getFileById(payload.id, ver.sub)
  }

  @Post('profile/files/give-access')
  async giveAccess(@Body() body: GiveAccessDto, @Req() req: any) {    
    const ver = await this.appService.verifyToken(req)
    if (!ver) {
      throw new UnauthorizedException('Unauthorized')
    }
    return await this.appService.giveFileAccess(ver.sub, body.userId, body.fileId)
  }
}

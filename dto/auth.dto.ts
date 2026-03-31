import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length, MinLength } from "class-validator";


export class AuthDto {
    @ApiProperty({example: "John"})
    @IsString()
    @Length(3, 20)
    username: string

    @ApiProperty()
    @IsString()
    @MinLength(6)
    password: string
    
}
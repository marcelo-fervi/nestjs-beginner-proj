import { IsNotEmpty, Length } from 'class-validator';

export class CreateTaskBody {
    @IsNotEmpty()
    @Length(1)
    login: string

    @IsNotEmpty()
    @Length(1)
    password: string

    @IsNotEmpty()
    @Length(1)
    name: string
}
import { IsNotEmpty, Length } from 'class-validator';

export class UpdateTaskBody {
    @IsNotEmpty()
    id: string
    
    @IsNotEmpty()
    @Length(1)
    name: string
    
    @IsNotEmpty()
    access_token: string
}
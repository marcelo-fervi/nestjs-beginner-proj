import { IsNotEmpty } from "class-validator";

export class DeleteTaskBody {
    @IsNotEmpty()
    id: string
    
    @IsNotEmpty()
    access_token: string
}
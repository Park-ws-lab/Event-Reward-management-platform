import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
        private jwtService: JwtService,
    ){}

    async register(username: string, password: string, role: String="USER"){
        const hashedPassword = await bcrypt.hash(password,10);

        const user = new this.userModel({
            username,
            password: hashedPassword,
            role,
        });

        return user.save()
    }

    async login(username:string, password:string){
        const user = await this.userModel.findOne({username});
        if(!user) return null;

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return null;

        const payload = {
            sub: user._id,
            username: user.username,
            role: user.role
        }
        
        
        const token = this.jwtService.sign(payload);

        return {access_token: token};
    }
}

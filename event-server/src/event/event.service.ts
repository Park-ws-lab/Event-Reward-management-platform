// event 관련 로직을 처리하는 서비스 클래스

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Event, EventDocument } from './schemas/event.schema';
import { Model } from 'mongoose';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class EventService {
    constructor(
        // MongoDB에서 Event 모델 주입
        @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    ) { }

    // 새로운 이벤트 생성
    async createEvent(dto: CreateEventDto) {
        const event = new this.eventModel(dto); // DTO 기반 문서 생성
        return event.save(); // MongoDB에 저장
    }

    // 전체 이벤트 목록 조회 + 보상 정보도 함께 포함
    async getAllEvents(): Promise<Event[]> {
        return this.eventModel
            .find() // 모든 이벤트 조회
            .populate({ path: 'rewards' }) // Reward virtual 필드 자동 채움
            .exec(); // 쿼리 실행
    }

    // 이벤트 제목만 조회 (최신 순 정렬)
    async getAllTitles(): Promise<Event[]> {
        return this.eventModel
            .find({}, { title: 1 }) // title 필드만 선택
            .sort({ createdAt: -1 }) // 최신 생성순 정렬
            .exec(); // 쿼리 실행
    }

    // 이벤트 수정
    async updateEventOrFail(id: string, dto: UpdateEventDto) {
        const updated = await this.eventModel.findByIdAndUpdate(id, dto, { new: true }).exec();
        if (!updated) {
            throw new NotFoundException('해당 이벤트를 찾을 수 없습니다.');
        }

        return {
            message: '이벤트가 수정되었습니다.',
            event: updated,
        };
    }

    // 이벤트 삭제
    async deleteEventOrFail(id: string) {
        const result = await this.eventModel.deleteOne({ _id: id }).exec();

        if (result.deletedCount === 0) {
            throw new NotFoundException('이미 삭제되었거나 존재하지 않는 이벤트입니다.');
        }

        return { message: '이벤트가 삭제되었습니다.' };
    }
}

export class CreateEventDto {
    title: string;
    description: string;
    condition: string;
    startDate: Date;
    endDate: Date;
    isActive?: boolean;
}

import {ApiProperty} from '@nestjs/swagger';

export class GetEventDto {  
    @ApiProperty({ 
        description: 'Starting block number to fetch events from',
        example: 1000000,
     })
    fromBlock: number;

    @ApiProperty({
        description: 'Ending block number to fetch events to',
        example: 1000100,
     })
    toBlock: number;
}
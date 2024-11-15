import { ApiProperty } from "@nestjs/swagger";

export default class Page<T>{
    @ApiProperty()
    content: T[];
    @ApiProperty()
    totalElements: number;
    @ApiProperty()
    pageNum: number;
    @ApiProperty()
    pageSize: number;

    constructor( content : T[], totalElements: number, pageNumber: number, pageSize: number){
        this.content= content;
        this.totalElements= totalElements;
        this.pageNum = pageNumber;
        this.pageSize = pageSize;
    }
}
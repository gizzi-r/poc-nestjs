import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, ValidateNested } from "class-validator";
import Point from "../../../utils/point";

export default class CreateWarehouseDto{

    @ApiProperty({
        required: true
     })
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        required: true
     })
    @Type(() => Point)
    @ValidateNested()
    point: Point;

}
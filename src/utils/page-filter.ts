import { IsEnum, IsNumber, IsOptional, Min } from "class-validator";
import { SortOrder } from "./sort-order.enum";

export class GenericFilter {
    @IsNumber({}, { message: ' "page" attribute should be a number' })
    @Min(0)
    public page: number;
  
    @IsNumber({}, { message: ' "pageSize" attribute should be a number ' })
    @Min(5)
    public pageSize: number;
  
    @IsOptional()
    public orderBy?: string;
  
    @IsEnum(SortOrder)
    @IsOptional()
    public sortOrder?: SortOrder = SortOrder.DESC;    
  }


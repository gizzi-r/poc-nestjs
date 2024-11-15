import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";
import { Column } from "typeorm";


class Point {
  @ApiProperty({
    required: true
 })
  @Column({type: 'double precision'})
  @IsNotEmpty({message: "Il punto deve avere una latitudine"})
  @IsNumber({},{message: "La latitudine deve essere un numero"})
  lat: number;

  @ApiProperty({
    required: true
 })
  @Column({type: 'double precision'})
  @IsNotEmpty({message: "Il punto deve avere una longituine"})
  @IsNumber({},{message:"La longitudine deve essere un numero"})
  lng: number;

  constructor(lat: number, lng: number) {
    this.lat = lat;
    this.lng = lng;
  }

  distance(point: Point): number {
    const R: number = 6371; // Radius of the earth

    const latDistance = this._toRadians(this.lat - point.lat);
    const lonDistance = this._toRadians(this.lng - point.lng);
    const a =
      Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
      Math.cos(this._toRadians(point.lat)) *
        Math.cos(this._toRadians(this.lat)) *
        Math.sin(lonDistance / 2) *
        Math.sin(lonDistance / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
     // convert to meters
      return R * c * 1000;
  }

  private _toRadians(degrees: number): number {
    // Store the value of pi.
    const pi = Math.PI;
    // Multiply degrees by pi divided by 180 to convert to radians.
    return degrees * (pi / 180);
  }
}

export default Point;

import { Column } from "typeorm";

class Audit{

    @Column({nullable:true})
    createdDate: Date;

    @Column({name: "created_by",nullable:true})
    createdBy!: string;

    @Column({nullable:true})
    lastUpdateDate: Date;

    @Column({name: "updated_by",nullable:true})
    updatedBy!: string;

    constructor(partial:Partial<Audit>){
        Object.assign(this,partial);
    }
}

export default Audit;
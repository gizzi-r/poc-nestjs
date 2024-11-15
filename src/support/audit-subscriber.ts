import { EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent, UpdateEvent } from "typeorm";
import { Auditable, isAuditable } from "./auditable.interface";
import { Injectable } from "@nestjs/common";
import Audit from "src/utils/audit";
import { User } from "src/modules/auth/entities/user.entity";

@Injectable()
@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
  beforeInsert(event: InsertEvent<Auditable>) {
    if (isAuditable(event.entity)) {
      const user: User = event.queryRunner.data.user;
      const audit = new Audit({
        createdDate: new Date(),
        createdBy: user?.username,
      });
      event.entity.setAudit(audit);
    }
  }

  beforeUpdate() {
    debugger;
  }
  beforeRemove() {
    debugger;
  }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateShipmentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_shipment_dto_1 = require("./create-shipment.dto");
class UpdateShipmentDto extends (0, swagger_1.PartialType)(create_shipment_dto_1.CreateShipmentDto) {
}
exports.UpdateShipmentDto = UpdateShipmentDto;
//# sourceMappingURL=update-shipment.dto.js.map
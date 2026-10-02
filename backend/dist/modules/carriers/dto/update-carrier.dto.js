"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCarrierDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_carrier_dto_1 = require("./create-carrier.dto");
class UpdateCarrierDto extends (0, swagger_1.PartialType)(create_carrier_dto_1.CreateCarrierDto) {
}
exports.UpdateCarrierDto = UpdateCarrierDto;
//# sourceMappingURL=update-carrier.dto.js.map
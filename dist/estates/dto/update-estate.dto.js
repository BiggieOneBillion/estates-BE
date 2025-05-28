"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEstateDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_estate_dto_1 = require("./create-estate.dto");
class UpdateEstateDto extends (0, mapped_types_1.PartialType)(create_estate_dto_1.CreateEstateDto) {
}
exports.UpdateEstateDto = UpdateEstateDto;
//# sourceMappingURL=update-estate.dto.js.map
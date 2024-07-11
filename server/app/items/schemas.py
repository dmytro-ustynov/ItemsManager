from pydantic import BaseModel, Field
from server.app.items.item import FieldNames


class NoteRequest(BaseModel):
    object_id: str
    note: str


class ItemsRequest(BaseModel):
    item_ids: list[str]


class NewFieldObject(BaseModel):
    newFieldName: str
    newFieldValue: str


class UpdateItemRequest(BaseModel):
    item_id: str
    payload: NewFieldObject


class CreateItemRequest(BaseModel):
    name: str = Field(..., min_length=5)
    inventory_number: str = Field(..., min_length=5)
    service: str = Field(...)
    year: str = None
    serial: str = None
    payload: dict = None

    class Config:
        json_schema_extra = {
            'example': {
                'name': 'щось новеньке',
                'service': 'ВНЛЗ',
                'inventory_number': "123456"
            }
        }

    # def get_service(self):
    #     mapper = {
    #         Service.SZ: SERVICES.sz,
    #         Service.VNLZ: SERVICES.vnlz
    #     }
    #     return mapper.get(self.service)

    def to_dict(self):
        result = {FieldNames.name: self.name,
                  FieldNames.inventory_number: self.inventory_number,
                  FieldNames.service: self.service
                  }
        if self.year:
            result[FieldNames.year] = self.year
        if self.serial:
            result[FieldNames.serial] = self.serial
        if self.payload:
            result = {**self.payload, **result}
        return result

    def validate_name(self):
        if not self.name:
            raise ValueError('name must not be empty')
        if not self.name:
            raise ValueError('not valid name')


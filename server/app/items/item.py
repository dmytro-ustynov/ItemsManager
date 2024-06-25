class FieldNames:
    ID = "_id"
    service = "служба"
    name = "найменування"
    inventory_number = "інвентарний номер"
    year = "рік виготовлення"
    notes = "notes"
    serial = "заводський номер"
    category = "category"
    audit_book = "книга обліку"
    start_price = "початкова вартість"
    end_price = "залишкова вартість"
    quantity = "кількість"
    service_number = "service_number"
    measure_item = "одиниця виміру"
    category_ua = "категорія"

    @classmethod
    def all(cls, name=True):
        if name:
            restricted = (cls.ID, cls.service, cls.inventory_number, cls.notes, cls.service_number)
        else:
            restricted = (cls.ID, cls.service, cls.inventory_number, cls.notes, cls.service_number, cls.name)
        return tuple([v for v in cls.__dict__.values()
                      if isinstance(v, str) and not v.startswith('_')
                      and not v in restricted and not 'server' in v])


class SERVICES:
    vnlz = "ВНЛЗ"
    sz = "СЗ"


SERVICE_TO_NUMBER_MAPPER = {
    SERVICES.vnlz: 1,
    SERVICES.sz: 2
}


class Item:
    __collection__ = "ITEMS"

    def __init__(self, *args, **kwargs):
        for k, v in kwargs.items():
            if k:
                setattr(self, k, v)

    def to_dict(self):
        result = {k: v for k, v in self.__dict__.items()}
        result["_id"] = str(self._id)
        result["service_number"] = self.service_number()
        if self.__dict__.get(FieldNames.inventory_number):
            result["inventory"] = self.__dict__.get(FieldNames.inventory_number, "")
        return result

    @property
    def id(self):
        return self._id

    def service_number(self):
        return SERVICE_TO_NUMBER_MAPPER.get(self.__dict__.get(FieldNames.service), 0)

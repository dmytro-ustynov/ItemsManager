

class Body:
    def __init__(self, **kwargs):
        self.__kwargs = kwargs
        for k, v in kwargs.items():
            if isinstance(v, dict):
                setattr(self, k, Body(**v))
            else:
                setattr(self, k, v)

    def __repr__(self):
        return str(self)



def test():
    d1 = {"type": "amend", "step 1": {"a": 'aaaa', 'b': 'bbbb'}, "step_2": {'choices': [1,2,3]}}

    body = Body(**d1)

    print(body.step_1.a)
    print(body.step_2.choices)
    print('ok')


if __name__ == '__main__':
    test()


                            
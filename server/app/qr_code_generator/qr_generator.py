import qrcode
from PIL import Image


class QRCodeGenerator:
    def __init__(self, url, logo=None):
        self.url = url
        self.logo = logo
        self.QRcolor = 'Green'
        self.back_color = "white"
        self.ready = False
        self.img = None
        self.generate()

    def generate(self):
        if self.logo is not None:
            # taking image which user wants
            # in the QR code center
            # Logo_link = 'g4g.jpg'
            logo = Image.open(self.logo)
            basewidth = 150
            wpercent = (basewidth / float(logo.size[0]))
            hsize = int((float(logo.size[1]) * float(wpercent)))
            logo = logo.resize((basewidth, hsize), Image.Resampling.LANCZOS)

        QRcode = qrcode.QRCode(
            error_correction=qrcode.constants.ERROR_CORRECT_H
        )
        QRcode.add_data(self.url)
        QRcode.make()

        QRimg = QRcode.make_image(
            fill_color=self.QRcolor, back_color=self.back_color).convert('RGB')

        if self.logo is not None:
            # set size of QR code
            pos = ((QRimg.size[0] - logo.size[0]) // 2,
                   (QRimg.size[1] - logo.size[1]) // 2)
            QRimg.paste(logo, pos)
        self.ready = True
        self.img = QRimg

    def get_image(self):
        return self.img


def test():
    qr = QRCodeGenerator('https://youtu.be/aircAruvnKk?si=T2L0xjS8I_HaXexo')
    img = qr.get_image()
    img.show()


if __name__ == '__main__':
    test()

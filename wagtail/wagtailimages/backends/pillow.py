from __future__ import absolute_import

import PIL.Image

from wagtail.wagtailimages.backends.base import BaseImageBackend


class PillowBackend(BaseImageBackend):
    def __init__(self, params):
        super(PillowBackend, self).__init__(params)

    def open_image(self, input_file):
        image = PIL.Image.open(input_file)
        return image

    def save_image(self, image, output, format):
        image.save(output, format, quality=self.quality)

    def resize(self, image, size):
        if image.mode in ['1', 'P']:
            image = image.convert('RGB')
        return image.resize(size, PIL.Image.ANTIALIAS)

    def crop(self, image, crop_box):
        return image.crop(crop_box)

    def image_data_as_rgb(self, image):
        # https://github.com/thumbor/thumbor/blob/f52360dc96eedd9fc914fcf19eaf2358f7e2480c/thumbor/engines/pil.py#L206-L215
        if image.mode not in ['RGB', 'RGBA']:
            if 'A' in image.mode:
                image = image.convert('RGBA')
            else:
                image = image.convert('RGB')

        return image.mode, image.tostring()

    def crop_to_rectangle(self, image, rect):
        (original_width, original_height) = image.size
        (left, top, right, bottom) = rect

        # final dimensions should not exceed original dimensions
        left = max(0, left)
        top = max(0, top)
        right = min(original_width, right)
        bottom = min(original_height, bottom)

        if (left == right ==0 and right == original_width
                and bottom == original_height):
            return image

        return image.crop(
            (left, top, right, bottom)
        )

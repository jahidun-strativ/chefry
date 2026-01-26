import { decode } from "jpeg-js";
import pica from "pica";
import { rgbaToThumbHash, thumbHashToDataURL } from "thumbhash";

function cropMid(src: Uint8Array, width: number, newWidth: number): number[] {
  const blockSize = 4; // rgba
  const dest = new Array(newWidth * newWidth * blockSize);
  const offset = Math.floor(width / 2 - newWidth / 2);

  for (let y = 0; y < newWidth * blockSize; y += blockSize) {
    for (let x = 0; x < (newWidth + offset) * blockSize; x += blockSize) {
      const sI = y * width + x + offset * blockSize;
      const dI = y * newWidth + x;

      new Array(blockSize).fill(null).forEach((_i, i) => {
        dest[dI + i] = src[sI + i];
      });
    }
  }

  return dest as number[];
}

export default async function generateImageThumbhash(mediaUrl: string) {
  const res = await fetch(mediaUrl);
  const arrayBuf = await res.arrayBuffer();
  const decoded = decode(arrayBuf, { useTArray: true });
  const { width, height, data } = decoded;

  const imageWidth = Math.floor((width / height) * 100);

  const resized = await pica().resizeBuffer({
    src: data,
    width,
    height,
    toWidth: imageWidth,
    toHeight: 100,
  });

  // const cropped = cropMid(resized, imageWidth, 100);

  const thumbhash = rgbaToThumbHash(64, 64, resized);

  return thumbHashToDataURL(thumbhash);
}

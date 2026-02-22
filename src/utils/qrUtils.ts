import QRCode from "qrcode";

export async function generateQRCode(data: string): Promise<string> {
  return await QRCode.toDataURL(data, {
    errorCorrectionLevel: "H",
  });
}
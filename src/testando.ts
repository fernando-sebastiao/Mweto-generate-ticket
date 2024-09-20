// import * as printer from "pdf-to-printer";

// const testGetPrinters = async () => {
//   try {
//     const printers = await printer.getPrinters();
//     console.log(printers);
//   } catch (error) {
//     console.error("Erro ao obter impressoras:", error);
//   }
// };
// console.log("Fernando");
// testGetPrinters();

//imprimir
// const fileName =
//     "C:\\Users\\Fernando\\Pictures\\www\\dev bantu\\Mueto\\Mweto\\src\\tmp\\senha_269.pdf"; // Insira o caminho correto do PDF

//   printer
//     .print(fileName, { printer: "HP LaserJet MFP M129-M134" })
//     .then(() => console.log("Impressão enviada com sucesso!"))
//     .catch((err) => console.error("Erro ao imprimir:", err));

const printer = require("pdf-to-printer");

export function imprimir(ticket) {
  const fileName = `C:\\Users\\Fernando\\Pictures\\www\\dev bantu\\Mueto\\Mweto\\src\\tmp\\senha_${ticket}.pdf`;

  printer
    .print(fileName, { printer: "HP LaserJet MFP M129-M134" })
    .then(() => console.log("Impressão enviada com sucesso!"))
    .catch((err) => console.error("Erro ao imprimir:", err));
}

import PanelControlService from "../services/PanelControlService.js";

class PanelControlController {
  static async getCountProductByService(_req, res) {
    const product_by_service = await PanelControlService.getCountProductByService();

    const counts = {};
    let length = 0;
    let totalQuant = 0;

    const typesProductMap = {};
    product_by_service.types_product.forEach((type) => {
      typesProductMap[type.id] = type.name;
    });

    product_by_service.service.forEach((service) => {
      const productName = service.product;
      const typeId = product_by_service.types_product.find(
        (type) => type.name === productName
      )?.id;

      if (typeId) {
        const typeName = typesProductMap[typeId];

        if (!counts[typeName]) {
          counts[typeName] = {
            name: typeName,
            count: 0,
          };
        }

        counts[typeName].count++;
        length++;
        totalQuant += 1;
      }
    });

    return res
      .status(200)
      .json({ length: length, quantTotality: totalQuant, values: counts });
  }

  static async getCountStatusByService(_req, res) {
    const status_by_service = await PanelControlService.getCountStatusByService();

    const counts = {};
    let length = 0;
    let totalQuant = 0;

    const statusServiceMap = {};
    status_by_service.status_service.forEach((status) => {
      statusServiceMap[status.cod] = {
        description: status.description,
        color: JSON.parse(status.color).hex,
      };
    });

    status_by_service.service.forEach((service) => {
      const statusCod = service.status;
      const statusInfo = statusServiceMap[statusCod];

      if (statusInfo) {
        if (statusInfo.description !== "Concluído") {
          if (!counts[statusCod]) {
            counts[statusCod] = {
              cod: statusCod,
              description: statusInfo.description,
              color: statusInfo.color,
              count: 0,
            };
          }

          counts[statusCod].count++;
          length++;
          totalQuant += 1;
        }
      }
    });

    const countsArray = Object.values(counts);

    return res
      .status(200)
      .json({ length: length, inProcessing: totalQuant, values: countsArray });
  }

  static async getCountStatusPaymentByService(_req, res) {
    const status_payment_by_service =
      await PanelControlService.getCountStatusPaymentByService();

    const counts = {};
    let length = 0;

    const statusPaymentMap = {};
    status_payment_by_service.status_payment.forEach((status) => {
      statusPaymentMap[status.cod] = {
        description: status.description,
        color: JSON.parse(status.color).hex,
      };
    });

    status_payment_by_service.service.forEach((service) => {
      const statusCod = service.status;
      const statusInfo = statusPaymentMap[statusCod];

      if (statusInfo) {
        if (statusInfo.description !== "Pago") {
          if (!counts[statusCod]) {
            counts[statusCod] = {
              cod: statusCod,
              description: statusInfo.description,
              color: statusInfo.color,
              count: 0,
            };
          }

          counts[statusCod].count++;
          length++;
        }
      }
    });

    const countsArray = Object.values(counts);

    return res.status(200).json({ length: length, values: countsArray });
  }

  static async getInfoPerformaceYearly(_req, res) {
    const info_performace = await PanelControlService.getInfoPerformaceYearly();

    const totalServicesByMonth = new Array(12).fill(0);
    const completedServicesByMonth = new Array(12).fill(0);
    const paidServicesByMonth = new Array(12).fill(0);

    info_performace.service.forEach((service) => {
      const month = service.month;
      totalServicesByMonth[month]++;

      const statusServiceMap = {};
      const statusPaymentMap = {};

      info_performace.status_service.forEach((status) => {
        statusServiceMap[status.cod] = {
          description: status.description,
        };
      });
      info_performace.status_payment.forEach((status) => {
        statusPaymentMap[status.cod] = {
          description: status.description,
        };
      });

      const statusCodService = service.status;
      const statusInfoService = statusServiceMap[statusCodService];
      if (statusInfoService) {
        if (
          statusInfoService.description === "Concluído"
        ) {
          completedServicesByMonth[month]++;
        }
      }

      const statusCodPayment = service.status_payment;
      const statusInfoPayment = statusPaymentMap[statusCodPayment];
      if (statusInfoPayment) {
        if (
          statusInfoPayment.description === "Pago"
        ) {
          paidServicesByMonth[month]++;
        }
      }
    });

    return res.status(200).json({
      requested: totalServicesByMonth,
      concluded: completedServicesByMonth,
      paid: paidServicesByMonth,
    });
  }
}

export const getCountProductByService = (req, res) => PanelControlController.getCountProductByService(req, res);
export const getCountStatusByService = (req, res) => PanelControlController.getCountStatusByService(req, res);
export const getCountStatusPaymentByService = (req, res) => PanelControlController.getCountStatusPaymentByService(req, res);
export const getInfoPerformaceYearly = (req, res) => PanelControlController.getInfoPerformaceYearly(req, res);

export default PanelControlController;

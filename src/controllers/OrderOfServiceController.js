import OrderOfServiceService from "../services/OrderOfServiceService.js";
import utilities from "../utils/utils.js";

class OrderOfServiceController {
  static async getAll(req, res) {
    const order_of_service = await OrderOfServiceService.getAll();
    return res.status(200).json(order_of_service);
  }

  static async getUnique(req, res) {
    const { cod } = req.params;
    const order_of_service = await OrderOfServiceService.getUnique(cod);
    return res.status(200).json(order_of_service);
  }

  static async updateEstimate(req, res) {
    const { cod } = req.params;
    if (req.body.type == "completa") {
      const getOrderValue = await OrderOfServiceService.getUnique(cod);
      const id = utilities.generateUuid();
      let estimateArray = null;
      let totalPrice = 0;

      estimateArray = JSON.parse(getOrderValue[0].estimate) || [];
      const newRecord = {
        id: id,
        amount: req.body.amount,
        description: req.body.description,
        price: req.body.price,
      };
      estimateArray.push(newRecord);
      for (const record of estimateArray) {
        totalPrice += record.price;
      }
      estimateArray = JSON.stringify(estimateArray);
      const order_of_service = await OrderOfServiceService.updateEstimate(
        estimateArray,
        totalPrice,
        cod
      );
      return res.status(200).json(order_of_service);
    } else {
      const remove_estimate_simple =
        await OrderOfServiceService.removeEstimateSimple(cod, req.body.id);

      if (remove_estimate_simple) {
        const getOrderValue = await OrderOfServiceService.getUnique(cod);
        const id = utilities.generateUuid();
        let estimateArray = null;
        let totalPrice = 0;

        estimateArray = JSON.parse(getOrderValue[0].estimate) || [];
        const newRecord = {
          id: id,
          amount: req.body.amount,
          description: req.body.description,
          price: req.body.price,
        };
        estimateArray.push(newRecord);
        for (const record of estimateArray) {
          totalPrice += record.price;
        }
        estimateArray = JSON.stringify(estimateArray);
        const order_of_service = await OrderOfServiceService.updateEstimate(
          estimateArray,
          totalPrice,
          cod
        );
        return res.status(200).json(order_of_service);
      }
      return res.status(433).json();
    }
  }

  static async removeEstimate(req, res) {
    const { cod, idEstimate } = req.params;
    const order_of_service = await OrderOfServiceService.removeEstimate(
      cod,
      idEstimate
    );
    return res.status(204).json(order_of_service);
  }
}

export const getAll = (req, res) => OrderOfServiceController.getAll(req, res);
export const getUnique = (req, res) => OrderOfServiceController.getUnique(req, res);
export const updateEstimate = (req, res) => OrderOfServiceController.updateEstimate(req, res);
export const removeEstimate = (req, res) => OrderOfServiceController.removeEstimate(req, res);

export default OrderOfServiceController;

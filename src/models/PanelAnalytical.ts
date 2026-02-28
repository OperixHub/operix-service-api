// @ts-nocheck
import services from "./Services.js";
import order_of_service from "./OrderOfService.js";
import expenses from "./Expenses.js";

const getOrdersPaid = async () => {
  try {
    const services_paid = await services.getAllPaid()
    const all_order_of_service = await order_of_service.getAll()

    const data = {
      services_paid,
      all_order_of_service
    }

    const orderOfServices = data.services_paid.map(item => item.order_of_service);
    const filteredOrderOfService = data.all_order_of_service.filter(item => orderOfServices.includes(item.cod_order));

    filteredOrderOfService.forEach(order => {
      const servicePaid = data.services_paid.find(service => service.order_of_service === order.cod_order);
      if (servicePaid) {
        order.updated_at = servicePaid.updated_at_payment;
      }
    });

    return filteredOrderOfService

  } catch (error) {
    console.error("Error in getOrdersPaid:", error.message);
    throw error;
  }
};

const loadExpensesAll = async () => {
  try {
    const expensesAll = expenses.getAll();
    return expensesAll
  } catch (error) {
    console.error("Error in getOrdersPaid:", error.message);
    return null
  }
}

export default {
  loadExpensesAll,
  getOrdersPaid,
};

import api from "./baseApi";
// Payment method types
export type PaymentMethod = 'momo' | 'payos';

// Interface for create payment request
export interface PaymentTicketType {
    ticket_id: number;
    ticketTypeName: string;
    quantity: number;
    price: number;
}

export interface CreatePaymentRequest {
  booking_id: string;
  amount: number;
  payment_method?: PaymentMethod;
  ticket_type : PaymentTicketType[]
}

// Interface for create payment response (MoMo)
export interface CreatePaymentResponse {
  payUrl: string;
}

// Interface for PayOS payment response
export interface CreatePayOSPaymentResponse {
  payment_url: string;
  order_code: string;
}

// Interface for check payment callback data
export interface CheckPaymentRequest {
  orderId: string;
  amount: string;
  orderType: string;
  resultCode: number;
  message: string;
  booking_id: string;
  transId: string;
}

// Interface for check payment response
export interface CheckPaymentResponse {
  statusCode: number;
  status: 'completed' | 'failed';
  message: string;
}

export const paymentApi = {
  // Create MoMo payment
  createMomoPayment: async (data: CreatePaymentRequest): Promise<CreatePaymentResponse> => {
    const response = await api.post<CreatePaymentResponse>("/create-payment/momo", data);
    return response.data;
  },

  // Create PayOS payment
  createPayOSPayment: async (data: CreatePaymentRequest): Promise<CreatePayOSPaymentResponse> => {
    const response = await api.post<CreatePayOSPaymentResponse>("/create-payment/payos", data);
    return response.data;
  },

  // Fail payment (cancel/failed payment)
  failPayment: async (orderCode: string): Promise<CheckPaymentResponse> => {
    const data = {
      code: 0,
      desc: 'Failed',
      success: false,
      data: { orderCode: orderCode }
    };
    const response = await api.post<CheckPaymentResponse>("/fail-payment", data);
    return response.data;
  },
  successPayment: async (orderCode: string): Promise<CheckPaymentResponse> => {
    const data = {
      code: 0,
      desc: 'Success',
      success: true,
      data: { orderCode: orderCode }
    };
    const response = await api.post<CheckPaymentResponse>("/success-payment", data);
    return response.data;
  }
};

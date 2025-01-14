import React, { useState, useEffect } from 'react';
import "./AddressSelection.css";
import AddressForm from "./AddressForm";
import PaymentForm from "./PaymentForm";
import creditCardImage from "./assets/creditCardImage2.png";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

const AddressSelectionPage = ({ customer, setCustomer, setCartItems }) => {
  const [addresses, setAddresses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [expandAddress, setExpandAddress] = useState(false);
  const [expandPayment, setExpandPayment] = useState(false);
  const [cartDetails, setCartDetails] = useState({ cart_items: [], total_price: 0 });
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    fetchAddresses();
    fetchPayments();
    fetchCartDetails();
  }, [customer]);

  const fetchAddresses = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/get_address/?customer_id=${customer.id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch addresses");
      }
      const data = await response.json();
      setAddresses(data.addresses);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/get_payment_option/?customer_id=${customer.id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch payments");
      }
      const data = await response.json();
      setPayments(data.payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  const fetchCartDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8000/get_cart/?customer_id=${customer.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cart details');
      }
      const data = await response.json();
      setCartDetails(data);
    } catch (error) {
      console.error('Error fetching cart details:', error);
    }
  };

  const handleAddressSelect = (addressId) => {
    setSelectedAddress(addressId);
  };

  const handlePaymentSelect = (paymentId) => {
    setSelectedPayment(paymentId);
  };
   // Calculate total price from cart items
   const calculateTotalPrice = () => {
    return cartDetails.cart_items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

   // Function to handle order confirmation
   const handleOrderConfirm = async () => {
    try {
      // Send a request to place the order
      const response = await fetch('http://localhost:8000/add_order/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customer.id,
          address_id: selectedAddress.id,
          payment_id: selectedPayment.id,
          total_price: calculateTotalPrice(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }
      toast.success('Order confirmed!', {
        onClose: () => {
          // Redirect to home page after the notification is closed
          navigate("/");
        }
      });
      // If order placed successfully, navigate to the home page
      setCartItems([]);
      navigate("/");
    } catch (error) {
        setErrorMessage('Error placing order. Please try again later.');
      console.error('Error placing order:', error);
    }
  };

  return (
    <div className="address-selection-page">
      <div className="foldable-container">
        <h2 onClick={() => setExpandAddress(!expandAddress)}>
          Select Address{!expandAddress ? "▶️" : "🔽"}
        </h2>
        <h3 className={selectedAddress ? "selected-address" : ""}>
    {selectedAddress ? `Selected Address: ${selectedAddress.street_address}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.postal_code}, ${selectedAddress.country}` : "No address selected"}
  </h3>
  {expandAddress && (
  <>
    <div className="address-list-container">
      <table className="address-list">
        <tbody>
          {addresses.length > 0 ? (
            addresses.map((address) => (
              <tr key={address.id} className={selectedAddress === address ? "selected-address" : ""}>
                <td onClick={() => handleAddressSelect(address)}>
                  <div className="address-option">
                    <input
                      type="radio"
                      id={`address-${address.id}`}
                      name="address"
                      value={address.id}
                      checked={selectedAddress === address}
                      onChange={() => handleAddressSelect(address)}
                    />
                    <div className="address-details">
                      <i className="fa fa-address-card" aria-hidden="true">&nbsp;</i>
                      <div className="address-details-text">
                        <span>{address.street_address}, {address.city}</span>
                        <span>{address.state}, {address.postal_code}</span>
                        <span>{address.country}</span>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="no-addresses-message" colSpan="2">
                No addresses
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    <AddressForm
      customer={customer}
      setCustomer={setCustomer}
      fetchAddresses={fetchAddresses}
    />
  </>
)}

      </div>
      <div className="foldable-container">
        <h2 onClick={() => setExpandPayment(!expandPayment)}>
          Select Payment{!expandPayment ? "▶️" : "🔽"}
        </h2>
        <h3 className={selectedPayment ? "selected-payment" : ""}>
    {selectedPayment ? `Selected Payment: ${selectedPayment.card_number}, ${selectedPayment.card_holder_name}, ${selectedPayment.expiration_date}` : "No payment selected"}
  </h3>
  {expandPayment && (
  <>
    <div className="payment-list-container">
      <table className="payment-list">
        <tbody>
          {payments.length > 0 ? (
            payments.map((payment) => (
              <tr key={payment.id} className={selectedPayment === payment ? "selected-payment" : ""}>
                <td onClick={() => handlePaymentSelect(payment)}>
                  <div className="payment-option">
                    <input
                      type="radio"
                      id={`payment-${payment.id}`}
                      name="payment"
                      value={payment.id}
                      checked={selectedPayment === payment}
                      onChange={() => handlePaymentSelect(payment)}
                    />
                    <div className="payment-details">
                      <img className="payment-icon" src={creditCardImage} alt="Credit Card" />
                      <div className="payment-details-text">
                        <span>{payment.card_number}</span>
                        <span>{payment.card_holder_name}</span>
                        <span>Expires: {payment.expiration_date}</span>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="no-payments-message" colSpan="2">
                No payment options found!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    <PaymentForm
      customer={customer}
      setCustomer={setCustomer}
      fetchPayments={fetchPayments}
    />
  </>
)}

      </div>

      <div className="cart-details">
  <h2 className="cart-summary-heading">Cart Summary</h2>
  <div className="cart-items">
    {cartDetails.cart_items.map(item => (
      <div key={item.id} className="cart-item-summary">
        <p>{item.name}</p>
        <p>Quantity: {item.quantity}</p>
        <p>Price: ${item.price}</p>
      </div>
    ))}
  </div>
  <p className="cart-total-price">Total Price: ${calculateTotalPrice().toFixed(2)}</p>
</div>

<div className="confirm-order-button">
{errorMessage && <p className="error-message">{errorMessage}</p>}
        <button disabled={!selectedAddress || !selectedPayment} onClick={handleOrderConfirm}>
          Confirm & Order
        </button>
      </div>
    </div>
  );
};

export default AddressSelectionPage;
